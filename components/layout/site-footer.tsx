import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">{SITE.name}</div>
            <p className="text-sm text-muted-foreground">
              A modern marketplace UI built for fun.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Explore</div>
            <div className="grid gap-1 text-sm text-muted-foreground">
              <Link href="/products" className="hover:text-foreground">
                Products
              </Link>
              <Link href="/cart" className="hover:text-foreground">
                Cart
              </Link>
              <Link href="/orders" className="hover:text-foreground">
                Orders
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Contact</div>
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground">{SITE.owner.fullName}</div>
              <div>{SITE.owner.title}</div>
              <div>{SITE.owner.organization}</div>
              <div className="mt-1">{SITE.location.label}</div>
              <div className="mt-1">
                <span className="text-muted-foreground">Phone:</span>{" "}
                <a className="hover:text-foreground" href={`tel:${SITE.owner.phone}`}>
                  {SITE.owner.phone}
                </a>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Theme</div>
            <p className="text-sm text-muted-foreground">
              Light/dark mode supported with persistent preference.
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}.</p>
          <p className="text-xs">
            Just a simple project....
          </p>
        </div>
      </div>
    </footer>
  );
}
