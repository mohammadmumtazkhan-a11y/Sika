# Sika — Requirements & Feature Specification

## 1. Product Overview

Sika (owned by Africa Remittance Co LLC) is a retail money transfer application operating in the United Kingdom, white-labelled using Mito.Money's FCA licence (FRN 815146, Funtech Global Communications Ltd). The application provides a world-class, modern, premium UI/UX for international money transfers.

**Target Market:** UK-based users sending money internationally
**Default Currency:** GBP | **Default Country:** United Kingdom

---

## 2. Supported Currencies & Countries

**Currencies (16):** GBP, USD, EUR, NGN, CAD, AUD, JPY, CNY, INR, ZAR, KES, GHS, AED, XOF, XAF, GNF

**Countries (16+):** UK, USA, Nigeria, Canada, Ghana, Kenya, South Africa, Germany, France, India, China, UAE, and countries supporting XOF, XAF, GNF

---

## 3. Page Ownership Model

### 3.1 Sika-Controlled Pages
| Feature | Web Route | Mobile Route | Status |
|---------|-----------|--------------|--------|
| Homepage | `/` | `/m` | Done |
| Login | `/login` | `/m/login` | Done |
| Registration | `/register` | `/m/register` | Done |
| Dashboard | `/dashboard` | `/m/dashboard` | Done |
| Send Money (amount entry) | `/send` | `/m/send` | Done |
| Help Tickets | — | — | Planned |
| Account Settings | — | — | Planned |

### 3.2 Sika-Controlled (Mito-Branded) Pages
Display: "Managed and Powered by SikaCash" badge. No transition loader.

| Feature | Web Route | Mobile Route | Status |
|---------|-----------|--------------|--------|
| Email Verification (OTP) | `/verify-email` | `/m/verify-email` | Done |

### 3.3 Mito.Money-Controlled Pages
Display: "Powered by Mito.Money in partnership with Sika" badge.
Transition loader shows once per flow entry from Sika pages.

| Feature | Web Route | Mobile Route | Status |
|---------|-----------|--------------|--------|
| Mini KYC | `/kyc` | `/m/kyc` | Done |
| Full KYC (ID + selfie) | — | — | Planned |
| Select Recipient | `/dashboard/send/recipient` | `/m/dashboard/send/recipient` | Done |
| Add New Recipient | `/dashboard/send/recipient/new` | `/m/dashboard/send/recipient/new` | Done |
| Bank/Delivery Details | `/dashboard/send/bank` | `/m/dashboard/send/bank` | Done |
| Transaction Summary | `/dashboard/send/summary` | `/m/dashboard/send/summary` | Done |
| Payment Methods | `/dashboard/send/payment-methods` | `/m/dashboard/send/payment-methods` | Done |
| Payment Processing | `/dashboard/send/payment` | `/m/dashboard/send/payment` | Done |
| Beneficiary Verification (Nigeria) | — | — | Planned |
| Wallet Balances | — | — | Planned |

---

## 4. User Flows

### 4.1 Registration & Onboarding
1. User visits Homepage → clicks Register
2. Fills registration form (first name, last name, email, mobile, password, country)
3. Redirected to Email Verification → enters 6-digit OTP (60s resend timer)
4. Lands on Dashboard (KYC is NOT part of registration — it triggers on first send)

**Mito Transition Loader:** Does NOT show during registration or email verification. Email verification is part of Sika's registration flow.

### 4.2 Login
1. User enters email and password
2. "Remember me" option available
3. Social login buttons displayed (future integration)
4. Redirected to Dashboard on success

### 4.3 Send Money Flow

#### 4.3.1 New Customer (first transaction, KYC not done)
1. **Amount & Delivery** — Select currencies, enter amount, view live FX rate (locked 15 min), choose delivery method
2. **Mini KYC** — Identity verification (triggered automatically on Continue). Transition loader shows before this step.
3. **Add Recipient** — New recipient form (skips recipient list since no saved recipients exist)
4. **Bank/Delivery Details** — Enter recipient's bank account, mobile money, or cash pickup details
5. **Summary** — Review transaction: amount, fees, total, recipient details, exchange rate
6. **Payment** — Select payment method → process payment → confirmation

#### 4.3.2 Existing Customer (KYC already done)
1. **Amount & Delivery** — Same as above
2. **Select Recipient** — Pick from saved recipients (search/filter) or add new. Transition loader shows before this step.
3. **Bank/Delivery Details** — Enter or confirm recipient details
4. **Summary** — Review transaction
5. **Payment** — Select payment method → process payment → confirmation

