import type {
  VercelApiHandler,
  VercelRequest,
  VercelResponse,
} from '@vercel/node'

export const allowCors =
  (handler: VercelApiHandler) => (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', '*')

    return handler(req, res)
  }
