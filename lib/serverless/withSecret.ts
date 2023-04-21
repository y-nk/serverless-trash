import type { VercelRequest, VercelResponse } from '@vercel/node'

export function withSecret(req: VercelRequest, res: VercelResponse) {
  const api_secret = process?.env.API_SECRET?.trim() ?? ''

  if (!api_secret.length) {
    res.status(500).end('Unprotected endpoint')
  }

  if (req.headers['authorization'] !== `Bearer ${api_secret}`) {
    res.status(401).end('Unauthorized')
  }
}
