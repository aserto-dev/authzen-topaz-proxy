import express, { Response } from 'express'
import { Request as JWTRequest } from 'express-jwt'
import cors from 'cors'
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import path from 'path'

import { Authorizer, identityContext, policyContext, policyInstance } from '@aserto/aserto-node'
import { getConfig } from './config'
import { AuthZenRequest } from './interface'

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

const pathMappings: Record<string, string> = {
  can_read_user: 'todoApp.GET.users.__userID',
  can_read_todos: 'todoApp.GET.todos',
  can_create_todo: 'todoApp.POST.todos',
  can_update_todo: 'todoApp.PUT.todos.__id',
  can_delete_todo: 'todoApp.DELETE.todos.__id',
}

const instanceName = authzOptions.instanceName || 'todo'
const instanceLabel = authzOptions.instanceLabel || 'todo'

async function handler(req: JWTRequest, res: Response) {
  const request: AuthZenRequest = req.body
  const identity = request.subject?.identity
  const policyPath = pathMappings[request?.action?.name]
  const ownerID = request.resource?.ownerID
  let decision = false
  if (identity && policyPath) {
    try {
      decision =
        (await authClient.Is({
          identityContext: identityContext(identity, 'SUB'),
          policyInstance: policyInstance(instanceName, instanceLabel),
          policyContext: policyContext(policyPath, ['allowed']),
          resourceContext: ownerID ? { ownerID } : {},
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

app.post('/access/v1/evaluation', handler)
app.post('/access/v1/evaluations', handler)

// main endpoint serves react bundle from /build
app.use(express.static(path.join(__dirname, '..', 'build')))
// serve all /ui client-side routes from the /build bundle
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
})
