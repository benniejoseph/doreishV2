import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Doreish Command Center</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Local-first Grafana-ish monitoring UI (MVP). This runs on your MacBook and talks to OpenClaw + Ruflo.
        </p>

        <div className="mt-4 flex gap-3">
          <Link className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" href="/timeline">
            Timeline
          </Link>
          <Link className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" href="/swarm">
            Ruflo Swarm
          </Link>
          <Link className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" href="/agents">
            Ruflo Agents
          </Link>
          <Link className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" href="/runbooks">
            Runbooks
          </Link>
          <Link className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" href="/tasks">
            Tasks
          </Link>
        </div>
      </div>
    </main>
  );
}
