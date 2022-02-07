# Serverless trash

Let's be real, devs. We all have thousands of projects we'll never finish, and ever more we'll never start.

**That's why i created this repo.** I know perfectly that I won't never do whatever I wanna do if it takes more than 30s to do it ; that infra should not cost anything, and that all the pipelines should already be ready.

This repo is a simple barebone vercel app which aim is to deploy only lambda functions easily. It's pre-configured, and only need a few env vars here and there to make it somehow safe.

## Features

1. Typescript native, thanks to vercel

2. Auto deploy thanks to vercel and github actions

3. Preview deployments on pull requests, if I ever needed to PR myself

4. A bunch of pre-configured api clients and other neat tools on `/lib` (I couldn't use `/api` since Vercel reserves the `/api` for their lambdas)

5. `.env` support (it's normally at nextjs' level, Vercel only allows to pull the file from cli)

6. `eslint` as testing, because I don't need more than Typescript already provides

7. Fairly straightforward generators with `plop`

## Setup

There's pretty much no setup. Simply clone and run in Vercel should do. Depending on what you aim to use, _maybe_ some environment variables will be expected.

## Recommendations

Protect all your endpoints against spamming:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

import { config } from 'dotenv'
import { withSecret } from '../lib'

config()

export default withSecret((req: VercelRequest, res: VercelResponse) => {
  res.status(200).end('OK')
})
`
