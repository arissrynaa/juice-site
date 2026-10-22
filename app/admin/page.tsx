import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";
import { getContent } from "@/lib/content-local";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }
  const content = await getContent();
  return <AdminDashboard initial={content} />;
}
