import type { Metadata } from "next";
import { AuthClient } from "@/components/auth-client";
export const metadata: Metadata = { title: "Entrar" };
export default function LoginPage() {
  return <AuthClient mode="login" />;
}
