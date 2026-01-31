import { AdminLayoutInner } from "./AdminLayoutInner";

/**
 * Layout админки: на странице логина — только форма, на остальных — шапка и сайдбар.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
