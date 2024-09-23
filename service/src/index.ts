import express, { Response } from 'express'
import { Request as JWTRequest } from 'express-jwt'
import cors from 'cors'
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import path from 'path'

import { Authorizer, identityContext, policyContext, policyInstance } from '@aserto/aserto-node'
import { getConfig } from './config'
import { EvaluationRequest, EvaluationsRequest } from './interface'

dotenvExpand.expand(dotenv.config())

const app: express.Application = express()
app.use(express.json())
app.use(cors())

const authzOptions = getConfig()
const authClient = new Authorizer({
  authorizerServiceUrl: authzOptions.authorizerServiceUrl,
  authorizerApiKey: authzOptions.authorizerApiKey,
  tenantId: authzOptions.tenantId,
  authorizerCertFile: authzOptions.authorizerCertCAFile,
})

const PORT = authzOptions.port ?? 8080

const instanceName = authzOptions.instanceName || 'todo'
const instanceLabel = authzOptions.instanceLabel || 'todo'

async function evaluationHandler(req: JWTRequest, res: Response) {
  const request: EvaluationRequest = req.body
  const identity = request.subject?.id
  const actionName = request.action?.name
  const resource = request.resource
  let decision = false
  if (identity && actionName) {
    try {
      decision =
        (await authClient.Is({
          identityContext: identityContext(identity, 'SUB'),
          policyInstance: policyInstance(instanceName, instanceLabel),
          policyContext: policyContext(`todoApp.${actionName}`, ['allowed']),
          resourceContext: { ...resource },
        })) ?? false
    } catch (e) {
      console.error(e)
    }
  }

  const response = JSON.stringify({
    decision,
  })

  res.status(200).send(response)
}

async function evaluationsHandler(req: JWTRequest, res: Response) {
  const request: EvaluationsRequest = req.body
  const evaluations = request.evaluations?.map((e) => ({
    subject: e.subject ?? request.subject,
    action: e.action ?? request.action,
    resource: e.resource ?? request.resource,
    context: e.context ?? request.context,
  })) ?? [request]
  try {
    const evalResponse = await Promise.all(
      evaluations.map(async (e) => {
        const decision =
          (await authClient.Is({
            identityContext: identityContext(e.subject!.id, 'SUB'),
            policyInstance: policyInstance(instanceName, instanceLabel),
            policyContext: policyContext(`todoApp.${e.action!.name}`, ['allowed']),
            resourceContext: { ...e.resource },
          })) ?? false
        return { decision }
      })
    )
    res.status(200).json({ evaluations: evalResponse })
  } catch (error) {
    console.error(error)
    res.status(422).send({ error: (error as Error).message })
  }
}

app.post('/access/v1/evaluation', evaluationHandler)
app.post('/access/v1/evaluations', evaluationsHandler)

// main endpoint serves react bundle from /build
app.use(express.static(path.join(__dirname, '..', 'build')))
// serve all /ui client-side routes from the /build bundle
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
})
