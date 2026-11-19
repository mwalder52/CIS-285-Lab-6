import { prisma } from "@/lib/prisma";
import type { AppData, Balance, ExpenseItem, GroupData, Member, PaymentItem } from "@/lib/types";

export const CURRENT_USER_ID = "maya";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBalances(
  expenses: ExpenseItem[],
  payments: PaymentItem[],
): Balance[] {
  const amounts = new Map<string, number>();
  const names = new Map<string, string>();
  const add = (debtorId: string, debtorName: string, creditorId: string, creditorName: string, cents: number) => {
    names.set(debtorId, debtorName);
    names.set(creditorId, creditorName);
    const key = `${debtorId}:${creditorId}`;
    amounts.set(key, (amounts.get(key) ?? 0) + cents);
  };

  for (const expense of expenses) {
    if (expense.status !== "APPROVED") continue;
    for (const share of expense.participants) {
      if (share.id !== expense.payerId) {
        add(share.id, share.name, expense.payerId, expense.payerName, share.amountCents);
      }
    }
  }
  for (const payment of payments) {
    add(payment.payerId, payment.payerName, payment.payeeId, payment.payeeName, -payment.amountCents);
  }

  const balances: Balance[] = [];
  const visited = new Set<string>();
  for (const [key, amount] of amounts) {
    const [debtorId, creditorId] = key.split(":");
    const reverse = `${creditorId}:${debtorId}`;
    if (visited.has(key) || visited.has(reverse)) continue;
    visited.add(key);
    visited.add(reverse);
    const net = amount - (amounts.get(reverse) ?? 0);
    if (net > 0) {
      balances.push({
        debtorId,
        debtorName: names.get(debtorId) ?? "Member",
        creditorId,
        creditorName: names.get(creditorId) ?? "Member",
        amountCents: net,
      });
    } else if (net < 0) {
      balances.push({
        debtorId: creditorId,
        debtorName: names.get(creditorId) ?? "Member",
        creditorId: debtorId,
        creditorName: names.get(debtorId) ?? "Member",
        amountCents: -net,
      });
    }
  }
  return balances.sort((a, b) => b.amountCents - a.amountCents);
}

export async function getAppData(): Promise<AppData> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: CURRENT_USER_ID } });
  const groups = await prisma.group.findMany({
    where: { memberships: { some: { userId: CURRENT_USER_ID } } },
    include: {
      memberships: { include: { user: true } },
      expenses: {
        orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
        include: {
          payer: true,
          creator: true,
          allocations: { include: { participant: true } },
          decisions: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      payments: {
        orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
        include: { payer: true, payee: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const mappedGroups: GroupData[] = groups.map((group) => {
    const members: Member[] = group.memberships.map(({ user: member, role }) => ({
      id: member.id,
      name: member.name,
      initials: initials(member.name),
      email: member.email,
      role,
    }));
    const expenses: ExpenseItem[] = group.expenses.map((expense) => ({
      id: expense.id,
      description: expense.description,
      amountCents: expense.amountCents,
      expenseDate: expense.expenseDate.toISOString(),
      status: expense.status,
      splitType: expense.splitType,
      payerId: expense.payerId,
      payerName: expense.payer.name,
      creatorId: expense.creatorId,
      creatorName: expense.creator.name,
      participants: expense.allocations.map((allocation) => ({
        id: allocation.participantId,
        name: allocation.participant.name,
        amountCents: allocation.amountCents,
        percentageBasisPoints: allocation.percentageBasisPoints,
      })),
      decision: expense.decisions[0]?.decision ?? null,
    }));
    const payments: PaymentItem[] = group.payments.map((payment) => ({
      id: payment.id,
      amountCents: payment.amountCents,
      paymentDate: payment.paymentDate.toISOString(),
      payerId: payment.payerId,
      payerName: payment.payer.name,
      payeeId: payment.payeeId,
      payeeName: payment.payee.name,
      note: payment.note,
    }));
    return {
      id: group.id,
      name: group.name,
      currencyCode: group.currencyCode,
      members,
      expenses,
      payments,
      balances: getBalances(expenses, payments),
    };
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: CURRENT_USER_ID },
    include: { group: true, expense: { include: { creator: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return {
    currentUser: {
      id: user.id,
      name: user.name,
      initials: initials(user.name),
      email: user.email,
      role: "MEMBER",
    },
    groups: mappedGroups,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      groupName: notification.group.name,
      description: notification.expense.description,
      creatorName: notification.expense.creator.name,
      createdAt: notification.createdAt.toISOString(),
    })),
  };
}

export function getPairDebt(group: GroupData, debtorId: string, creditorId: string) {
  return group.balances.find(
    (balance) => balance.debtorId === debtorId && balance.creditorId === creditorId,
  )?.amountCents ?? 0;
}

export function balanceFromRecords(
  expenses: { status: string; payerId: string; allocations: { participantId: string; amountCents: number }[] }[],
  payments: { payerId: string; payeeId: string; amountCents: number }[],
  debtorId: string,
  creditorId: string,
) {
  let net = 0;
  for (const expense of expenses) {
    if (expense.status !== "APPROVED") continue;
    for (const allocation of expense.allocations) {
      if (allocation.participantId === debtorId && expense.payerId === creditorId) net += allocation.amountCents;
      if (allocation.participantId === creditorId && expense.payerId === debtorId) net -= allocation.amountCents;
    }
  }
  for (const payment of payments) {
    if (payment.payerId === debtorId && payment.payeeId === creditorId) net -= payment.amountCents;
    if (payment.payerId === creditorId && payment.payeeId === debtorId) net += payment.amountCents;
  }
  return Math.max(0, net);
}
