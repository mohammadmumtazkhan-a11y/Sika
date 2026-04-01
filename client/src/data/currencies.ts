export interface Currency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  decimals: number;
}

export const CURRENCIES: Currency[] = [
  { code: "GBP", name: "British Pound",       flag: "🇬🇧", symbol: "£",    decimals: 2 },
  { code: "USD", name: "US Dollar",            flag: "🇺🇸", symbol: "$",    decimals: 2 },
  { code: "EUR", name: "Euro",                 flag: "🇪🇺", symbol: "€",    decimals: 2 },
  { code: "CAD", name: "Canadian Dollar",      flag: "🇨🇦", symbol: "CA$",  decimals: 2 },
  { code: "AUD", name: "Australian Dollar",    flag: "🇦🇺", symbol: "A$",   decimals: 2 },
  { code: "NGN", name: "Nigerian Naira",       flag: "🇳🇬", symbol: "₦",    decimals: 2 },
  { code: "GHS", name: "Ghanaian Cedi",        flag: "🇬🇭", symbol: "₵",    decimals: 2 },
  { code: "KES", name: "Kenyan Shilling",      flag: "🇰🇪", symbol: "KSh",  decimals: 2 },
  { code: "ZAR", name: "South African Rand",   flag: "🇿🇦", symbol: "R",    decimals: 2 },
  { code: "INR", name: "Indian Rupee",         flag: "🇮🇳", symbol: "₹",    decimals: 2 },
  { code: "AED", name: "UAE Dirham",           flag: "🇦🇪", symbol: "د.إ",  decimals: 2 },
  { code: "CNY", name: "Chinese Yuan",         flag: "🇨🇳", symbol: "¥",    decimals: 2 },
  { code: "JPY", name: "Japanese Yen",         flag: "🇯🇵", symbol: "¥",    decimals: 0 },
  { code: "XOF", name: "West African CFA",     flag: "🌍",  symbol: "CFA",  decimals: 0 },
  { code: "XAF", name: "Central African CFA",  flag: "🌍",  symbol: "CFA",  decimals: 0 },
  { code: "GNF", name: "Guinean Franc",        flag: "🇬🇳", symbol: "FG",   decimals: 0 },
];

/** Mocked exchange rates relative to GBP */
export const MOCK_RATES: Record<string, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  CAD: 1.73,
  AUD: 1.94,
  NGN: 1850,
  GHS: 17.2,
  KES: 164,
  ZAR: 23.5,
  INR: 106,
  AED: 4.66,
  CNY: 9.2,
  JPY: 191,
  XOF: 767,
  XAF: 767,
  GNF: 10800,
};

/** Transfer fee in GBP per corridor */
export const TRANSFER_FEES: Record<string, number> = {
  NGN: 0.99,
  GHS: 1.49,
  KES: 1.49,
  INR: 0.99,
  AED: 1.99,
  ZAR: 1.99,
  CNY: 1.99,
  JPY: 1.99,
  XOF: 2.49,
  XAF: 2.49,
  GNF: 2.49,
  DEFAULT: 1.99,
};

/** Send-side currencies (subset of CURRENCIES) */
export const SEND_CURRENCIES = CURRENCIES.filter((c) =>
  ["GBP", "USD", "EUR", "CAD", "AUD"].includes(c.code)
);

/** Receive-side currencies (all except send-only) */
export const RECEIVE_CURRENCIES = CURRENCIES.filter((c) =>
  !["GBP", "USD", "EUR", "CAD", "AUD"].includes(c.code)
);
