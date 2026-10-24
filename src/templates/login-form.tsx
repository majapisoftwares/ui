"use client";

import { useId, type ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Field, FieldGroup, FieldLabel } from "../components/ui/field";
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
    title: "Welcome back",
    email: "Email",
    password: "Password",
    submit: "Log in",
    pending: "Logging in…",
  },
  "pt-BR": {
    title: "Bem-vindo de volta",
    email: "E-mail",
    password: "Senha",
    submit: "Entrar",
    pending: "Entrando…",
  },
});

export interface LoginValues {
  email: string;
  password: string;
}
export interface LoginFormProps {
  onSubmit: (values: LoginValues) => void;
  pending?: boolean;
  error?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  /** Shown next to the password label, e.g. a "Forgot password?" link. */
  recovery?: ReactNode;
  /** Shown above the fields, e.g. OAuth buttons. */
  alternative?: ReactNode;
  footer?: ReactNode;
}
export function LoginForm({
  onSubmit,
  pending = false,
  error,
  title,
  description,
  submitLabel,
  recovery,
  alternative,
  footer,
}: LoginFormProps) {
  const id = useId();
  const t = useMessages(messages);
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
            onSubmit({
              email: String(data.get("email") ?? ""),
              password: String(data.get("password") ?? ""),
            });
          }}
        >
          <FieldGroup>
            {alternative}
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Field>
              <FieldLabel htmlFor={`${id}-email`}>{t.email}</FieldLabel>
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={pending}
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor={`${id}-password`}>{t.password}</FieldLabel>
                {recovery ? (
                  <div className="ml-auto text-sm">{recovery}</div>
                ) : null}
              </div>
              <Input
                id={`${id}-password`}
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={pending}
              />
            </Field>
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
