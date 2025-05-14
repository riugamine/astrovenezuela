import type { Metadata } from "next";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import UsersManagement from "@/components/admin/users/UsersManagement";
export const metadata: Metadata = {
  title: "Gestión de usuarios | Astro Venezuela",
  description:
    "Panel de administración para gestionar usuarios de Astro Venezuela",
};
export default function UsersPage() {
  return (
    <AdminLayout>
      <UsersManagement />
    </AdminLayout>
  );
}
