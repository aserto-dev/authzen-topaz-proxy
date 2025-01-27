import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import path from 'path'

import { Authorizer,} from '@aserto/aserto-node'
import { getConfig } from './config'
import { TopazAuthzen } from './topaz'
import { AuthZENImpl } from './authzen'
import { AuthZENConfig } from './interface';

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

// register AuthZEN resolver
const authZENConfig: AuthZENConfig = {
  evaluationEndpoint: '/access/v1/evaluation',
  evaluationsEndpoint: '/access/v1/evaluations',
  headers: {},
}
const authZenResolver = new TopazAuthzen(authClient, authzOptions)
app.use(new AuthZENImpl().registerResolver(authZENConfig, authZenResolver))


// main endpoint serves react bundle from /build
app.use(express.static(path.join(__dirname, '..', 'build')))
// serve all /ui client-side routes from the /build bundle
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
})
