import { Skeleton } from "@majapisoftwares/ui/components/skeleton";

export default function Loading() {
  return (
    <main className="flex flex-col gap-4 p-6" aria-busy="true">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </main>
  );
}
