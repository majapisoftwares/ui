import type { Metadata } from "next";
import { AuthClient } from "@/components/auth-client";
export const metadata: Metadata = { title: "Criar conta" };
export default function SignupPage() {
  return <AuthClient mode="signup" />;
}
