# SplitSmart prototype

A responsive Next.js demo for sharing group expenses, reviewing expenses,
tracking pairwise balances, recording demo payments, and filtering reports.
App data is stored in SQLite through Prisma. Money is persisted as integer
cents.

## Run locally

From this directory:

```bash
npm install
cp .env.example .env
npm run db:deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default SQLite file is
`prisma/dev.db`; it is local and ignored by Git. Do not remove it to rerun the
seed—`db:seed` is idempotent and leaves existing records in place.

Apply schema changes during development with:

```bash
npm run db:migrate -- --name describe_your_change
```

`npm run db:deploy` applies the checked-in migrations without creating new
migrations. `npm run db:seed` can be rerun at any time.

## Demo behavior

- The app opens as the seeded demo member, Maya Torres. There is no real sign-in,
  account security, or access control.
- Expense review and in-app notifications are local prototype behavior. No
  messages are sent.
- Recording a payment only updates the demo ledger; it does not connect to a
  bank or move money.
- Seeded groups, members, approved expenses, one pending review, and payments
  provide a starting point for the dashboard and report.

## Checks

```bash
npm run lint
npm run build
```
