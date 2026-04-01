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
