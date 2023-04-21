import type { VercelApiHandler } from '@vercel/node'

function lambda(...handlers: VercelApiHandler[]): VercelApiHandler {
  return async (req, res) => {
    for (const handler of handlers) {
      await handler(req, res)
      if (res.writableEnded) break
    }
  }
}

export const l = lambda
export const λ = lambda
