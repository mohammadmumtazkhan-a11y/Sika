# Sika UI

## Context

We at Mito.Money (a brand of Funtech Global Communications Ltd.) want to provide some of our services to Sika(owned by Africa Remittance Co LLC) The services will be white-labelled for Sika. sika is a retail money transfer responsive application operating in the United Kingdom using Mito.Money’s licence. We are building a world class professional, modern premium UI/UX and completely working prototype.

The user/end-customer must register to use Sika.
As a part of registration the end-user/Customer must verify his email following Rhemito’s Sign-up process.
Live rates for currency-Country Corridors are provided to the customer and he can enter the desired amount to send.
The End user must pass KYC before creating a Transaction.

**Two types of KYC:**
1. **Mini KYC:** Country, First name, Last name, DOB, Address Line 1 (mandatory), Address Line 2 (optional), City, PIN/ZIP/POST Code, Phone (optional).
2. **Full KYC:** When threshold is hit â€” ID document upload + Selfie liveness check.

After adding the beneficiary/recipient (narration/TXN remarks is optional but mandatory for Nigerian beneficiaries), the Sender reviews the Transaction and Pays using a selected payment method.

Additional features: receiving/requesting payments, GroupPay funding campaigns, bonuses and discounts, collection accounts, managing recipients/beneficiaries and senders, help tickets, and notifications (bell + PUSH).

### Pages controlled by Sika:
A responsive world-class premium UI/UX Homepage similar to https://www.sikacash.com/ here the default send currency will be GBP and country will be the UK.
Sign-up/sign-in form (registering user and passing his info UID to Mito.money for TXN).
The Dashboard
Page to collect the beneficiary details (CRUD operations for beneficiary)
Showing transaction details
Help tickets page for customers
Manage account info (change Password etc.)

### Pages controlled/provided by Mito.money
Live FX rates via API, rates locked for 15 minutes 
Mini KYC
FULL KYC if threshold reached
Beneficiary requirements via API
Beneficiary account verification for Nigeria (optional)
Payment collection-Payment methods display
Status of Payments
Return/give TXN details via API to Sika for any customer or any specific TXN ID.
Show wallet balances (if applicable) for customers
Help Tickets support via API or widget
Note: the countdown for transaction completion is 10 minutes. Mito.money will also create a customer based on the information received from Sika. The skia UID and Mito.money UID for customer will be maintained on both sides (Sika and Mito).
##Display: Powered by ‘Mito.Money’ in partnership with Sika. On Pages controlled by Mito.Money.





### Supported Currencies & Countries

**Currencies:** GBP, USD, EUR, NGN, CAD, AUD, JPY, CNY, INR, ZAR, KES, GHS, AED, XOF, XAF, GNF

**Countries:** UK, USA, Nigeria, Canada, Ghana, Kenya, South Africa, Germany, France, India, China, UAE, countries supporting XOF, XAF, GNF

## Rules

- Always ask me queries one by one in case of confusion or if you need clarity.
- Ask before implementing if you have a good suggestion.
- UI/UX will always be world class, modern and premium.
- Every new page or element must match the basic/default theme.
- Always implement proper messaging display (popup/toast) after any submission or processing (CRUD or enable/disable/cancel etc.) so that the customer knows what is happening.
- Mind the back buttons for going back to the previous step/screen.
- Keep always close/abort button on the popups if they are not mandatory/modals that can not be closed.
- Always plan before coding and get approval of what you are implementing if it is a suggestion.
- I can share images/screenshots but before implementing them blindly mind the theme/colour and logic/flow for Fintech/money transfer.
- Mind the functionality and effects across the application when we are implementing something new (a field/flow or Text) so that we don't break the flow/functionality while adding or changing anything.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript |
| Build | Vite 6 |
| Routing | Wouter 3 (NOT React Router) |
| Server State | TanStack React Query 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York style) |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |
| Backend | Express.js + TypeScript (via tsx) |
| Database | PostgreSQL + Drizzle ORM |
| Session Auth | express-session + connect-pg-simple |
| E2E Testing | Playwright |
| Unit Testing | Vitest + Testing Library |

## Project Structure

```
client/src/
  components/ui/    # shadcn/ui primitives â€” add via CLI, do NOT edit manually
  components/       # App-level shared components (modals, layout, etc.)
  pages/            # Route page components
  hooks/            # Custom React hooks (use-toast, use-mobile)
  lib/queryClient.ts # apiRequest(), getQueryFn(), queryClient config
  lib/utils.ts      # cn() utility (clsx + tailwind-merge)
  data/             # Static data (knownSenders, payoutAccounts)
  index.css         # Theme CSS variables and Tailwind base
  App.tsx            # Root: ErrorBoundary â†’ QueryProvider â†’ Router

server/
  index.ts          # Express server entry point
  routes.ts         # API route definitions
  vite.ts           # Vite dev middleware integration

shared/
  schema.ts         # Drizzle ORM schema + Zod insert schemas

tests/e2e/          # Playwright E2E specs (.spec.js)
```

## Path Aliases

Configured in `tsconfig.json` â€” always use these, never cross-boundary relative paths:
- `@/*` â†’ `./client/src/*`
- `@shared/*` â†’ `./shared/*`

## Coding Conventions

### Components
- Functional components with TypeScript interfaces for props
- shadcn/ui components live in `components/ui/` â€” add new ones via shadcn CLI
- Use CVA (`class-variance-authority`) for component variants
- Use `cn()` from `@/lib/utils` to merge Tailwind classes

