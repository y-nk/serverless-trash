import { VercelApiHandler, VercelRequest, VercelResponse } from '@vercel/node'

import axios, { Method } from 'axios'

type ProxyConfig = {
  proxyUrl?: string
  shouldProxy?: (req: VercelRequest) => boolean
}

const WITH_PROXY_HEADER = 'x-withproxy'

export const withProxy =
  (proxyConfig: ProxyConfig, handler: VercelApiHandler) =>
  async (req: VercelRequest, res: VercelResponse) => {
    const { proxyUrl, shouldProxy = () => !!proxyUrl } = proxyConfig

    // disabled
    if (!proxyUrl || !shouldProxy(req)) {
      return handler(req, res)
    }

    // already proxied! (avoid loops)
    if (WITH_PROXY_HEADER in req.headers) {
      return handler(req, res)
    }

    const proxyHeaders = {
      [WITH_PROXY_HEADER]: 'true',
      ...Object.entries(req.headers)
        .filter(
          ([k]) =>
            k !== 'host' &&
            !k.startsWith('x-forwarded') &&
            !k.startsWith('x-vercel') &&
            !k.startsWith('x-real-ip'),
        )
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v.toString() }), {}),
    }

    const { status, headers, data } = await axios({
      url: `${proxyUrl}${req.url}`,
      method: req.method as unknown as Method,
      headers: proxyHeaders,
      params: req.query,
      data: JSON.stringify(req.body),
      validateStatus: () => true,
    })

    res.status(status)
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
    res.json(data)
    return
  }
