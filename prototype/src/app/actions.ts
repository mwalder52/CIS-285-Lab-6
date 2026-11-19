"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { balanceFromRecords, CURRENT_USER_ID, getAppData } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import type { AppData } from "@/lib/types";

type ActionResult = { ok: true; data: AppData } | { ok: false; error: string };

function readDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  if (value > new Date().toISOString().slice(0, 10)) return null;
  return date;
}

function readAmount(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d{1,7}(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

function failure(error: string): ActionResult {
  return { ok: false, error };
}

async function success(): Promise<ActionResult> {
  revalidatePath("/");
  return { ok: true, data: await getAppData() };
}

function splitCents(amountCents: number, weights: { id: string; weight: number; percentageBasisPoints: number | null }[]) {
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  const shares = weights.map((item) => {
    const numerator = amountCents * item.weight;
    return { ...item, amountCents: Math.floor(numerator / totalWeight), remainder: numerator % totalWeight };
  });
  const remainder = amountCents - shares.reduce((sum, item) => sum + item.amountCents, 0);
  const byLargestRemainder = [...shares].sort(
    (a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id),
  );
  for (let index = 0; index < remainder; index += 1) {
    byLargestRemainder[index].amountCents += 1;
  }
  return shares;
}

export async function createExpense(formData: FormData): Promise<ActionResult> {
  const groupId = String(formData.get("groupId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amountCents = readAmount(formData.get("amount"));
  const expenseDate = readDate(formData.get("expenseDate"));
  const payerId = String(formData.get("payerId") ?? "");
  const splitType = String(formData.get("splitType") ?? "EQUAL");
  const participantIds = [...new Set(formData.getAll("participantIds").filter((id): id is string => typeof id === "string"))];

  if (!description || description.length > 100) return failure("Add a description of 1–100 characters.");
  if (!amountCents) return failure("Enter a positive amount with no more than two decimal places.");
  if (!expenseDate) return failure("Choose a valid date that is not in the future.");
  if (splitType !== "EQUAL" && splitType !== "PERCENTAGE") return failure("Choose an equal or percentage split.");
  if (participantIds.length === 0) return failure("Select at least one participant.");

  const group = await prisma.group.findFirst({
    where: { id: groupId, memberships: { some: { userId: CURRENT_USER_ID } } },
    include: { memberships: true },
  });
  if (!group) return failure("That group is unavailable in this demo.");

  const memberIds = new Set(group.memberships.map((membership) => membership.userId));
  if (!memberIds.has(payerId) || participantIds.some((id) => !memberIds.has(id))) {
    return failure("The payer and every participant must be members of this group.");
  }

  const weights = participantIds.map((id) => {
    if (splitType === "EQUAL") return { id, weight: 1, percentageBasisPoints: null as number | null };
    const raw = formData.get(`percentage-${id}`);
    const value = typeof raw === "string" && /^\d{1,3}(?:\.\d{1,2})?$/.test(raw) ? Number(raw) : NaN;
    return { id, weight: Number.isFinite(value) ? Math.round(value * 100) : -1, percentageBasisPoints: Number.isFinite(value) ? Math.round(value * 100) : null };
  });
  if (weights.some((weight) => weight.weight < 0) || (splitType === "PERCENTAGE" && weights.reduce((sum, item) => sum + item.weight, 0) !== 10_000)) {
    return failure("Percentage shares must be nonnegative and total exactly 100%.");
  }
  const shares = splitCents(amountCents, weights);
  const expenseId = randomUUID();

  await prisma.$transaction(async (transaction) => {
    await transaction.expense.create({
      data: {
        id: expenseId,
        groupId,
        creatorId: CURRENT_USER_ID,
        payerId,
        description,
        amountCents,
        expenseDate,
        splitType,
        status: "PENDING",
        allocations: {
          create: shares.map((share) => ({
            id: randomUUID(),
            participantId: share.id,
            amountCents: share.amountCents,
            percentageBasisPoints: share.percentageBasisPoints,
          })),
        },
      },
    });
    await transaction.notification.createMany({
      data: group.memberships
        .filter((membership) => membership.userId !== CURRENT_USER_ID)
        .map((membership) => ({
          id: randomUUID(),
          groupId,
          expenseId,
          userId: membership.userId,
        })),
    });
  });
  return success();
}

export async function reviewExpense(formData: FormData): Promise<ActionResult> {
  const expenseId = String(formData.get("expenseId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "APPROVED" && decision !== "REJECTED") return failure("Choose approve or reject.");
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { group: { include: { memberships: true } } },
  });
  if (!expense || !expense.group.memberships.some((membership) => membership.userId === CURRENT_USER_ID)) {
    return failure("This expense is unavailable in the demo.");
  }
  if (expense.status !== "PENDING") return failure("This expense has already been reviewed.");
  if (expense.creatorId === CURRENT_USER_ID) return failure("You cannot review an expense you submitted.");

  const reviewed = await prisma.$transaction(async (transaction) => {
    const update = await transaction.expense.updateMany({
      where: { id: expenseId, status: "PENDING" },
      data: { status: decision },
    });
    if (update.count !== 1) return false;
    await transaction.expenseDecision.create({
      data: {
        id: randomUUID(),
        expenseId,
        reviewerId: CURRENT_USER_ID,
        decision,
      },
    });
    return true;
  });
  if (!reviewed) return failure("This expense was reviewed by someone else. Refresh and try again.");
  return success();
}

export async function recordPayment(formData: FormData): Promise<ActionResult> {
  const groupId = String(formData.get("groupId") ?? "");
  const payerId = String(formData.get("payerId") ?? "");
  const payeeId = String(formData.get("payeeId") ?? "");
  const amountCents = readAmount(formData.get("amount"));
  const paymentDate = readDate(formData.get("paymentDate"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 100);
  if (!amountCents) return failure("Enter a positive amount with no more than two decimal places.");
  if (!paymentDate) return failure("Choose a valid payment date that is not in the future.");
  if (payerId === payeeId) return failure("Choose two different members for the payment.");

  const group = await prisma.group.findFirst({
    where: { id: groupId, memberships: { some: { userId: CURRENT_USER_ID } } },
    include: { memberships: true },
  });
  if (!group) return failure("That group is unavailable in this demo.");
  const memberIds = new Set(group.memberships.map((membership) => membership.userId));
  if (!memberIds.has(payerId) || !memberIds.has(payeeId)) return failure("Both people must belong to this group.");

  const recorded = await prisma.$transaction(async (transaction) => {
    const records = await transaction.group.findUniqueOrThrow({
      where: { id: groupId },
      include: { expenses: { include: { allocations: true } }, payments: true },
    });
    const owed = balanceFromRecords(records.expenses, records.payments, payerId, payeeId);
    if (amountCents > owed) return false;
    await transaction.payment.create({
      data: {
        id: randomUUID(),
        groupId,
        payerId,
        payeeId,
        amountCents,
        paymentDate,
        note: note || null,
      },
    });
    return true;
  });
  if (!recorded) {
    const records = await prisma.group.findUniqueOrThrow({
      where: { id: groupId },
      include: { expenses: { include: { allocations: true } }, payments: true },
    });
    const owed = balanceFromRecords(records.expenses, records.payments, payerId, payeeId);
    return failure(`That is more than the current balance of ${new Intl.NumberFormat("en-US", { style: "currency", currency: group.currencyCode }).format(owed / 100)}.`);
  }
  return success();
}
