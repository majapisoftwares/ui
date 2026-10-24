import { Skeleton } from "@workbench/ui/components/skeleton";
export default function Loading() {
  return (
    <main className="flex flex-col gap-5 p-8" aria-label="Carregando página">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </main>
  );
}
