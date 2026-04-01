export interface DeliveryMethod {
  id: string;
  label: string;
  description: string;
  fee: number;          // additional fee in send currency
  estimatedTime: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  fee: number;          // additional fee in send currency
  icon: string;         // lucide icon name
}

/** Payment methods available to the sender */
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "debit_card",   label: "Debit Card",    fee: 0,    icon: "CreditCard" },
  { id: "bank_transfer",label: "Bank Transfer",  fee: 0,    icon: "Building2"  },
  { id: "credit_card",  label: "Credit Card",   fee: 1.50, icon: "CreditCard" },
];

/** Delivery methods keyed by receive currency code */
export const DELIVERY_METHODS: Record<string, DeliveryMethod[]> = {
  NGN: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "Direct to recipient's bank account", fee: 0,    estimatedTime: "Same day" },
    { id: "mobile_money", label: "Mobile Money",   description: "OPay, Palmpay, Kuda",               fee: 0,    estimatedTime: "Within 1 hour" },
  ],
  GHS: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "Direct to recipient's bank account", fee: 0,    estimatedTime: "1-2 business days" },
    { id: "mobile_money", label: "Mobile Money",   description: "MTN MoMo, Vodafone Cash, AirtelTigo",fee: 0,    estimatedTime: "Within 1 hour" },
  ],
  KES: [
    { id: "mobile_money", label: "M-Pesa",         description: "Direct to recipient's M-Pesa wallet",fee: 0,    estimatedTime: "Within minutes" },
    { id: "bank_deposit", label: "Bank Deposit",   description: "Direct to recipient's bank account", fee: 0,    estimatedTime: "1-2 business days" },
  ],
  ZAR: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "Direct to recipient's bank account", fee: 0,    estimatedTime: "1-2 business days" },
  ],
  INR: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "IMPS / NEFT to any Indian bank",     fee: 0,    estimatedTime: "Within minutes" },
    { id: "upi",          label: "UPI Transfer",   description: "Direct to recipient's UPI ID",       fee: 0,    estimatedTime: "Within minutes" },
  ],
  AED: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "Direct to recipient's UAE bank",     fee: 0,    estimatedTime: "Same day" },
    { id: "cash_pickup",  label: "Cash Pickup",    description: "Recipient collects from exchange",   fee: 1.00, estimatedTime: "Within 1 hour" },
  ],
  CNY: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "UnionPay bank deposit",              fee: 0,    estimatedTime: "1-2 business days" },
    { id: "alipay",       label: "Alipay",         description: "Direct to recipient's Alipay",       fee: 0,    estimatedTime: "Within minutes" },
  ],
  JPY: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "Direct to any Japanese bank",        fee: 0,    estimatedTime: "1-2 business days" },
  ],
  XOF: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "Direct to recipient's bank account", fee: 0,    estimatedTime: "1-2 business days" },
    { id: "mobile_money", label: "Mobile Money",   description: "Orange Money, Wave, Free Money",     fee: 0,    estimatedTime: "Within 1 hour" },
    { id: "cash_pickup",  label: "Cash Pickup",    description: "Recipient collects from agent",      fee: 1.00, estimatedTime: "Within 1 hour" },
  ],
  XAF: [
    { id: "bank_deposit", label: "Bank Deposit",   description: "Direct to recipient's bank account", fee: 0,    estimatedTime: "1-2 business days" },
    { id: "mobile_money", label: "Mobile Money",   description: "MTN MoMo, Orange Money",             fee: 0,    estimatedTime: "Within 1 hour" },
    { id: "cash_pickup",  label: "Cash Pickup",    description: "Recipient collects from agent",      fee: 1.00, estimatedTime: "Within 1 hour" },
  ],
  GNF: [
    { id: "mobile_money", label: "Mobile Money",   description: "Orange Money, MTN MoMo",             fee: 0,    estimatedTime: "Within 1 hour" },
    { id: "cash_pickup",  label: "Cash Pickup",    description: "Recipient collects from agent",      fee: 1.00, estimatedTime: "Within 1 hour" },
  ],
};

/** Default delivery method id for a given currency */
export function getDefaultDelivery(currencyCode: string): string {
  const methods = DELIVERY_METHODS[currencyCode];
  return methods?.[0]?.id ?? "bank_deposit";
}
