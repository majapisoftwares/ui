"use client";

import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@majapisoftwares/ui/components/empty";
import { Button } from "@majapisoftwares/ui/components/button";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import { messages } from "@/messages";

export function NotFoundView() {
  const t = useMessages(messages);
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyTitle>{t.notFound}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link href="/" />} nativeButton={false}>
          {t.home}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
