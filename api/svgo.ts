import type { VercelRequest, VercelResponse } from '@vercel/node'

import { optimize } from 'svgo'

const htmlForm = `
<form method="post" action="/api/svgo" style="display: flex; flex-direction: column;">
  <label>source svg</label>
  <textarea name="svg"></textarea>
  <label>config</label>
  <textarea name="config"></textarea>
  <button type="submit">submit</button>
</form>

<div></div>

<script>
document.querySelector('form').addEventListener('submit', async ev => {
  ev.preventDefault()
  ev.target.nextElementSibling.innerHTML = ''

  const data = Object.fromEntries(new FormData(ev.target))

  const action = ev.target.getAttribute('action')
  const method = ev.target.getAttribute('method')

  const res = await fetch(action, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      svg: data.svg,
      config: JSON.parse(data.config || '{}')
    })
  })

  ev.target.nextElementSibling.innerHTML = await res.text()
})
</script>
`

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log(req.method)

  if (req.method?.toLowerCase() === 'get') {
    return res.status(200).setHeader('content-type', 'text/html').end(htmlForm)
  }

  if (req.method?.toLowerCase() === 'post') {
    const { svg, config } = req.body
    const result = optimize(svg, config)
    return res.setHeader('content-type', 'image/svg+xml').end(result.data)
  }

  res.status(404).end()
}
