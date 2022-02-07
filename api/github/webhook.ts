import { existsSync } from 'fs'
import { join } from 'path'

import type { VercelRequest, VercelResponse } from '@vercel/node'

import {
  PushEvent,
  PullRequestEvent,
  PullRequestReviewEvent,
  WorkflowJobEvent,
  WorkflowRunEvent,
} from '@octokit/webhooks-types'

import { config } from 'dotenv'
import express, { Request } from 'express'
import { snakeCase } from 'snake-case'

import { withSecret } from '../../lib'

type AnyObj = Record<string, unknown>

const HOOKS: Record<string, string> = {
  push: '/push',
  pull_request: '/pull_request',
  pull_request_review: '/pull_request_review',
  workflow_run: '/workflow_run',
  workflow_job: '/workflow_job',
}

// load dotenv
config()

// create app
const app = express()

// homepage
app.get('/', (req, res) =>
  res.end(`Currently supported hooks: ${Object.keys(HOOKS).join(', ')}`),
)

// first determine which hook to parse
app.post('*', (req, res, next) => {
  const hook = req.headers['x-github-event']

  if (typeof hook === 'string' && hook in HOOKS) {
    req.url = HOOKS[hook]
    return next()
  }

  return res.status(404).end(`hook '${hook}' not supported`)
})

/*
  Routing strategy is:
  --------------------

  /{project_name}/on_push/
  /{project_name}/on_pr/
  /{project_name}/on_pr_review/
  /{project_name}/on_{workflow_name}/
  /{project_name}/on_{job_name}/
*/

// each hook has a different payload, so we need to be careful
app.post('/push', (req: Request<AnyObj, AnyObj, PushEvent>, res, next) => {
  const { repository } = req.body
  req.url = `/${repository.name}/on_push`
  next()
})

app.post(
  '/pull_request',
  (req: Request<AnyObj, AnyObj, PullRequestEvent>, res, next) => {
    const { repository } = req.body
    req.url = `/${repository.name}/on_pr`
    next()
  },
)

app.post(
  '/pull_request_review',
  (req: Request<AnyObj, AnyObj, PullRequestReviewEvent>, res, next) => {
    const { repository } = req.body
    req.url += `/${repository.name}/on_pr_review`
    next()
  },
)

app.post(
  '/workflow_run',
  (req: Request<AnyObj, AnyObj, WorkflowRunEvent>, res, next) => {
    const { repository, workflow_run } = req.body
    req.url = `/${repository.name}/on_${snakeCase(workflow_run.name)}`
    next()
  },
)

app.post(
  '/workflow_job',
  (req: Request<AnyObj, AnyObj, WorkflowJobEvent>, res, next) => {
    const { repository, workflow_job } = req.body
    req.url = `/${repository.name}/on_${snakeCase(workflow_job.name)}`
    next()
  },
)

// finally when flattened, we can run the function
app.post(
  '/:project/:method/',
  async (req: Request<{ method: string; project: string }>, res) => {
    const { project, method } = req.params

    const module = join(process.cwd(), `./projects/${project}`)

    if (!existsSync(module))
      return res
        .status(404)
        .end(`project '${project}' not found. Please recheck.`)

    const functions = await import(module)

    if (!functions[method])
      return res
        .status(401)
        .end(`method '${method}' not found in module 'projects/${project}'`)

    const { [method]: fn } = functions

    // end it anyway.
    await Promise.resolve()
      .then(() => fn(req.body))
      .then(() => {
        console.log(`OK ${project}/${method}`)
        res.send(`OK ${project}/${method}`)
      })
      .catch(async (err) => {
        const message = !err
          ? 'Unknown error'
          : err.isAxiosError
          ? JSON.stringify(err.response.data)
          : err instanceof Error
          ? `${err.message} ${err.stack}`
          : err

        console.error('Error:', message)
        res.status(500).end(message)
      })
  },
)

app.all('*', (req, res) => res.status(404).end(':('))

export default withSecret((req: VercelRequest, res: VercelResponse) =>
  // @ts-ignore
  app.handle(req, res),
)
