"use client";

import Link from "next/link";
import { AuthLayout } from "@majapisoftwares/ui/templates/auth-layout";
import { LoginForm } from "@majapisoftwares/ui/templates/login-form";
import { SignupForm } from "@majapisoftwares/ui/templates/signup-form";
import { MajapiLogo } from "@majapisoftwares/ui/patterns/majapi-logo";
import { Button } from "@majapisoftwares/ui/components/button";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import { useDocumentTitle } from "@majapisoftwares/ui/patterns/preferences";
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

export function AuthView({
  mode,
  providerOnly = false,
}: {
  mode: "login" | "signup";
  providerOnly?: boolean;
}) {
  const t = useMessages(messages);
  useDocumentTitle(`${mode === "login" ? t.login : t.signup} · Majapi UI`);
  return (
    <AuthLayout
      brand={
        <>
          <MajapiLogo variant="mark" className="h-5" />
          Majapi UI
        </>
      }
      footer={<TextLink href="/">{t.back}</TextLink>}
    >
      {mode === "login" ? (
        <LoginForm
          {...(providerOnly
            ? { mode: "providers" as const }
            : { onSubmit: () => undefined })}
          alternative={
            providerOnly ? (
              <Button nativeButton={false} render={<Link href="/" />}>
                {t.providerLogin}
              </Button>
            ) : undefined
          }
          recovery={<TextLink href="/login">{t.forgot}</TextLink>}
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
