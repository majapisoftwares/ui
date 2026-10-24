"use client";

import Link from "next/link";
import { AuthLayout } from "@majapisoftwares/ui/templates/auth-layout";
import { LoginForm } from "@majapisoftwares/ui/templates/login-form";
import { SignupForm } from "@majapisoftwares/ui/templates/signup-form";
import { MajapiLogo } from "@majapisoftwares/ui/patterns/majapi-logo";
import { Button } from "@majapisoftwares/ui/components/button";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import { useDocumentTitle } from "@majapisoftwares/ui/patterns/preferences";
import { appName } from "@/lib/app";
import { messages } from "@/messages";

function TextLink({ href, children }: { href: string; children: string }) {
  return (
    <Button
      variant="link"
      className="h-auto p-0"
      nativeButton={false}
      render={<Link href={href} />}
    >
      {children}
    </Button>
  );
}

// The forms only demonstrate UI: wire onSubmit to real server-side auth.
export function AuthView({ mode }: { mode: "login" | "signup" }) {
  const t = useMessages(messages);
  useDocumentTitle(`${mode === "login" ? t.login : t.signup} · ${appName}`);
  return (
    <AuthLayout
      brand={
        <>
          <MajapiLogo variant="mark" className="h-5" />
          {appName}
        </>
      }
      footer={<TextLink href="/">{t.back}</TextLink>}
    >
      {mode === "login" ? (
        <LoginForm
          onSubmit={() => undefined}
          footer={
            <>
              {t.noAccount} <TextLink href="/signup">{t.signup}</TextLink>
            </>
          }
        />
      ) : (
        <SignupForm
          onSubmit={() => undefined}
          footer={
            <>
              {t.haveAccount} <TextLink href="/login">{t.login}</TextLink>
            </>
          }
        />
      )}
    </AuthLayout>
  );
}
