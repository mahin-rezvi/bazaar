import Link from "next/link";
import { FirebaseConfigBanner } from "@/components/firebase/firebase-config-banner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background flex flex-col auth-animated-bg">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          Hudai
        </Link>
        <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
          Browse products
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full space-y-4">
          <FirebaseConfigBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
