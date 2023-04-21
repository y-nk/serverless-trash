import type { VercelRequest, VercelResponse } from '@vercel/node'

export function allowCors(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
}
