export type Member = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
};

export type ExpenseItem = {
  id: string;
  description: string;
  amountCents: number;
  expenseDate: string;
  status: string;
  splitType: string;
  payerId: string;
  payerName: string;
  creatorId: string;
  creatorName: string;
  participants: { id: string; name: string; amountCents: number; percentageBasisPoints: number | null }[];
  decision: string | null;
};

export type PaymentItem = {
  id: string;
  amountCents: number;
  paymentDate: string;
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  note: string | null;
};

export type Balance = {
  debtorId: string;
  debtorName: string;
  creditorId: string;
  creditorName: string;
  amountCents: number;
};

export type GroupData = {
  id: string;
  name: string;
  currencyCode: string;
  members: Member[];
  expenses: ExpenseItem[];
  payments: PaymentItem[];
  balances: Balance[];
};

export type NotificationItem = {
  id: string;
  groupName: string;
  description: string;
  creatorName: string;
  createdAt: string;
};

export type AppData = {
  currentUser: Member;
  groups: GroupData[];
  notifications: NotificationItem[];
};
