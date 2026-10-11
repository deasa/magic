import { createClient, type Client } from '@libsql/client'
import { SCHEMA } from './schema.js'

let client: Client | null = null
let ready: Promise<void> | null = null

/** True when the Turso connection settings are present. */
export const dbConfigured = () => Boolean(process.env.TURSO_DATABASE_URL)

/** Shared Turso client, created on first use and reused across warm invocations. */
export async function getDb(): Promise<Client> {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL
    if (!url) throw new Error('TURSO_DATABASE_URL is not set')
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  }
  ready ??= applySchema(client)
  await ready
  return client
}

export async function applySchema(db: Client) {
  await db.executeMultiple(SCHEMA)
}
