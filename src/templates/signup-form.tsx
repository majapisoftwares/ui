"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../components/ui/field";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { defineMessages, useMessages } from "../lib/i18n";

const messages = defineMessages({
  en: {
    title: "Create an account",
    name: "Name",
    email: "Email",
    password: "Password",
    confirm: "Confirm password",
    minLength: (n: number) => `At least ${n} characters.`,
    mismatch: "Passwords don't match.",
    submit: "Create account",
    pending: "Creating account…",
  },
  "pt-BR": {
    title: "Criar conta",
    name: "Nome",
    email: "E-mail",
    password: "Senha",
    confirm: "Confirmar senha",
    minLength: (n: number) => `Pelo menos ${n} caracteres.`,
    mismatch: "As senhas não coincidem.",
    submit: "Criar conta",
    pending: "Criando conta…",
  },
});

export interface SignupValues {
  name: string;
  email: string;
  password: string;
}
export interface SignupFormProps {
  onSubmit: (values: SignupValues) => void;
  pending?: boolean;
  error?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  minPasswordLength?: number;
  terms?: ReactNode;
  footer?: ReactNode;
}
export function SignupForm({
  onSubmit,
  pending = false,
  error,
  title,
  description,
  submitLabel,
  minPasswordLength = 12,
  terms,
  footer,
}: SignupFormProps) {
  const id = useId(),
    t = useMessages(messages),
    [mismatch, setMismatch] = useState(false);
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title ?? t.title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const password = String(data.get("password") ?? "");
            if (password !== String(data.get("confirmPassword") ?? "")) {
              setMismatch(true);
              return;
            }
            setMismatch(false);
            onSubmit({
              name: String(data.get("name") ?? ""),
              email: String(data.get("email") ?? ""),
              password,
            });
          }}
        >
          <FieldGroup>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Field>
              <FieldLabel htmlFor={`${id}-name`}>{t.name}</FieldLabel>
              <Input
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                required
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-email`}>{t.email}</FieldLabel>
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-password`}>{t.password}</FieldLabel>
              <Input
                id={`${id}-password`}
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={minPasswordLength}
                disabled={pending}
              />
              <FieldDescription>
                {t.minLength(minPasswordLength)}
              </FieldDescription>
            </Field>
            <Field data-invalid={mismatch || undefined}>
              <FieldLabel htmlFor={`${id}-confirm`}>{t.confirm}</FieldLabel>
              <Input
                id={`${id}-confirm`}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={mismatch || undefined}
                aria-describedby={mismatch ? `${id}-mismatch` : undefined}
                disabled={pending}
                onChange={() => setMismatch(false)}
              />
              {mismatch ? (
                <FieldDescription id={`${id}-mismatch`} role="alert">
                  {t.mismatch}
                </FieldDescription>
              ) : null}
            </Field>
            {terms ? <FieldDescription>{terms}</FieldDescription> : null}
            <Button type="submit" disabled={pending}>
              {pending ? t.pending : (submitLabel ?? t.submit)}
            </Button>
            {footer ? (
              <div className="text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
