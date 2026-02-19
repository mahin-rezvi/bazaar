import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto flex-1 w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
