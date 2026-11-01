import { getDb } from '@/lib/db'

// Plain route (not a server action) so the client can send it with
// fetch keepalive — survives the page/app being closed mid-request.
export async function POST(req: Request) {
  const { id, progress } = await req.json()
  if (typeof id !== 'string' || typeof progress !== 'number' || !(progress >= 0)) {
    return new Response('bad request', { status: 400 })
  }
  getDb()
    .prepare('UPDATE items SET progress = ?, updated_at = ? WHERE id = ?')
    .run(progress, new Date().toISOString(), id)
  return new Response(null, { status: 204 })
}
