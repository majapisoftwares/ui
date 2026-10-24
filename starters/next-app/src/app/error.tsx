"use client";
import { Button } from "@majapisoftwares/ui/components/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@majapisoftwares/ui/components/alert";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex flex-col gap-5 p-8">
      <Alert variant="destructive">
        <AlertTitle>Não foi possível carregar esta página</AlertTitle>
        <AlertDescription>Tente novamente em instantes.</AlertDescription>
      </Alert>
      <Button onClick={reset}>Tentar novamente</Button>
    </main>
  );
}
