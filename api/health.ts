import { list } from '@vercel/blob'
import { dbConfigured, getDb } from '../server/db.js'
import { json } from '../server/http.js'

// GET -> which backing services are connected. Handy after setting up the Vercel project.
export async function GET() {
  const status = { database: 'not configured', blob: 'not configured' }
  if (dbConfigured()) {
    try {
      await (await getDb()).execute('SELECT 1')
      status.database = 'ok'
    } catch {
      status.database = 'error'
    }
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await list({ limit: 1 })
      status.blob = 'ok'
    } catch {
      status.blob = 'error'
    }
  }
  return json(status)
}
