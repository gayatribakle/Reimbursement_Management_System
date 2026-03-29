const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clear existing data in reverse order of dependencies
  await prisma.approvalLog.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.approvalRule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.exchangeRateCache.deleteMany();
  
  console.log('🧹 Cleaned existing tables.');

  // 2. Constants
  const defaultPassword = 'Hackathon@2026';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 3. Create Company
  const company = await prisma.company.create({
    data: {
      name: 'Meridian Technologies',
      currency: 'USD',
    },
  });

  // 4. Create Users
  const sarah = await prisma.user.create({
    data: { name: 'Sarah', email: 'sarah.chen@meridian.io', passwordHash, role: 'ADMIN', companyId: company.id }
  });

  const raj = await prisma.user.create({
    data: { name: 'Raj', email: 'raj@meridian.io', passwordHash, role: 'MANAGER', isManagerApprover: true, companyId: company.id }
  });

  const priya = await prisma.user.create({
    data: { name: 'Priya', email: 'priya@meridian.io', passwordHash, role: 'MANAGER', companyId: company.id }
  });

  const arjun = await prisma.user.create({
    data: { name: 'Arjun', email: 'arjun@meridian.io', passwordHash, role: 'EMPLOYEE', managerId: raj.id, companyId: company.id }
  });

  const lena = await prisma.user.create({
    data: { name: 'Lena', email: 'lena@meridian.io', passwordHash, role: 'EMPLOYEE', managerId: raj.id, companyId: company.id }
  });

  const omar = await prisma.user.create({
    data: { name: 'Omar', email: 'omar@meridian.io', passwordHash, role: 'EMPLOYEE', managerId: priya.id, companyId: company.id }
  });

  const vikram = await prisma.user.create({
    data: { name: 'Vikram Shah', email: 'vikram@meridian.io', passwordHash, role: 'FINANCE', companyId: company.id }
  });

  const neha = await prisma.user.create({
    data: { name: 'Neha Gupta', email: 'neha@meridian.io', passwordHash, role: 'DIRECTOR', companyId: company.id }
  });

  // 5. Create Rules
  const standardRule = await prisma.approvalRule.create({
    data: {
      companyId: company.id,
      name: 'Standard Sequential',
      ruleType: 'SEQUENTIAL',
      isDefault: true,
      steps: {
        create: [
          { stepOrder: 1, approverId: raj.id },
          { stepOrder: 2, approverId: sarah.id }
        ]
      }
    }
  });

  const quickRule = await prisma.approvalRule.create({
    data: {
      companyId: company.id,
      name: 'Quick 60%',
      ruleType: 'PERCENTAGE',
      percentageThreshold: 60,
      steps: {
        create: [
          { stepOrder: 1, approverId: raj.id },
          { stepOrder: 2, approverId: vikram.id },
          { stepOrder: 3, approverId: neha.id },
          { stepOrder: 4, approverId: sarah.id }
        ]
      }
    }
  });

  const cfoRule = await prisma.approvalRule.create({
    data: {
      companyId: company.id,
      name: 'CFO Hybrid',
      ruleType: 'HYBRID',
      percentageThreshold: 70,
      specificApproverId: sarah.id,
      steps: {
        create: [
          { stepOrder: 1, approverId: priya.id },
          { stepOrder: 2, approverId: raj.id },
          { stepOrder: 3, approverId: sarah.id }
        ]
      }
    }
  });

  // 6. Create 8 Expenses
  const expensesData = [
    {
      employeeId: arjun.id, companyId: company.id, amount: 150.00, originalCurrency: 'USD', convertedAmount: 150.00, companyCurrency: 'USD', exchangeRate: 1.0,
      category: 'TRAVEL', description: 'Flight to NY', date: new Date('2026-03-01'), status: 'PENDING', approvalRuleId: standardRule.id
    },
    {
      employeeId: arjun.id, companyId: company.id, amount: 45.50, originalCurrency: 'USD', convertedAmount: 45.50, companyCurrency: 'USD', exchangeRate: 1.0,
      category: 'FOOD', description: 'Client Lunch', date: new Date('2026-03-05'), status: 'APPROVED', approvalRuleId: standardRule.id
    },
    {
      employeeId: lena.id, companyId: company.id, amount: 500.00, originalCurrency: 'EUR', convertedAmount: 540.00, companyCurrency: 'USD', exchangeRate: 1.08,
      category: 'ACCOMMODATION', description: 'Hotel in Paris', date: new Date('2026-03-10'), status: 'REJECTED', rejectionReason: 'Out of policy', approvalRuleId: cfoRule.id
    },
    {
      employeeId: lena.id, companyId: company.id, amount: 120.00, originalCurrency: 'USD', convertedAmount: 120.00, companyCurrency: 'USD', exchangeRate: 1.0,
      category: 'OFFICE_SUPPLIES', description: 'Standing Desk Converter', date: new Date('2026-03-12'), status: 'CANCELLED', approvalRuleId: standardRule.id
    },
    {
      employeeId: omar.id, companyId: company.id, amount: 300.00, originalCurrency: 'GBP', convertedAmount: 375.00, companyCurrency: 'USD', exchangeRate: 1.25,
      category: 'TRAINING', description: 'React Advanced Course', date: new Date('2026-03-15'), status: 'PENDING', approvalRuleId: quickRule.id
    },
    {
      employeeId: omar.id, companyId: company.id, amount: 85.00, originalCurrency: 'USD', convertedAmount: 85.00, companyCurrency: 'USD', exchangeRate: 1.0,
      category: 'MEDICAL', description: 'Annual Checkup', date: new Date('2026-03-18'), status: 'APPROVED', approvalRuleId: quickRule.id
    },
    {
      employeeId: arjun.id, companyId: company.id, amount: 1000.00, originalCurrency: 'AED', convertedAmount: 272.00, companyCurrency: 'USD', exchangeRate: 0.272,
      category: 'ENTERTAINMENT', description: 'Team Eventing Dubai', date: new Date('2026-03-20'), status: 'PENDING', approvalRuleId: cfoRule.id
    },
    {
      employeeId: lena.id, companyId: company.id, amount: 65.00, originalCurrency: 'USD', convertedAmount: 65.00, companyCurrency: 'USD', exchangeRate: 1.0,
      category: 'UTILITIES', description: 'Internet Bill', date: new Date('2026-03-22'), status: 'APPROVED', approvalRuleId: standardRule.id
    }
  ];

  await prisma.expense.createMany({ data: expensesData });

  // 7. Add Approval Logs for the approved/rejected ones
  const allExpenses = await prisma.expense.findMany();
  
  for (const exp of allExpenses) {
    if (exp.status === 'APPROVED') {
      await prisma.approvalLog.create({
        data: { expenseId: exp.id, approverId: sarah.id, action: 'APPROVED', comment: 'Looks good', stepIndex: 0 }
      });
    } else if (exp.status === 'REJECTED') {
      await prisma.approvalLog.create({
        data: { expenseId: exp.id, approverId: raj.id, action: 'REJECTED', comment: exp.rejectionReason, stepIndex: 0 }
      });
    }
  }

  // 8. ExchangeRateCache
  const oneHourLater = new Date();
  oneHourLater.setHours(oneHourLater.getHours() + 1);

  await prisma.exchangeRateCache.createMany({
    data: [
      { baseCurrency: 'USD', rates: { INR: 83.0, EUR: 0.92, AED: 3.67, GBP: 0.8 }, expiresAt: oneHourLater },
      { baseCurrency: 'EUR', rates: { USD: 1.08, INR: 90.0 }, expiresAt: oneHourLater },
      { baseCurrency: 'GBP', rates: { USD: 1.25, EUR: 1.15 }, expiresAt: oneHourLater },
      { baseCurrency: 'AED', rates: { USD: 0.27, EUR: 0.25 }, expiresAt: oneHourLater }
    ]
  });

  // Summary Table
  console.table([
    { Entity: 'Company', Count: await prisma.company.count() },
    { Entity: 'User', Count: await prisma.user.count() },
    { Entity: 'ApprovalRule', Count: await prisma.approvalRule.count() },
    { Entity: 'ApprovalStep', Count: await prisma.approvalStep.count() },
    { Entity: 'Expense', Count: await prisma.expense.count() },
    { Entity: 'ApprovalLog', Count: await prisma.approvalLog.count() },
    { Entity: 'ExchangeRateCache', Count: await prisma.exchangeRateCache.count() }
  ]);

  console.log('✅ Seed Data Completed Successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
