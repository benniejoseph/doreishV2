export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto mt-24 max-w-md rounded border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Doreish Command Center is protected by Google authentication.
        </p>
        <a
          className="mt-4 inline-flex rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          href="/api/auth/signin"
        >
          Continue with Google
        </a>
      </div>
    </main>
  );
}
