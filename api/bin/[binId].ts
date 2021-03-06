import type { VercelRequest, VercelResponse } from '@vercel/node'

import { allowCors } from '../../lib'
import { getStoreSession } from '../../lib'

import type { Bin } from '.'

export default allowCors(async (req: VercelRequest, res: VercelResponse) => {
  const binId = req.query.binId.toString()
  const session = await getStoreSession('reqbin')

  const storedBin = await session.load<Bin>(binId)

  // Invalid
  if (!storedBin) {
    return res.status(404).end('Not found')
  }

  // Expired
  if (storedBin.expiresAt - Date.now() < 0) {
    await session.delete(binId)
    return res.status(410).end('Gone')
  }

  // Recorded
  if (req.method === 'GET' && storedBin.data) {
    return res.status(200).json({
      binId,
      expiresAt: storedBin.expiresAt,
      data: storedBin.data,
    })
  }

  // To be recorded
  if (!storedBin.data) {
    // that was in the path...
    delete req.query.binId

    storedBin.data = {
      version: req.httpVersion,
      method: req.method!,
      headers: { ...req.headers },
      cookies: { ...req.cookies },
      query: { ...req.query },
      body: req.body ?? '',
    }

    await session.saveChanges()
    res.status(200).end('Recorded')
  }

  res.status(500).end()
})
