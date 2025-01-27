import { Application } from 'express';
import { AuthZEN, AuthZENConfig, AuthZENResolver, EvaluationRequest, EvaluationsRequest } from './interface';
import { Request as JWTRequest } from 'express-jwt'
import { Response } from 'express'
export class AuthZENImpl implements AuthZEN {
  registerResolver(app: Application, config: AuthZENConfig, resolver: AuthZENResolver): void {
    const evaluationEndpoint = config.evaluationEndpoint || '/access/v1/evaluation'
    const evaluationsEndpoint = config.evaluationsEndpoint || '/access/v1/evaluations'
    async function evaluationHandler(req: JWTRequest, res: Response) {
      try {
        const request: EvaluationRequest = req.body
        res.status(200).send(resolver.evaluation(request))

      } catch (error) {
        console.error(error)
        res.status(422).send({ error: (error as Error).message })
      }
    }


    async function evaluationsHandler(req: JWTRequest, res: Response) {
      try {
        const request: EvaluationsRequest = req.body
        res.status(200).send(resolver.evaluations(request))
      } catch (error) {
        console.error(error)
        res.status(422).send({ error: (error as Error).message })
      }
    }

    app.post(evaluationEndpoint, evaluationHandler)
    app.post(evaluationsEndpoint, evaluationsHandler)
  }
}
