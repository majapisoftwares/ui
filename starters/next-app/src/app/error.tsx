"use client";

import { Button } from "@majapisoftwares/ui/components/button";
import { Alert, AlertTitle } from "@majapisoftwares/ui/components/alert";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import { messages } from "@/messages";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useMessages(messages);
  return (
    <main className="flex flex-col items-start gap-4 p-6">
      <Alert variant="destructive">
        <AlertTitle>{t.errorTitle}</AlertTitle>
      </Alert>
      <Button onClick={reset}>{t.retry}</Button>
    </main>
  );
}
