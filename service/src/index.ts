import express, { Response } from 'express'
import { Request as JWTRequest } from 'express-jwt'
import cors from 'cors'
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import path from 'path'

import { Authorizer, identityContext, policyContext, policyInstance } from '@aserto/aserto-node'
import { getConfig } from './config'
import { EvaluationRequest, EvaluationsRequest } from './interface'
import { TopazAuthzen } from './topaz'

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

const authZen = new TopazAuthzen({}, authClient, authzOptions)

async function evaluationHandler(req: JWTRequest, res: Response) {
  try {
    const request: EvaluationRequest = req.body
    res.status(200).send(authZen.evaluation(request))

  } catch (error) {
    console.error(error)
    res.status(422).send({ error: (error as Error).message })
  }
}


async function evaluationsHandler(req: JWTRequest, res: Response) {
  try {
    const request: EvaluationsRequest = req.body
    res.status(200).send(authZen.evaluations(request))
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
