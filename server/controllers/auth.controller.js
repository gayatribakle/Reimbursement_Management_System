const { prisma } = require('../config/db');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const axios = require('axios');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.utils');

// In-memory cache for country -> currency
const countryCurrencyCache = new Map();

// Validation Schemas
const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  country: z.string().min(2, 'Country code is required'), // e.g. "US"
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

exports.signup = async (req, res) => {
  const parsed = signupSchema.parse(req.body);
  const { name, email, password, companyName, country } = parsed;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  let currency = 'USD'; // fallback
  if (countryCurrencyCache.has(country.toUpperCase())) {
    currency = countryCurrencyCache.get(country.toUpperCase());
  } else {
    try {
      const response = await axios.get(`${process.env.COUNTRIES_API_URL}`, { timeout: 5000 });
      const countriesList = response.data;
      // The API returns all. We find the one matching the ISO code roughly or just fetch by alpha code.
      // Easiest is to search by the cca2/cca3 if the user gave ISO. Let's assume the user gives ISO code like "US" or "IN".
      const countryData = countriesList.find(c => 
        (c.cca2 && c.cca2.toUpperCase() === country.toUpperCase()) || 
        (c.name && c.name.common && c.name.common.toUpperCase() === country.toUpperCase())
      );
      if (countryData && countryData.currencies) {
        currency = Object.keys(countryData.currencies)[0];
        countryCurrencyCache.set(country.toUpperCase(), currency);
      }
    } catch (err) {
      console.warn('Failed to fetch country currency, defaulting to USD');
    }
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const { user } = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: companyName, currency: currency.toUpperCase() },
    });

    const admin = await tx.user.create({
      data: {
        companyId: company.id,
        name,
        email,
        passwordHash,
        role: 'ADMIN',
      },
    });

    return { company, user: admin };
  });

  const accessToken = generateAccessToken({ id: user.id, role: user.role, companyId: user.companyId });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  res.status(201).json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
    accessToken,
  });
};

exports.login = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role, companyId: user.companyId });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
    accessToken,
  });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    const err = new Error('Unauthorized'); err.statusCode = 401; throw err;
  }
  
  const jwt = require('jsonwebtoken');
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch(e) {
    const err = new Error('Invalid or expired token'); err.statusCode = 401; throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== refreshToken) {
    const err = new Error('Unauthorized'); err.statusCode = 401; throw err;
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role, companyId: user.companyId });
  res.json({ success: true, accessToken });
};

exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true, companyId: true, isManagerApprover: true,
      managerId: true, createdAt: true, updatedAt: true,
      company: true
    }
  });

  if (!user) {
    const err = new Error('User not found'); err.statusCode = 404; throw err;
  }

  res.json({
    success: true,
    user,
  });
};

exports.logout = async (req, res) => {
  if (req.user && req.user.id) {
    await prisma.user.updateMany({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });
  }

  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
