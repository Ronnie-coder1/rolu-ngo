This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# ROLU NGO — Next.js App

## Project Structure

```
rolu-ngo/
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Full site (React)
│   │   ├── layout.tsx                  ← HTML head, fonts, Paystack script
│   │   ├── globals.css                 ← All styles
│   │   └── api/
│   │       ├── verify-payment/
│   │       │   └── route.ts            ← Uses SECRET key server-side
│   │       └── webhook/
│   │           └── route.ts            ← Paystack webhook handler
│   └── lib/
│       └── paystack.ts                 ← Shared types & helpers
├── .env.local                          ← YOUR KEYS GO HERE (never commit)
├── .env.example                        ← Safe template to commit
├── .gitignore
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🔑 Step 1 — Add your Paystack keys

Open `.env.local` and fill in your keys from  
https://dashboard.paystack.com/#/settings/developer

```env
NEXT_PUBLIC_PAYSTACK_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYSTACK_ENV=test
```

- **`NEXT_PUBLIC_*`** → sent to the browser (safe for public key only)
- **`PAYSTACK_SECRET_KEY`** → stays server-side only, never in the browser

---

## 🚀 Step 2 — Run the app

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 🧪 Test card details (Paystack sandbox)

| Field       | Value          |
|-------------|----------------|
| Card number | 4084 0840 8408 4081 |
| CVV         | 408            |
| Expiry      | 01/99          |
| PIN         | 0000           |
| OTP         | 123456         |

For Mobile Money test: use any Ghana number.

---

## 🌐 Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

In the Vercel dashboard → Project Settings → Environment Variables, add:
- `NEXT_PUBLIC_PAYSTACK_KEY` = your live public key
- `PAYSTACK_SECRET_KEY` = your live secret key
- `NEXT_PUBLIC_PAYSTACK_ENV` = live

Then set your Paystack webhook URL to:  
`https://your-vercel-domain.vercel.app/api/webhook`

---

## 🔒 Going live checklist

- [ ] Replace `pk_test_` with `pk_live_` in `.env.local`
- [ ] Replace `sk_test_` with `sk_live_` in `.env.local`
- [ ] Set `NEXT_PUBLIC_PAYSTACK_ENV=live`
- [ ] Deploy to Vercel / Netlify / your host
- [ ] Set environment variables in your hosting dashboard
- [ ] Add webhook URL in Paystack dashboard
- [ ] Test a real payment of a small amount
- [ ] Confirm `.env.local` is NOT in your git repository
