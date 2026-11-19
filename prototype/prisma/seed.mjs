import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const daysAgo = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const users = [
  { id: "maya", name: "Maya Torres", email: "maya@example.test" },
  { id: "theo", name: "Theo Bennett", email: "theo@example.test" },
  { id: "priya", name: "Priya Shah", email: "priya@example.test" },
  { id: "alex", name: "Alex Morgan", email: "alex@example.test" },
  { id: "jordan", name: "Jordan Lee", email: "jordan@example.test" },
];

const groups = [
  { id: "casa-sol", name: "Casa Sol", currencyCode: "USD", members: ["maya", "theo", "priya", "alex"] },
  { id: "weekend-away", name: "Weekend away", currencyCode: "USD", members: ["maya", "theo", "priya", "jordan"] },
];

const expenses = [
  {
    id: "sample-groceries", groupId: "casa-sol", creatorId: "theo", payerId: "theo",
    description: "Weekly groceries", amountCents: 24800, expenseDate: daysAgo(1), splitType: "EQUAL", status: "APPROVED",
    allocations: [
      { participantId: "maya", amountCents: 6200, percentageBasisPoints: null },
      { participantId: "theo", amountCents: 6200, percentageBasisPoints: null },
      { participantId: "priya", amountCents: 6200, percentageBasisPoints: null },
      { participantId: "alex", amountCents: 6200, percentageBasisPoints: null },
    ],
  },
  {
    id: "sample-wifi", groupId: "casa-sol", creatorId: "maya", payerId: "maya",
    description: "Monthly Wi-Fi", amountCents: 6400, expenseDate: daysAgo(4), splitType: "EQUAL", status: "APPROVED",
    allocations: [
      { participantId: "maya", amountCents: 3200, percentageBasisPoints: null },
      { participantId: "alex", amountCents: 3200, percentageBasisPoints: null },
    ],
  },
  {
    id: "sample-dinner", groupId: "casa-sol", creatorId: "priya", payerId: "priya",
    description: "Dinner on Friday", amountCents: 12650, expenseDate: daysAgo(7), splitType: "PERCENTAGE", status: "APPROVED",
    allocations: [
      { participantId: "maya", amountCents: 4430, percentageBasisPoints: 3500 },
      { participantId: "theo", amountCents: 4430, percentageBasisPoints: 3500 },
      { participantId: "priya", amountCents: 3790, percentageBasisPoints: 3000 },
    ],
  },
  {
    id: "sample-coffee", groupId: "casa-sol", creatorId: "theo", payerId: "theo",
    description: "Coffee machine filters", amountCents: 1840, expenseDate: daysAgo(0), splitType: "EQUAL", status: "PENDING",
    allocations: [
      { participantId: "maya", amountCents: 920, percentageBasisPoints: null },
      { participantId: "theo", amountCents: 920, percentageBasisPoints: null },
    ],
  },
  {
    id: "sample-hotel", groupId: "weekend-away", creatorId: "maya", payerId: "maya",
    description: "Cabin for the weekend", amountCents: 36000, expenseDate: daysAgo(12), splitType: "EQUAL", status: "APPROVED",
    allocations: [
      { participantId: "maya", amountCents: 9000, percentageBasisPoints: null },
      { participantId: "theo", amountCents: 9000, percentageBasisPoints: null },
      { participantId: "priya", amountCents: 9000, percentageBasisPoints: null },
      { participantId: "jordan", amountCents: 9000, percentageBasisPoints: null },
    ],
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({ where: { id: user.id }, create: user, update: {} });
  }
  for (const group of groups) {
    await prisma.group.upsert({
      where: { id: group.id },
      create: { id: group.id, name: group.name, currencyCode: group.currencyCode },
      update: {},
    });
    for (const userId of group.members) {
      await prisma.membership.upsert({
        where: { groupId_userId: { groupId: group.id, userId } },
        create: { id: `member-${group.id}-${userId}`, groupId: group.id, userId, role: userId === "maya" ? "OWNER" : "MEMBER" },
        update: {},
      });
    }
  }
  for (const expense of expenses) {
    const { allocations, ...record } = expense;
    await prisma.expense.upsert({
      where: { id: expense.id },
      create: record,
      update: {},
    });
    for (const allocation of allocations) {
      await prisma.expenseAllocation.upsert({
        where: { expenseId_participantId: { expenseId: expense.id, participantId: allocation.participantId } },
        create: { id: `allocation-${expense.id}-${allocation.participantId}`, expenseId: expense.id, ...allocation },
        update: {},
      });
    }
  }
  const seededPayments = [
    { id: "sample-payment-home", groupId: "casa-sol", payerId: "maya", payeeId: "theo", amountCents: 2000, paymentDate: daysAgo(0), note: "Sent via demo" },
    { id: "sample-payment-trip", groupId: "weekend-away", payerId: "priya", payeeId: "maya", amountCents: 3000, paymentDate: daysAgo(3), note: "Cabin deposit" },
  ];
  for (const payment of seededPayments) {
    await prisma.payment.upsert({ where: { id: payment.id }, create: payment, update: {} });
  }
  const notifications = [
    { id: "sample-notification-coffee", groupId: "casa-sol", expenseId: "sample-coffee", userId: "maya" },
    { id: "sample-notification-groceries", groupId: "casa-sol", expenseId: "sample-groceries", userId: "maya" },
  ];
  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { expenseId_userId: { expenseId: notification.expenseId, userId: notification.userId } },
      create: notification,
      update: {},
    });
  }
  await prisma.expenseDecision.upsert({
    where: { expenseId_reviewerId: { expenseId: "sample-wifi", reviewerId: "priya" } },
    create: { id: "decision-sample-wifi", expenseId: "sample-wifi", reviewerId: "priya", decision: "APPROVED" },
    update: {},
  });
}

main()
  .catch((error) => {
    console.error("Could not seed SplitSmart demo data:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
