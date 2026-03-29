const axios = require('axios');
const { prisma } = require('../config/db');

const getExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;

  const now = new Date();
  
  // 1. Check cache
  const cached = await prisma.exchangeRateCache.findUnique({
    where: { baseCurrency: fromCurrency }
  });

  if (cached && cached.expiresAt > now && cached.rates[toCurrency]) {
    return cached.rates[toCurrency];
  }

  // 3. Fetch from API if expired or missing
  try {
    const url = `${process.env.EXCHANGE_RATE_BASE_URL}/${fromCurrency}`;
    const response = await axios.get(url, { timeout: 5000 });
    const rates = response.data.rates;

    // 4. Save/update cache
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    await prisma.exchangeRateCache.upsert({
      where: { baseCurrency: fromCurrency },
      update: { rates, fetchedAt: now, expiresAt },
      create: { baseCurrency: fromCurrency, rates, fetchedAt: now, expiresAt }
    });

    return rates[toCurrency] || 1;
  } catch (error) {
    console.warn(`[ExchangeRate] Failed to fetch rate for ${fromCurrency} to ${toCurrency}:`, error.message);
    // 5. Use last cached if available, else 1
    if (cached && cached.rates && cached.rates[toCurrency]) {
      return cached.rates[toCurrency];
    }
    return 1;
  }
};

const convertAmount = async (amount, fromCurrency, toCurrency) => {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = amount * rate;
  return {
    convertedAmount: parseFloat(convertedAmount.toFixed(2)),
    rate: parseFloat(rate.toFixed(6))
  };
};

module.exports = { getExchangeRate, convertAmount };
