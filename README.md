# ROLU iNItiative Platform

A full-stack web application built to support community initiatives in Ghana.

## Features
- **Frontend**: Built with **React** and **Next.js** for a fast, responsive user interface.
- **Support System**: Integrated with **Paystack** to accept Mobile Money and card payments.
- **Contact System**: A secure contact form using **Nodemailer** and **Gmail** API.
- **Backend**: **Next.js API Routes** for secure server-side processing.

## Tech Stack
- **Framework**: Next.js 16 / React 19
- **Styling**: Tailwind CSS
- **Payments**: Paystack API
- **Email**: Nodemailer
- **Deployment**: Vercel



First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev




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
`
```bash
npm install
npm run dev


## 🧪 Test card details (Paystack sandbox)

| Field       | Value          |
|-------------|----------------|
| Card number | 4084 0840 8408 4081 |
| CVV         | 408            |
| Expiry      | 01/99          |
| PIN         | 0000           |
| OTP         | 123456         |

```bash
npm install -g vercel
vercel


I