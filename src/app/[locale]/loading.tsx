export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-24 bg-bg-surface rounded" />
        <div className="rounded-3xl border border-border bg-bg-surface p-6 md:p-8 space-y-4">
          <div className="h-3 w-20 bg-bg-surface rounded" />
          <div className="h-10 w-3/4 bg-bg-surface rounded" />
          <div className="h-4 w-full bg-bg-surface rounded" />
          <div className="h-4 w-2/3 bg-bg-surface rounded" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="h-20 rounded-2xl bg-bg-surface" />
            <div className="h-20 rounded-2xl bg-bg-surface" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 rounded-xl bg-bg-surface" />
          <div className="h-40 rounded-xl bg-bg-surface" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-bg-surface" />
          ))}
        </div>
      </div>
    </main>
  );
}
