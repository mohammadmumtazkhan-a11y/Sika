import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import SendMoneyPage from "@/pages/SendMoneyPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import MiniKYCPage from "@/pages/MiniKYCPage";
import DashboardPage from "@/pages/DashboardPage";
import SelectRecipientPage from "@/pages/SelectRecipientPage";
import AddRecipientPage from "@/pages/AddRecipientPage";
import BankDetailsPage from "@/pages/BankDetailsPage";
import SummaryPage from "@/pages/SummaryPage";
import PaymentMethodsPage from "@/pages/PaymentMethodsPage";
import PaymentPage from "@/pages/PaymentPage";

/* ── Mobile App Imports ── */
import MobileHome from "@/pages/MobileApp/MobileHome";
import MobileLogin from "@/pages/MobileApp/MobileLogin";
import MobileRegister from "@/pages/MobileApp/MobileRegister";
import MobileVerifyEmail from "@/pages/MobileApp/MobileVerifyEmail";
import MobileKYC from "@/pages/MobileApp/MobileKYC";
import MobileDashboard from "@/pages/MobileApp/MobileDashboard";
import MobileSendMoney from "@/pages/MobileApp/MobileSendMoney";
import MobileSelectRecipient from "@/pages/MobileApp/MobileSelectRecipient";
import MobileAddRecipient from "@/pages/MobileApp/MobileAddRecipient";
import MobileBankDetails from "@/pages/MobileApp/MobileBankDetails";
import MobileSummary from "@/pages/MobileApp/MobileSummary";
import MobilePaymentMethods from "@/pages/MobileApp/MobilePaymentMethods";
import MobilePayment from "@/pages/MobileApp/MobilePayment";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-[#1FAF5A] mb-4">404</h1>
        <p className="text-[#5F6F68] text-lg mb-6">Page not found</p>
        <a
          href="/"
          className="inline-block bg-[#1FAF5A] hover:bg-[#178A47] text-white font-semibold px-6 py-2.5 rounded-[8px] transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Switch>
        {/* ── Mobile App Routes ── */}
        <Route path="/m/dashboard/send/recipient/new" component={MobileAddRecipient} />
        <Route path="/m/dashboard/send/recipient" component={MobileSelectRecipient} />
        <Route path="/m/dashboard/send/bank" component={MobileBankDetails} />
        <Route path="/m/dashboard/send/summary" component={MobileSummary} />
        <Route path="/m/dashboard/send/payment-methods" component={MobilePaymentMethods} />
        <Route path="/m/dashboard/send/payment" component={MobilePayment} />
        <Route path="/m/dashboard" component={MobileDashboard} />
        <Route path="/m/send" component={MobileSendMoney} />
        <Route path="/m/login" component={MobileLogin} />
        <Route path="/m/register" component={MobileRegister} />
        <Route path="/m/verify-email" component={MobileVerifyEmail} />
        <Route path="/m/kyc" component={MobileKYC} />
        <Route path="/m" component={MobileHome} />

        {/* ── Web Routes ── */}
        <Route path="/" component={HomePage} />
        <Route path="/send" component={SendMoneyPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        <Route path="/kyc" component={MiniKYCPage} />
        <Route path="/dashboard/send/recipient/new" component={AddRecipientPage} />
        <Route path="/dashboard/send/recipient" component={SelectRecipientPage} />
        <Route path="/dashboard/send/bank" component={BankDetailsPage} />
        <Route path="/dashboard/send/summary" component={SummaryPage} />
        <Route path="/dashboard/send/payment-methods" component={PaymentMethodsPage} />
        <Route path="/dashboard/send/payment" component={PaymentPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/dashboard/:rest*" component={DashboardPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster richColors position="top-right" />
    </>
  );
}