**Transaction Completion Countdown:** 10 minutes from rate lock.
**Mito Transition Loader:** Shows once per flow entry — before Mini KYC (new customer) or before Select Recipient (existing customer).
**New Customer Detection:** `sika_new_user` sessionStorage flag; `sika_kyc_done` flag tracks KYC completion.

### 4.4 KYC (Know Your Customer)
**Mini KYC (required before first transaction, NOT during registration):**
- Triggered when user clicks "Continue" on Send Money page and `sika_kyc_done` is not set
- After KYC completion, user is redirected to Add Recipient form with corridor params preserved
- Web and mobile versions are feature-identical (section headers, field icons, hints, validation)

**Mini KYC Form Fields:**
- Country (with Globe icon, required, auto-filled from registration)
- First Name, Last Name (with User icon, required, auto-filled)
- Date of Birth (with Calendar icon, required, 18+ validation with hint)
- Phone (with Phone icon, optional, auto-filled)
- Address Line 1 (with MapPin icon, required)
- Address Line 2 (with MapPin icon, optional)
- City (with MapPin icon, required)
- Postcode/ZIP (with MapPin icon, required, with format hint)

**Section Headers:** "PERSONAL DETAILS" and "ADDRESS" dark headers with icons (both web and mobile)
**Mito.Money Badge:** Animated "Powered by Mito.Money in partnership with Sika" badge
**Info Banner:** "Why do we need this?" — FCA regulation explanation

**Full KYC (triggered when threshold reached):**
- ID document upload
- Selfie liveness check
- Status: Planned

### 4.5 Mito.Money Transition Loader
**Purpose:** FCA compliance disclosure when transitioning from Sika-branded pages to Mito.Money-powered pages.

**Visual Design:**
- Fullscreen dark green radial gradient overlay
- ShieldCheck icon with sonar pulse animation
- Sika logo → animated chevrons → Mito.Money logo (handoff visual)
- Text: "Connecting to Mito.Money" + subtitle about licensed partner
- FCA badge: "FCA Authorised · FRN 815146" (gold accent)
- "Funtech Global Communications Ltd" attribution
- Linear progress bar (green-to-gold gradient)

