import Link from "next/link";
import Breadcrumb from "../../components/Breadcrumb";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";

const highlights: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Curated with care",
    description:
      "Our stylists are preparing your luxury rental so it arrives ready to wear.",
    icon: Sparkles,
  },
  {
    title: "On its way",
    description:
      "Tracking details will land in your inbox as soon as the carrier scans your parcel.",
    icon: Truck,
  },
  {
    title: "Protected checkout",
    description: "Your payment is secured and backed by Navyaa's rental assurance.",
    icon: ShieldCheck,
  },
];

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6F3]">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Payment", href: "/payment" }, { label: "Success" }]} />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl rounded-[32px] border border-[#e2d8cf] bg-white/80 p-10 text-center shadow-[0_25px_80px_rgba(33,24,18,0.08)] backdrop-blur-md">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f3e7dd] text-[#3D1126]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <p className="mt-6 text-xs font-semibold tracking-[0.4em] text-[#a7866a]">
            PAYMENT SUCCESSFUL
          </p>
          <h1 className="mt-4 font-['Playfair_Display'] text-3xl text-[#3D1126] md:text-4xl">
            Your order is confirmed
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#6c5c52] md:text-lg">
            We&apos;ve emailed the receipt and order summary. Expect a delivery update shortly so you can plan your look with confidence.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#efe5dd] bg-[#FAF6F3] p-4 text-left"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#3D1126]">
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
            Need assistance? <Link href="/support" className="font-semibold text-[#3D1126] underline-offset-4 hover:underline">Reach out to support</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
