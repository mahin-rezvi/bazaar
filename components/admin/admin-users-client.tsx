"use client";

import { useQuery } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";

import { listUsers } from "@/lib/firestore/admin";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminUsersClient() {
  const q = useQuery({ queryKey: ["admin-users"], queryFn: () => listUsers(50) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Admin read-only view of user profiles (roles are set manually).
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>UID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {q.isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-sm text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : q.data?.length ? (
            q.data.map((u) => {
              const createdAt =
                u.createdAt instanceof Timestamp ? u.createdAt.toDate() : new Date();
              return (
                <TableRow key={u.uid}>
                  <TableCell className="max-w-[220px] truncate font-medium">{u.uid}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-muted-foreground">
                    {u.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(createdAt)}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-sm text-muted-foreground">
                No users.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