**Behavior:**
- Shows for 2.6 seconds + 0.7s fade-out
- Shows once per flow entry (tracked via `sessionStorage` key `mito_flow_active`)
- Resets when user returns to ANY Sika page (HomePage, LoginPage, RegisterPage, SendMoneyPage, DashboardPage, MobileHome, MobileLogin, MobileRegister, MobileSendMoney, MobileDashboard)
- Does NOT show on VerifyEmailPage (email verification is Sika's registration flow)
- Uses `createPortal` to `document.body` for reliable z-index stacking

### 4.6 Session Flags & Flow Control

| Flag | Set By | Cleared By | Purpose |
|------|--------|------------|---------|
| `sika_new_user` | VerifyEmailPage after OTP | LoginPage (existing users) | Distinguishes new vs existing customer |
| `sika_kyc_done` | MiniKYCPage after submit; LoginPage for returning users | — | Tracks whether KYC is complete; gates Send Money flow |
| `sika_reg` | RegisterPage | MiniKYCPage after submit | Carries registration data for KYC auto-fill (country, name, phone) |
| `mito_flow_active` | MitoTransitionLoader on show | All Sika pages via `clearMitoFlow()` | Prevents duplicate transition loader within same flow |
| `sika_recipient` | SelectRecipientPage on selection | — | Passes recipient data to AddRecipientPage |
| `sika_bank` | SelectRecipientPage on selection | — | Passes bank data to BankDetailsPage |

**New Customer Recipient Bypass:** When `sika_new_user === "1"`, SelectRecipientPage and MobileSelectRecipient auto-redirect to AddRecipientPage (skip empty recipient list).

---

## 5. Layout System

### 5.1 Navbar + Footer (Public Pages)
Used on: HomePage, SendMoneyPage
- Top nav: Logo, nav links (Home, How It Works, FAQs), Login/Register buttons
- Footer: Company links, services, support, legal, social media, Mito.Money branding

### 5.2 MitoLayout (Registration/KYC Flow)
Used on: VerifyEmailPage (no loader), MiniKYCPage (with loader)
- Header: Sika logo + "Powered by Mito.Money in partnership with Sika" badge
- Step progress bar (configurable steps)
- Green gradient page heading
- `showMitoLoader` prop (default true) — set to false on VerifyEmailPage
- Footer: Mito.Money branding, SSL/VISA/Mastercard badges

### 5.3 DashboardLayout (Authenticated Pages)
Used on: DashboardPage, all send-flow pages
- Sidebar: Overview, Money Sent, Payments Received, Compliance, Support, Bonus & Discounts, Settings, Logout
- Top bar: Notification bell (count badge), user profile dropdown
- `showMitoLoader` prop for Mito-powered pages
- Auto-clears Mito flow flag when `showMitoLoader=false`

### 5.4 MobileLayout (Mobile Pages)
Used on: All mobile pages
- MobileTopBar: Back button, title, notification bell, logo
- MobileBottomNav: Home, Activity, Send (FAB), Profile tabs

---

## 6. Component Inventory

| Component | Location | Purpose |
|-----------|----------|---------|
| MitoTransitionLoader | `components/` | FCA compliance transition overlay |
| MitoLayout | `components/` | Layout for Mito-branded pages |
| DashboardLayout | `components/` | Sidebar layout for dashboard |
| Navbar | `components/` | Public page navigation |
| Footer | `components/` | Public page footer |
| TransferCalculator | `components/` | Currency conversion widget |
| StatCounter | `components/` | Animated number display |
| FeatureCard | `components/` | Feature showcase card |
| MobileAmountCard | `components/` | Amount + rate-lock countdown |
| MobileStepIndicator | `components/` | Step progress for mobile |
| MobileLayout | `pages/MobileApp/components/` | Mobile wrapper |
| MobileTopBar | `pages/MobileApp/components/` | Mobile header |
| MobileBottomNav | `pages/MobileApp/components/` | Mobile tab bar |

---

## 7. Data Configuration

### 7.1 Currencies (`data/currencies.ts`)
16 currencies with symbol, flag emoji, country name, and mock exchange rates vs GBP.

### 7.2 Countries (`data/countries.ts`)
16 countries with flag emojis, default currency mapping, and popularity ranking.

### 7.3 Delivery Methods (`data/deliveryMethods.ts`)
Per-currency delivery options:
- Bank Deposit, Mobile Money, Cash Pickup
- UPI (India), Alipay (China), M-Pesa (Kenya)

Payment methods: Debit Card, Bank Transfer, Credit Card (with fee structure).

---

## 8. PWA (Progressive Web App)

- **Installable** on iOS (Add to Home Screen), Chrome, and Edge
- **Manifest:** `public/manifest.json`
- **Service Worker:** `public/sw.js`, registered in `main.tsx`
- **Start URL:** `/m` (mobile app experience)
- **App Shortcuts:** "Send Money" → `/m/send`
- **Icons:** 192x192 and 512x512 PNG with maskable support
- **Theme Color:** #1FAF5A | **Background:** #F8FAF9

---

## 9. Database Schema

### Users Table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| email | VARCHAR | Unique |
| password | VARCHAR | Hashed |
| firstName | VARCHAR | Required |
| lastName | VARCHAR | Required |
| middleName | VARCHAR | Optional |
| phone | VARCHAR | Optional |
| referralCode | VARCHAR | Optional |
| emailVerified | BOOLEAN | Default false |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

---

## 10. API Endpoints

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/health` | Done | Health check |
| POST | `/api/auth/register` | Stub | User registration |
| POST | `/api/auth/login` | Stub | User login |
| POST | `/api/auth/logout` | Done | Session logout |
| GET | `/api/auth/me` | Done | Current user |

**Planned API integrations (Mito.Money):**
- Live FX rates (rates locked 15 min)
- Beneficiary requirements per country
- Beneficiary account verification (Nigeria)
- Payment collection & status
- Transaction details
- Wallet balances
- Help ticket support

---

## 11. Planned Features (Not Yet Implemented)

- Full KYC (ID document upload + selfie liveness check)
- Receiving/requesting payments
- GroupPay funding campaigns
- Bonuses and discounts system
- Collection accounts
- Help tickets page
- Account settings (change password, etc.)
- Push notifications
- Social login (Google, Apple)
- Beneficiary account verification for Nigeria
- Wallet balances display
- Live API integration with Mito.Money backend
