import Link from 'next/link'

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-zinc-950">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/landing-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-end px-4 pb-16">
        <Link
          href="/home"
          className="rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-colors hover:bg-violet-500"
        >
          Enter
        </Link>
      </div>
    </main>
  )
}
