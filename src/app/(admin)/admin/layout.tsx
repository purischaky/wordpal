import { requireAdminUser } from '@/lib/dal/session';
import { AdminLayoutShell } from './AdminLayoutShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();
  return <AdminLayoutShell user={user}>{children}</AdminLayoutShell>;
}
