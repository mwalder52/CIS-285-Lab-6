"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createExpense, recordPayment, reviewExpense } from "@/app/actions";
import type { AppData, Balance, ExpenseItem, GroupData, PaymentItem } from "@/lib/types";

type Section = "Overview" | "Groups" | "Activity" | "Reports";
type Modal = "expense" | "payment" | null;

const icons: Record<string, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  groups: <><circle cx="9" cy="8" r="3" /><path d="M3 19c.5-3 2.5-4.5 6-4.5s5.5 1.5 6 4.5" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 14.8c2.3.6 3.6 2 4 4.2" /></>,
  activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  reports: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 15h2" /><path d="M6 5V3h12v2" /></>,
  receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
};

function Icon({ name, size = 19 }: { name: string; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function fullDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function dateInputValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
}

function Avatar({ name, initials, small = false }: { name: string; initials: string; small?: boolean }) {
  const colors = ["avatar-lilac", "avatar-peach", "avatar-mint", "avatar-blue", "avatar-rose"];
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return <span aria-label={name} className={`avatar ${colors[index]}${small ? " avatar-small" : ""}`}>{initials}</span>;
}

function AvatarStack({ members }: { members: GroupData["members"] }) {
  return <span className="avatar-stack">{members.slice(0, 4).map((member) => <Avatar key={member.id} name={member.name} initials={member.initials} small />)}{members.length > 4 && <span className="avatar avatar-small avatar-more">+{members.length - 4}</span>}</span>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>;
}

function PersonLine({ name, initials, detail, amount, tone }: { name: string; initials: string; detail: string; amount?: string; tone?: "positive" | "negative" }) {
  return <div className="person-line"><Avatar name={name} initials={initials} small /><div className="person-copy"><strong>{name}</strong><span>{detail}</span></div>{amount && <strong className={`person-amount ${tone ?? ""}`}>{amount}</strong>}</div>;
}

function ExpenseRow({ expense, group, onReview }: { expense: ExpenseItem; group: GroupData; onReview?: (id: string, decision: "APPROVED" | "REJECTED") => void }) {
  const payer = group.members.find((member) => member.id === expense.payerId);
  const icon = expense.status === "PENDING" ? "◷" : expense.status === "REJECTED" ? "×" : expense.splitType === "PERCENTAGE" ? "%" : "↗";
  return <div className="expense-row">
    <span className={`expense-icon ${expense.status.toLowerCase()}`}>{icon}</span>
    <div className="expense-copy"><strong>{expense.description}</strong><span>{expense.creatorName} added · paid by {payer?.name ?? expense.payerName} · {shortDate(expense.expenseDate)}</span></div>
    <div className="expense-value"><strong>{money(expense.amountCents, group.currencyCode)}</strong><span className={`status ${expense.status.toLowerCase()}`}>{expense.status === "APPROVED" ? "Approved" : expense.status === "PENDING" ? "Needs review" : "Rejected"}</span></div>
    {onReview && <div className="review-actions"><button aria-label={`Approve ${expense.description}`} className="icon-button approve" onClick={() => onReview(expense.id, "APPROVED")}><Icon name="check" size={16} /></button><button aria-label={`Reject ${expense.description}`} className="icon-button reject" onClick={() => onReview(expense.id, "REJECTED")}><Icon name="close" size={16} /></button></div>}
  </div>;
}

function ActivityRow({ item, group }: { item: ExpenseItem | PaymentItem; group: GroupData }) {
  if ("description" in item) return <ExpenseRow expense={item} group={group} />;
  return <div className="expense-row"><span className="expense-icon payment"><Icon name="arrow" size={18} /></span><div className="expense-copy"><strong>Payment sent to {item.payeeName}</strong><span>{item.note || "Balance payment"} · {shortDate(item.paymentDate)}</span></div><div className="expense-value"><strong>{money(item.amountCents, group.currencyCode)}</strong><span className="status paid">Paid</span></div></div>;
}

function BalanceRow({ balance, onPay }: { balance: Balance; onPay: (balance: Balance) => void }) {
  return <div className="balance-row"><div className="balance-people"><Avatar name={balance.debtorName} initials={balance.debtorName.split(" ").map((part) => part[0]).join("").slice(0, 2)} small /><span>{balance.debtorName}</span><span className="owes-arrow">owes</span><Avatar name={balance.creditorName} initials={balance.creditorName.split(" ").map((part) => part[0]).join("").slice(0, 2)} small /><span>{balance.creditorName}</span></div><strong>{money(balance.amountCents)}</strong><button className="text-button" onClick={() => onPay(balance)}>Record payment</button></div>;
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section aria-labelledby="modal-title" aria-modal="true" className="modal" role="dialog"><div className="modal-head"><div><p className="eyebrow">SPLITSMART DEMO</p><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>{children}</section></div>;
}

export default function SplitSmart({ initialData }: { initialData: AppData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [section, setSection] = useState<Section>("Overview");
  const [activeGroupId, setActiveGroupId] = useState(initialData.groups[0]?.id ?? "");
  const [modal, setModal] = useState<Modal>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [expenseGroupId, setExpenseGroupId] = useState(initialData.groups[0]?.id ?? "");
  const [splitType, setSplitType] = useState<"EQUAL" | "PERCENTAGE">("EQUAL");
  const [reportStart, setReportStart] = useState(() => dateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [reportEnd, setReportEnd] = useState(() => dateInputValue());
  const [reportApplied, setReportApplied] = useState(false);
  const [paymentGroupId, setPaymentGroupId] = useState(initialData.groups[0]?.id ?? "");
  const [paymentPayerId, setPaymentPayerId] = useState(initialData.currentUser.id);
  const [paymentPayeeId, setPaymentPayeeId] = useState(initialData.groups[0]?.members.find((member) => member.id !== initialData.currentUser.id)?.id ?? "");

  const activeGroup = data.groups.find((group) => group.id === activeGroupId) ?? data.groups[0];
  const expenseGroup = data.groups.find((group) => group.id === expenseGroupId) ?? data.groups[0];
  const pending = data.groups.flatMap((group) => group.expenses.filter((expense) => expense.status === "PENDING" && expense.creatorId !== data.currentUser.id).map((expense) => ({ group, expense })));
  const allBalances = data.groups.flatMap((group) => group.balances.map((balance) => ({ ...balance, group })));
  const oweCents = allBalances.filter(({ debtorId }) => debtorId === data.currentUser.id).reduce((sum, balance) => sum + balance.amountCents, 0);
  const owedCents = allBalances.filter(({ creditorId }) => creditorId === data.currentUser.id).reduce((sum, balance) => sum + balance.amountCents, 0);
  const activity = useMemo(() => data.groups.flatMap((group) => [
    ...group.expenses.map((expense) => ({ group, item: expense as ExpenseItem | PaymentItem, date: expense.expenseDate })),
    ...group.payments.map((payment) => ({ group, item: payment as ExpenseItem | PaymentItem, date: payment.paymentDate })),
  ]).sort((a, b) => b.date.localeCompare(a.date)), [data.groups]);
  const reportRows = useMemo(() => data.groups.flatMap((group) => [
    ...group.expenses.filter((expense) => expense.status === "APPROVED").map((expense) => ({ group, kind: "Expense" as const, label: expense.description, date: expense.expenseDate, cents: expense.amountCents })),
    ...group.payments.map((payment) => ({ group, kind: "Payment" as const, label: `${payment.payerName} → ${payment.payeeName}`, date: payment.paymentDate, cents: payment.amountCents })),
  ]).filter((row) => row.date.slice(0, 10) >= reportStart && row.date.slice(0, 10) <= reportEnd).sort((a, b) => b.date.localeCompare(a.date)), [data.groups, reportEnd, reportStart]);
  const navItems: { title: Section; icon: string }[] = [{ title: "Overview", icon: "overview" }, { title: "Groups", icon: "groups" }, { title: "Activity", icon: "activity" }, { title: "Reports", icon: "reports" }];

  function setFreshData(next: AppData) {
    setData(next);
    router.refresh();
  }

  async function submitAction(action: (formData: FormData) => Promise<{ ok: boolean; data?: AppData; error?: string }>, formData: FormData, successMessage: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await action(formData);
      if (!result.ok || !result.data) {
        setError(result.error ?? "That change could not be saved.");
        return false;
      }
      setFreshData(result.data);
      setNotice(successMessage);
      setModal(null);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleReview(expenseId: string, decision: "APPROVED" | "REJECTED") {
    const formData = new FormData();
    formData.set("expenseId", expenseId);
    formData.set("decision", decision);
    await submitAction(reviewExpense, formData, decision === "APPROVED" ? "Expense approved. Balances are up to date." : "Expense rejected. No balances were changed.");
  }

  function openExpense() {
    setError("");
    setNotice("");
    setExpenseGroupId(activeGroup?.id ?? data.groups[0]?.id ?? "");
    setSelectedParticipants([]);
    setSplitType("EQUAL");
    setModal("expense");
  }

  function openPayment(group: GroupData, balance?: Balance) {
    setError("");
    setNotice("");
    setPaymentGroupId(group.id);
    setPaymentPayerId(balance?.debtorId ?? data.currentUser.id);
    setPaymentPayeeId(balance?.creditorId ?? group.members.find((member) => member.id !== data.currentUser.id)?.id ?? "");
    setActiveGroupId(group.id);
    setModal("payment");
  }

  function handleExpenseGroupChange(value: string) {
    setExpenseGroupId(value);
    setSelectedParticipants([]);
  }

  function toggleParticipant(id: string) {
    setSelectedParticipants((current) => current.includes(id) ? current.filter((participant) => participant !== id) : [...current, id]);
  }

  function renderExpenseForm() {
    return <form className="form-stack" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void submitAction(createExpense, new FormData(event.currentTarget), "Expense submitted for review."); }}>
      <label className="field-label">Group<select name="groupId" value={expenseGroupId} onChange={(event) => handleExpenseGroupChange(event.target.value)}>{data.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
      <label className="field-label">What was it for?<input name="description" placeholder="e.g. Dinner at Bar Primi" maxLength={100} required autoFocus /></label>
      <div className="field-row"><label className="field-label">Amount<input aria-label="Amount in dollars" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label><label className="field-label">Date<input name="expenseDate" type="date" defaultValue={dateInputValue()} max={dateInputValue()} required /></label></div>
      <label className="field-label">Paid by<select name="payerId" defaultValue={data.currentUser.id}>{expenseGroup?.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
      <div className="field-label"><span>Split type</span><div className="segmented-control"><button type="button" className={splitType === "EQUAL" ? "selected" : ""} onClick={() => setSplitType("EQUAL")}>Equally</button><button type="button" className={splitType === "PERCENTAGE" ? "selected" : ""} onClick={() => setSplitType("PERCENTAGE")}>By percentage</button></div><input type="hidden" name="splitType" value={splitType} /></div>
      <fieldset className="participants-field"><legend>Who shared this? <span>Select at least one</span></legend>{expenseGroup?.members.map((member) => <label className="participant-choice" key={member.id}><span className="participant-check"><input type="checkbox" name="participantIds" value={member.id} checked={selectedParticipants.includes(member.id)} onChange={() => toggleParticipant(member.id)} /><Avatar name={member.name} initials={member.initials} small /><span>{member.name}{member.id === data.currentUser.id ? " (you)" : ""}</span></span>{splitType === "PERCENTAGE" && selectedParticipants.includes(member.id) && <span className="percent-input"><input aria-label={`${member.name}'s share percentage`} name={`percentage-${member.id}`} type="number" min="0" max="100" step="0.01" defaultValue="0" />%</span>}</label>)}</fieldset>
      <p className="form-hint">New expenses wait for another group member to review before changing balances.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary modal-submit" disabled={busy}>{busy ? <><span className="spinner" /> Saving…</> : "Submit expense"}<Icon name="arrow" size={17} /></button>
    </form>;
  }

  function renderPaymentForm() {
    const initialGroup = data.groups.find((group) => group.id === paymentGroupId) ?? activeGroup;
    return <form className="form-stack" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void submitAction(recordPayment, new FormData(event.currentTarget), "Payment recorded. The balance has been updated."); }}>
      <label className="field-label">Group<select name="groupId" value={paymentGroupId} onChange={(event) => { const group = data.groups.find((item) => item.id === event.target.value); setPaymentGroupId(event.target.value); setPaymentPayerId(data.currentUser.id); setPaymentPayeeId(group?.members.find((member) => member.id !== data.currentUser.id)?.id ?? ""); }}>{data.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
      <div className="field-row"><label className="field-label">Paid by<select name="payerId" value={paymentPayerId} onChange={(event) => { const nextPayerId = event.target.value; setPaymentPayerId(nextPayerId); if (nextPayerId === paymentPayeeId) setPaymentPayeeId(initialGroup?.members.find((member) => member.id !== nextPayerId)?.id ?? ""); }}>{initialGroup?.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><label className="field-label">Paid to<select name="payeeId" value={paymentPayeeId} onChange={(event) => setPaymentPayeeId(event.target.value)}>{initialGroup?.members.filter((member) => member.id !== paymentPayerId).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label></div>
      <div className="field-row"><label className="field-label">Amount<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required autoFocus /></label><label className="field-label">Date<input name="paymentDate" type="date" defaultValue={dateInputValue()} max={dateInputValue()} required /></label></div>
      <label className="field-label">Note <span className="optional">Optional</span><input name="note" maxLength={100} placeholder="e.g. Settling up for dinner" /></label>
      <div className="prototype-note"><Icon name="wallet" size={17} /><span>Demo only: recording a payment updates this prototype’s balance. It does not move real money.</span></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary modal-submit" disabled={busy}>{busy ? <><span className="spinner" /> Saving…</> : "Record payment"}<Icon name="arrow" size={17} /></button>
    </form>;
  }

  function renderGroupDetails(group: GroupData) {
    const groupOwe = group.balances.filter((balance) => balance.debtorId === data.currentUser.id).reduce((sum, balance) => sum + balance.amountCents, 0);
    const groupOwed = group.balances.filter((balance) => balance.creditorId === data.currentUser.id).reduce((sum, balance) => sum + balance.amountCents, 0);
    return <div className="group-detail">
      <div className="group-cover"><div className="group-cover-art"><span>✳</span><span>✦</span><span>✿</span><span>✷</span></div><div className="group-cover-info"><span className="group-tag">YOUR GROUP</span><h2>{group.name}</h2><span>{group.members.length} members · {group.expenses.filter((expense) => expense.status === "APPROVED").length} approved expenses</span></div><button className="button button-light" onClick={openExpense}><Icon name="plus" size={17} /> Add expense</button></div>
      <div className="group-stats"><div><span>You owe</span><strong className={groupOwe ? "amount-negative" : ""}>{money(groupOwe, group.currencyCode)}</strong></div><div><span>Owed to you</span><strong className={groupOwed ? "amount-positive" : ""}>{money(groupOwed, group.currencyCode)}</strong></div><div><span>Members</span><strong>{group.members.length}<AvatarStack members={group.members} /></strong></div></div>
      <div className="detail-grid"><section className="panel"><div className="panel-heading"><div><h3>Group members</h3><span>Everyone in {group.name}</span></div><button className="subtle-button" onClick={() => setNotice("Invites are a demo-only preview.")}>Invite <Icon name="plus" size={15} /></button></div><div className="member-list">{group.members.map((member) => <PersonLine key={member.id} name={member.name} initials={member.initials} detail={member.role === "OWNER" ? "Group owner" : "Member"} />)}</div></section>
        <section className="panel"><div className="panel-heading"><div><h3>Balances</h3><span>Who owes whom</span></div><span className="mini-pill">{group.balances.length} open</span></div>{group.balances.length ? <div className="balance-list">{group.balances.map((balance) => <BalanceRow key={`${balance.debtorId}-${balance.creditorId}`} balance={balance} onPay={(selected) => openPayment(group, selected)} />)}</div> : <div className="empty-state compact"><span className="empty-graphic">✓</span><strong>All settled up</strong><span>No outstanding balances in this group.</span></div>}</section>
      </div>
      <section className="panel group-expenses"><div className="panel-heading"><div><h3>Expenses</h3><span>Latest group activity</span></div><button className="subtle-button" onClick={() => setSection("Activity")}>View all <Icon name="arrow" size={15} /></button></div>{group.expenses.length ? <div className="expense-list">{group.expenses.slice(0, 6).map((expense) => <ExpenseRow key={expense.id} expense={expense} group={group} />)}</div> : <div className="empty-state compact"><span className="empty-graphic">＋</span><strong>No expenses yet</strong><span>Add the first shared expense to get started.</span></div>}</section>
    </div>;
  }

  function renderOverview() {
    const approvedCount = data.groups.reduce((sum, group) => sum + group.expenses.filter((expense) => expense.status === "APPROVED").length, 0);
    const recent = activity.slice(0, 5);
    return <>
      <div className="welcome-row"><div><p className="eyebrow">{todayLabel()}</p><h2>Good evening, {data.currentUser.name.split(" ")[0]} <span className="wave">✦</span></h2><p className="welcome-subtitle">Here’s your shared spending at a glance.</p></div><button className="button button-primary" onClick={openExpense}><Icon name="plus" /> Add an expense</button></div>
      <div className="summary-grid"><article className="summary-card owe-card"><div className="summary-label"><span className="summary-icon"><Icon name="arrow" /></span><span>You owe</span><span className="summary-dot orange" /></div><strong>{money(oweCents)}</strong><span className="summary-foot">{allBalances.filter(({ debtorId }) => debtorId === data.currentUser.id).length} people across your groups</span></article><article className="summary-card owed-card"><div className="summary-label"><span className="summary-icon"><Icon name="wallet" /></span><span>You’re owed</span><span className="summary-dot green" /></div><strong>{money(owedCents)}</strong><span className="summary-foot">{allBalances.filter(({ creditorId }) => creditorId === data.currentUser.id).length} people owe you</span></article><article className="summary-card group-card-stat"><div className="summary-label"><span className="summary-icon"><Icon name="groups" /></span><span>Your groups</span><span className="summary-dot purple" /></div><strong>{data.groups.length}</strong><span className="summary-foot">{approvedCount} shared expenses tracked</span></article></div>
      {pending.length > 0 && <section className="approval-banner"><div className="approval-banner-icon"><Icon name="receipt" /></div><div className="approval-banner-copy"><strong>{pending.length} expense{pending.length === 1 ? "" : "s"} need your review</strong><span>Take a quick look before they update the group balances.</span></div><button className="button button-dark" onClick={() => document.getElementById("approval-list")?.scrollIntoView({ behavior: "smooth", block: "center" })}>Review now <Icon name="arrow" size={16} /></button></section>}
      <div className="dashboard-columns"><section className="panel recent-panel"><div className="panel-heading"><div><h3>Recent activity</h3><span>The latest from all your groups</span></div><button className="subtle-button" onClick={() => setSection("Activity")}>See all <Icon name="arrow" size={15} /></button></div>{recent.length ? <div className="expense-list">{recent.map(({ group, item }) => <ActivityRow key={`${group.id}-${item.id}`} item={item} group={group} />)}</div> : <div className="empty-state"><span className="empty-graphic">✳</span><strong>Your activity will show up here</strong><span>Add a shared expense to start keeping track.</span><button className="text-button" onClick={openExpense}>Add your first expense <Icon name="arrow" size={15} /></button></div>}</section>
        <section className="panel group-list-panel"><div className="panel-heading"><div><h3>Your groups</h3><span>Shared spaces with your people</span></div><button className="subtle-button" onClick={() => setSection("Groups")}>View all <Icon name="arrow" size={15} /></button></div><div className="group-list">{data.groups.map((group, index) => { const owe = group.balances.filter((balance) => balance.debtorId === data.currentUser.id).reduce((sum, balance) => sum + balance.amountCents, 0); const owed = group.balances.filter((balance) => balance.creditorId === data.currentUser.id).reduce((sum, balance) => sum + balance.amountCents, 0); return <button className="group-list-item" key={group.id} onClick={() => { setActiveGroupId(group.id); setSection("Groups"); }}><span className={`group-mark group-mark-${index % 4}`}>{group.name.slice(0, 1)}</span><span className="group-list-copy"><strong>{group.name}</strong><span>{group.members.length} members · {group.expenses.filter((expense) => expense.status === "APPROVED").length} expenses</span></span><span className="group-list-amount">{owe ? <><strong className="amount-negative">−{money(owe, group.currencyCode)}</strong><span>you owe</span></> : owed ? <><strong className="amount-positive">+{money(owed, group.currencyCode)}</strong><span>you’re owed</span></> : <><strong className="amount-neutral">Settled</strong><span>all even</span></>}</span><Icon name="chevron" size={16} /></button>; })}</div></section>
      </div>
      <section className="panel approvals-panel" id="approval-list"><div className="panel-heading"><div><h3>Pending approvals</h3><span>Expenses shared by other members</span></div>{pending.length > 0 && <span className="count-pill">{pending.length} waiting</span>}</div>{pending.length ? <div className="expense-list">{pending.map(({ group, expense }) => <ExpenseRow key={expense.id} expense={expense} group={group} onReview={handleReview} />)}</div> : <div className="empty-state compact"><span className="empty-graphic">✓</span><strong>You’re all caught up</strong><span>New expenses from your group will appear here.</span></div>}</section>
    </>;
  }

  function renderActivity() {
    const byDate = new Map<string, typeof activity>();
    for (const row of activity) {
      const key = row.date.slice(0, 10);
      byDate.set(key, [...(byDate.get(key) ?? []), row]);
    }
    return <><SectionHeading eyebrow="YOUR SHARED SPENDING" title="Activity" action={<button className="button button-primary" onClick={openExpense}><Icon name="plus" /> Add an expense</button>} /><p className="page-description">Every expense and payment across your groups, all in one place.</p>{activity.length ? <div className="panel activity-timeline">{[...byDate].map(([day, rows]) => <section className="timeline-day" key={day}><h3>{fullDate(day)}</h3><div className="expense-list">{rows.map(({ group, item }) => <div className="activity-with-group" key={`${group.id}-${item.id}`}><ActivityRow item={item} group={group} /><span className="activity-group-tag">{group.name}</span></div>)}</div></section>)}</div> : <div className="panel empty-state"><span className="empty-graphic">✳</span><strong>No activity yet</strong><span>Add your first expense to get started.</span><button className="button button-primary" onClick={openExpense}><Icon name="plus" /> Add an expense</button></div>}</>;
  }

  function renderReports() {
    const totalExpenses = reportRows.filter((row) => row.kind === "Expense").reduce((sum, row) => sum + row.cents, 0);
    const totalPayments = reportRows.filter((row) => row.kind === "Payment").reduce((sum, row) => sum + row.cents, 0);
    return <><SectionHeading eyebrow="A CLEARER PICTURE" title="Reports" /><p className="page-description">See how shared spending adds up across your groups.</p><section className="report-filter panel"><div className="report-filter-copy"><span className="filter-icon"><Icon name="calendar" /></span><div><strong>Choose a date range</strong><span>Start and end dates are included.</span></div></div><div className="report-date-fields"><label>From<input type="date" value={reportStart} onChange={(event) => { setReportStart(event.target.value); setReportApplied(false); }} /></label><span>to</span><label>Through<input type="date" value={reportEnd} max={dateInputValue()} onChange={(event) => { setReportEnd(event.target.value); setReportApplied(false); }} /></label><button className="button button-primary" onClick={() => { if (reportStart && reportEnd && reportStart <= reportEnd) { setReportApplied(true); setError(""); } else setError("Choose a valid date range with the start on or before the end."); }}>Run report <Icon name="arrow" size={16} /></button></div></section>{error && !modal && <p className="form-error report-error" role="alert">{error}</p>}{reportApplied && <><div className="report-summary"><article className="report-metric"><span>Shared expenses</span><strong>{money(totalExpenses)}</strong><small>{reportRows.filter((row) => row.kind === "Expense").length} approved expenses</small></article><article className="report-metric"><span>Payments recorded</span><strong>{money(totalPayments)}</strong><small>{reportRows.filter((row) => row.kind === "Payment").length} payments</small></article><article className="report-metric"><span>Activity total</span><strong>{money(totalExpenses + totalPayments)}</strong><small>{reportRows.length} records in this range</small></article></div><section className="panel report-results"><div className="panel-heading"><div><h3>Report details</h3><span>{fullDate(`${reportStart}T00:00:00`)} – {fullDate(`${reportEnd}T00:00:00`)}</span></div><span className="mini-pill">{reportRows.length} records</span></div>{reportRows.length ? <div className="report-table"><div className="report-table-head"><span>DESCRIPTION</span><span>GROUP</span><span>TYPE</span><span>DATE</span><span>AMOUNT</span></div>{reportRows.map((row, index) => <div className="report-table-row" key={`${row.group.id}-${row.kind}-${row.date}-${index}`}><strong>{row.label}</strong><span>{row.group.name}</span><span className={`report-kind ${row.kind.toLowerCase()}`}>{row.kind}</span><span>{shortDate(row.date)}</span><strong>{money(row.cents, row.group.currencyCode)}</strong></div>)}</div> : <div className="empty-state compact"><span className="empty-graphic">⌕</span><strong>No matching records</strong><span>Try a wider date range.</span></div>}</section></>}</>;
  }

  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#" onClick={(event) => { event.preventDefault(); setSection("Overview"); }}><span className="brand-mark">s</span><span>split<span>smart</span></span></a><div className="workspace-label">WORKSPACE</div><nav className="main-nav" aria-label="Main navigation">{navItems.map((item) => <button key={item.title} onClick={() => setSection(item.title)} className={`nav-item ${section === item.title ? "active" : ""}`}><Icon name={item.icon} /><span>{item.title}</span>{item.title === "Groups" && <span className="nav-count">{data.groups.length}</span>}</button>)}</nav><div className="sidebar-group-label"><span>YOUR GROUPS</span><button aria-label="Add group" title="Group creation is a demo preview" onClick={() => setNotice("Group creation is a demo-only preview. Try adding an expense to an existing group.")}>+</button></div><div className="sidebar-groups">{data.groups.map((group, index) => <button className={`sidebar-group ${section === "Groups" && activeGroupId === group.id ? "selected" : ""}`} key={group.id} onClick={() => { setActiveGroupId(group.id); setSection("Groups"); }}><span className={`tiny-group-mark tiny-mark-${index % 4}`}>{group.name.slice(0, 1)}</span><span>{group.name}</span></button>)}</div><div className="sidebar-bottom"><div className="demo-card"><span className="demo-spark">✦</span><strong>Just exploring?</strong><span>This is a demo workspace. Changes are saved here and stay local.</span><button onClick={openExpense}>Try adding an expense <Icon name="arrow" size={14} /></button></div><div className="profile-row"><Avatar name={data.currentUser.name} initials={data.currentUser.initials} small /><div><strong>{data.currentUser.name}</strong><span>Demo account</span></div><span className="online-dot" /></div></div></aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{section === "Groups" ? activeGroup?.name ?? "Groups" : section}</strong></div><div className="topbar-actions"><span className="demo-mode-chip"><span /> Demo mode</span><div className="notification-wrap"><button aria-label={`Notifications, ${data.notifications.length} new`} className={`icon-button notification-button ${notificationsOpen ? "is-open" : ""}`} onClick={() => setNotificationsOpen((open) => !open)}><Icon name="bell" />{data.notifications.length > 0 && <span className="notification-dot" />}</button>{notificationsOpen && <div className="notification-popover"><div className="popover-head"><strong>Notifications</strong><span>DEMO ONLY</span></div>{data.notifications.length ? data.notifications.map((notification) => <div className="notification-item" key={notification.id}><span className="notification-mark"><Icon name="receipt" size={16} /></span><div><strong>{notification.creatorName} added an expense</strong><span>{notification.description} · {notification.groupName}</span></div><small>{shortDate(notification.createdAt)}</small></div>) : <div className="notification-empty">You’re all caught up.</div>}<div className="popover-foot">In-app demo notifications · no messages are sent</div></div>}</div><button className="profile-chip" onClick={() => setNotice("Demo account: you’re viewing as Maya. Sign-in is not enabled in this prototype.")}><Avatar name={data.currentUser.name} initials={data.currentUser.initials} small /><span>{data.currentUser.name.split(" ")[0]}</span><span className="profile-chevron">⌄</span></button></div></header>
      <div className="page-content">{notice && <div className="toast" role="status"><Icon name="check" size={17} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")}><Icon name="close" size={15} /></button></div>}{error && !modal && section !== "Reports" && <p className="form-error page-error" role="alert">{error}</p>}{section === "Overview" && renderOverview()}{section === "Groups" && <><SectionHeading eyebrow="YOUR PEOPLE, YOUR PLANS" title="Groups" action={<button className="button button-primary" onClick={openExpense}><Icon name="plus" /> Add an expense</button>} /><p className="page-description">Shared expenses and balances, organized around the people you share with.</p><div className="group-tabs">{data.groups.map((group, index) => <button key={group.id} className={activeGroup?.id === group.id ? "active" : ""} onClick={() => setActiveGroupId(group.id)}><span className={`tiny-group-mark tiny-mark-${index % 4}`}>{group.name.slice(0, 1)}</span>{group.name}</button>)}</div>{activeGroup && renderGroupDetails(activeGroup)}</>}{section === "Activity" && renderActivity()}{section === "Reports" && renderReports()}</div>
    </main>
    {modal === "expense" && <ModalShell title="Add an expense" onClose={() => { setModal(null); setError(""); }}>{renderExpenseForm()}</ModalShell>}
    {modal === "payment" && <ModalShell title="Record a payment" onClose={() => { setModal(null); setError(""); }}>{renderPaymentForm()}</ModalShell>}
  </div>;
}
