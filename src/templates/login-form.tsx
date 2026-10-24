"use client";

import { useId, type ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "../components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

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
  footer?: ReactNode;
  recovery?: ReactNode;
  alternative?: ReactNode;
}
export function LoginForm({
  onSubmit,
  pending = false,
  error,
  title = "Entrar na sua conta",
  description = "Use seu e-mail e senha para continuar.",
  submitLabel = "Entrar",
  footer,
  recovery,
  alternative,
}: LoginFormProps) {
  const id = useId();
  return (
    <form
      className="wb-auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        });
      }}
      aria-busy={pending}
    >
      <header>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível entrar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>E-mail</FieldLabel>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="username"
            placeholder="voce@empresa.com"
            required
            disabled={pending}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-password`}>Senha</FieldLabel>
          <Input
            id={`${id}-password`}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
          />
          {recovery ? <FieldDescription>{recovery}</FieldDescription> : null}
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Entrando…" : submitLabel}
        </Button>
      </FieldGroup>
      {alternative}
      {footer ? <footer>{footer}</footer> : null}
    </form>
  );
}
