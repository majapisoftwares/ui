"use client";
import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@majapisoftwares/ui/templates/auth-layout";
import { LoginForm } from "@majapisoftwares/ui/templates/login-form";
import { SignupForm } from "@majapisoftwares/ui/templates/signup-form";
import { Button } from "@majapisoftwares/ui/components/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@majapisoftwares/ui/components/alert";
export function AuthClient({ mode }: { mode: "login" | "signup" }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <AuthLayout
      title="Seu próximo produto começa aqui."
      description="Uma experiência compartilhada, do primeiro acesso ao trabalho diário."
      footer="Template demonstrativo"
    >
      <div className="flex w-full flex-col items-center gap-5">
        {mode === "login" ? (
          <LoginForm
            onSubmit={() => setSubmitted(true)}
            footer={
              <Button
                variant="link"
                render={<Link href="/signup" />}
                nativeButton={false}
              >
                Criar uma conta
              </Button>
            }
          />
        ) : (
          <SignupForm
            onSubmit={() => setSubmitted(true)}
            footer={
              <Button
                variant="link"
                render={<Link href="/login" />}
                nativeButton={false}
              >
                Já tenho uma conta
              </Button>
            }
          />
        )}
        {submitted ? (
          <Alert>
            <AlertTitle>Formulário demonstrativo</AlertTitle>
            <AlertDescription>
              Nenhuma informação foi enviada. O produto deve conectar seu fluxo
              de autenticação.
            </AlertDescription>
          </Alert>
        ) : null}
        <Button
          variant="outline"
          render={<Link href="/dashboard" />}
          nativeButton={false}
        >
          Voltar à demonstração
        </Button>
      </div>
    </AuthLayout>
  );
}
