import Link from "next/link";
import Breadcrumb from "../../components/Breadcrumb";
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  RefreshCw,
  XCircle,
  type LucideIcon,
} from "lucide-react";

const recoverySteps: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Card not charged",
    description:
      "Your payment provider has not processed this attempt, so you can safely try again.",
    icon: CreditCard,
  },
  {
    title: "Check details",
    description:
      "Verify your card information, billing address, or available limit before retrying.",
    icon: AlertTriangle,
  },
  {
    title: "Try a new attempt",
    description:
      "Refresh checkout or choose another method to complete your rental.",
    icon: RefreshCw,
  },
];

export default function PaymentFailurePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6F3]">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Payment", href: "/payment" }, { label: "Failed" }]} />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl rounded-[32px] border border-[#e2d8cf] bg-white/80 p-10 text-center shadow-[0_25px_80px_rgba(33,24,18,0.08)] backdrop-blur-md">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fde8e8] text-[#8b1c1c]">
              <XCircle className="h-10 w-10" />
            </div>
          </div>
          <p className="mt-6 text-xs font-semibold tracking-[0.4em] text-[#c37a6d]">
            PAYMENT COULD NOT BE COMPLETED
          </p>
          <h1 className="mt-4 font-['Playfair_Display'] text-3xl text-[#3D1126] md:text-4xl">
            Something interrupted your checkout
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#6c5c52] md:text-lg">
            It looks like the processor declined this attempt before funds were captured. Let&apos;s walk through a few quick checks so you can finish booking your look.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {recoverySteps.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#f4ddd7] bg-[#fff8f6] p-4 text-left"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#c0563d]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-[#3D1126]">{title}</p>
                <p className="mt-2 text-sm text-[#7a6d63]">{description}</p>
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="mt-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#171518]"
          >
            Go to Homepage
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-6 text-sm text-[#7a6d63]">
            Ready to retry? Visit your <Link href="/cart" className="font-semibold text-[#3D1126] underline-offset-4 hover:underline">cart</Link> to pick up where you stopped.
          </p>
          <p className="mt-2 text-sm text-[#7a6d63]">
            Need a hand? <Link href="/support" className="font-semibold text-[#3D1126] underline-offset-4 hover:underline">Contact our support team</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
