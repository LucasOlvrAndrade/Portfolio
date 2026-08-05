export function RepoSkeleton() {
  return (
    <div
      className="animate-skeleton rounded-xl border border-border bg-surface p-6"
      aria-hidden="true"
    >
      <div className="h-4 w-2/5 rounded bg-surface-2" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-surface-2" />
        <div className="h-3 w-4/5 rounded bg-surface-2" />
      </div>
      <div className="mt-8 flex gap-3">
        <div className="h-3 w-16 rounded bg-surface-2" />
        <div className="h-3 w-12 rounded bg-surface-2" />
        <div className="h-3 w-20 rounded bg-surface-2" />
      </div>
    </div>
  );
}

export function RepoSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid gap-5 sm:grid-cols-2"
    >
      <span className="sr-only">Carregando projetos do GitHub…</span>
      {Array.from({ length: count }, (_, index) => (
        <RepoSkeleton key={index} />
      ))}
    </div>
  );
}