### State Management
- **Server state:** TanStack Query (`useQuery`, `useMutation`) â€” never store API data in local React state
- **Local UI state:** `useState` / `useReducer`
- Query client uses `staleTime: Infinity` â€” invalidate manually after mutations

### API Patterns
```typescript
// Queries â€” queryKey doubles as the URL
import { getQueryFn } from "@/lib/queryClient";
useQuery({
  queryKey: ["/api/endpoint"],
  queryFn: getQueryFn({ on401: "returnNull" }), // or "throw"
});

// Mutations
import { apiRequest } from "@/lib/queryClient";
const res = await apiRequest("POST", "/api/endpoint", body);
```
All requests use `credentials: "include"` for session cookies.

### Forms
- React Hook Form + `@hookform/resolvers/zod` for validation
- Use shadcn `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormMessage>`
- Define Zod schemas in `shared/schema.ts` using `drizzle-zod` when tied to DB

### Styling
- **Tailwind CSS only** â€” no inline styles, no CSS modules
- Theme variables in `client/src/index.css` â€” use via `hsl(var(--variable))`
- Always use shadcn color tokens: `primary`, `secondary`, `muted`, `accent`, `destructive`
- Headings: `font-display` (Plus Jakarta Sans) / Body: `font-sans` (Inter)

### Animation
- Framer Motion for page transitions and micro-interactions
- Keep animations subtle and premium â€” no flashy or distracting motion

### Routing
- **Wouter** (`Switch`, `Route`, `useLocation`, `useRoute`)
- All routes defined in `App.tsx`

### Toasts & Feedback
- Use `useToast()` from `@/hooks/use-toast` â€” Toaster is already mounted in App.tsx
- Always show a toast after: form submissions, API errors, state changes

## Theme

```?? SikaCash-Inspired Fintech Theme (Modernised)
1. ?? Primary Colour Palette
? Primary Brand Colour (Main Green)
* HEX: #1FAF5A 
* Usage: 
o Primary buttons 
o Highlights 
o Active states 
o Links 
?? Slightly modern, softer fintech green (better than harsh/dark green)

? Secondary Green (Hover / Active)
* HEX: #178A47 
* Usage: 
o Button hover 
o Selected states 
o Progress indicators 

? Accent Colour (Warm Highlight)
* HEX: #F4B400 
* Usage: 
o Important highlights 
o Limited CTAs 
o Icons (subtle use only) 

2. ?? Background Colours
? Main Background
* HEX: #F8FAF9 (very light grey-green tint)
?? Cleaner than pure white, reduces eye strain 

? Card / Container Background
* HEX: #FFFFFF
?? Use for: 
* Forms 
* Transaction cards 
* Sections 

? Alternate Section Background
* HEX: #EEF7F1
?? Light green tint for: 
* Highlights 
* Info sections 

3. ?? Button System
? Primary Button
* Background: #1FAF5A 
* Text: #FFFFFF 
* Border Radius: 8px – 12px 
* Font Weight: Semi-bold 
?? Example:
* “Send Money” 
* “Continue” 

? Primary Button (Hover)
* Background: #178A47 

? Secondary Button
* Background: #FFFFFF 
* Border: 1px solid #1FAF5A 
* Text: #1FAF5A 
?? Example:
* “Back” 
* “Cancel” 

? Disabled Button
* Background: #D3D9D6 
* Text: #8A9490 

4. ?? Text Colours
? Primary Text
* HEX: #1E2A24
?? Dark but not pure black (more premium) 

? Secondary Text
* HEX: #5F6F68
?? For descriptions, hints 

? Placeholder Text
* HEX: #9AA6A0 

5. ?? Input Fields
Default
* Background: #FFFFFF 
* Border: 1px solid #DCE3DF 
* Radius: 8px 

Focus State
* Border: 1px solid #1FAF5A 
* Shadow: subtle green glow 

Error State
* Border: #E5484D 
* Background: #FFF5F5 

6. ?? Status Colours
Success
* Green: #1FAF5A 
Warning
* Amber: #F4B400 
Error
* Red: #E5484D 
Info
* Blue: #3B82F6 

7. ?? Card & Layout Style
* Border Radius: 12px 
* Shadow: 0 2px 8px rgba(0,0,0,0.05) 
* Padding: 16px – 24px 
* Clean spacing (important for fintech trust) 

8. ?? Navigation Style
Top Bar
* Background: #FFFFFF 
* Border bottom: #E5ECE8 
Active Tab
* Text: #1FAF5A 
* Underline or highlight 

9. ?? UX Feel Summary (for Claude)
* Clean 
* Calm 
* Trustworthy 
* Not flashy 
* Fast and focused 
* Mobile-first

```

Fonts: `Plus Jakarta Sans` (display), `Inter` (body). See `components.json` for full shadcn/ui config.

## Testing

### E2E (Playwright) â€” run from project root, dev server must be running

```bash
npx.cmd playwright test --reporter=line          # Full suite
npx.cmd playwright test tests/e2e/dashboard.spec.js  # Single file
npx.cmd playwright test --ui                      # Debug UI mode
```

### Unit Tests (Vitest)

```bash
cd client && npx vitest run    # Single run
cd client && npx vitest        # Watch mode
```

### Pre-commit â€” always run before git commit

```bash
npx.cmd playwright test --reporter=line
```

