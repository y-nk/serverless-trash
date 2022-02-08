import type { VercelRequest, VercelResponse } from '@vercel/node'

import { nanoid } from 'nanoid'
import { getStoreSession } from '../../lib'

export type Bin = {
  binId: string
  expiresAt: number
  data: {
    version: string
    method: string
    headers: Record<string, string | string[] | undefined>
    cookies: Record<string, string>
    query: Record<string, string | string[]>
    body: any
  }
}

const EXPIRY = 5 * 60 * 1000

export default async (req: VercelRequest, res: VercelResponse) => {
  const session = await getStoreSession('reqbin')

  const binId = nanoid()
  const expiresAt = Date.now() + EXPIRY

  await session.store({ expiresAt }, binId)
  await session.saveChanges()

  res.status(200).json({ binId, expiresAt })
}
