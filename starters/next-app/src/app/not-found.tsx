import Link from "next/link";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@workbench/ui/components/empty";
import { Button } from "@workbench/ui/components/button";
export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Página não encontrada</EmptyTitle>
        <EmptyDescription>
          Confira o endereço ou volte para a visão geral.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link href="/dashboard" />} nativeButton={false}>
          Voltar ao início
        </Button>
      </EmptyContent>
    </Empty>
  );
}
