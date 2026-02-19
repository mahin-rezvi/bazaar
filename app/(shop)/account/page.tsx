import { AuthGuard } from "@/components/auth/auth-guard";
import { AccountPageClient } from "@/components/account/account-page-client";

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountPageClient />
    </AuthGuard>
  );
}

