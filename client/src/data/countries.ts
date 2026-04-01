export interface Country {
  name: string;
  code: string;
  flag: string;
  currency: string;
  popular: boolean;
}

export const COUNTRIES: Country[] = [
  { name: "Nigeria",      code: "NG", flag: "🇳🇬", currency: "NGN", popular: true  },
  { name: "Ghana",        code: "GH", flag: "🇬🇭", currency: "GHS", popular: true  },
  { name: "Kenya",        code: "KE", flag: "🇰🇪", currency: "KES", popular: true  },
  { name: "India",        code: "IN", flag: "🇮🇳", currency: "INR", popular: true  },
  { name: "UAE",          code: "AE", flag: "🇦🇪", currency: "AED", popular: true  },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", currency: "ZAR", popular: true  },
  { name: "USA",          code: "US", flag: "🇺🇸", currency: "USD", popular: false },
  { name: "Canada",       code: "CA", flag: "🇨🇦", currency: "CAD", popular: false },
  { name: "Germany",      code: "DE", flag: "🇩🇪", currency: "EUR", popular: false },
  { name: "France",       code: "FR", flag: "🇫🇷", currency: "EUR", popular: false },
  { name: "China",        code: "CN", flag: "🇨🇳", currency: "CNY", popular: false },
  { name: "Japan",        code: "JP", flag: "🇯🇵", currency: "JPY", popular: false },
  { name: "Senegal",      code: "SN", flag: "🇸🇳", currency: "XOF", popular: false },
  { name: "Ivory Coast",  code: "CI", flag: "🇨🇮", currency: "XOF", popular: false },
  { name: "Cameroon",     code: "CM", flag: "🇨🇲", currency: "XAF", popular: false },
  { name: "Guinea",       code: "GN", flag: "🇬🇳", currency: "GNF", popular: false },
];
