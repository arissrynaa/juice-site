import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const jar = await cookies();
  if (await verifySessionToken(jar.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
  return <LoginForm />;
}
