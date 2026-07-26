import Link from 'next/link'

export default function Page() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-zinc-950">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/landing-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <Link
          href="/home"
          className="rounded-full bg-violet-600 px-16 py-5 text-xl font-bold tracking-wide text-white shadow-2xl shadow-violet-600/50 transition-all hover:scale-105 hover:bg-violet-500 hover:shadow-violet-500/60"
        >
          Enter
        </Link>
      </div>
    </main>
  )
}
