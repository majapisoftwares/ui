import { useId, useState, type ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "../components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

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
  footer?: ReactNode;
  terms?: ReactNode;
}
export function SignupForm({
  onSubmit,
  pending = false,
  error,
  title = "Criar sua conta",
  description = "Comece a organizar seu trabalho em um só lugar.",
  submitLabel = "Criar conta",
  minPasswordLength = 12,
  footer,
  terms,
}: SignupFormProps) {
  const id = useId(),
    [mismatch, setMismatch] = useState(false);
  return (
    <form
      className="wb-auth-form"
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
      <header>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível criar a conta</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>Nome completo</FieldLabel>
          <Input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            required
            disabled={pending}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>E-mail</FieldLabel>
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
          <FieldLabel htmlFor={`${id}-password`}>Senha</FieldLabel>
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
            Use pelo menos {minPasswordLength} caracteres.
          </FieldDescription>
        </Field>
        <Field data-invalid={mismatch || undefined}>
          <FieldLabel htmlFor={`${id}-confirm`}>Confirmar senha</FieldLabel>
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
              As senhas precisam ser iguais.
            </FieldDescription>
          ) : null}
        </Field>
        {terms ? <FieldDescription>{terms}</FieldDescription> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Criando conta…" : submitLabel}
        </Button>
      </FieldGroup>
      {footer ? <footer>{footer}</footer> : null}
    </form>
  );
}
