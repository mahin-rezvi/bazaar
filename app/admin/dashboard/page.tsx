export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage catalog and orders with Firestore-backed workflows.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <a className="rounded-xl border p-4 hover:bg-muted/40" href="/admin/products">
          <div className="text-sm font-semibold">Products</div>
          <div className="text-sm text-muted-foreground">Create and edit listings</div>
        </a>
        <a className="rounded-xl border p-4 hover:bg-muted/40" href="/admin/orders">
          <div className="text-sm font-semibold">Orders</div>
          <div className="text-sm text-muted-foreground">Update statuses</div>
        </a>
        <a className="rounded-xl border p-4 hover:bg-muted/40" href="/admin/users">
          <div className="text-sm font-semibold">Users</div>
          <div className="text-sm text-muted-foreground">View profiles</div>
        </a>
      </div>
    </div>
  );
}

