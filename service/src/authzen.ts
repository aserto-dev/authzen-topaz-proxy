import { Application } from 'express';
import { AuthZEN, AuthZENConfig, AuthZENResolver, EvaluationRequest, EvaluationsRequest } from './interface';
import { Request as JWTRequest } from 'express-jwt'
import { Router, Response } from 'express'
export class AuthZENImpl implements AuthZEN {
  registerResolver(config: AuthZENConfig, resolver: AuthZENResolver): Router {
    const evaluationEndpoint = config.evaluationEndpoint || '/access/v1/evaluation'
    const evaluationsEndpoint = config.evaluationsEndpoint || '/access/v1/evaluations'
    const router = Router();

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

    router.post(evaluationEndpoint, evaluationHandler)
    router.post(evaluationsEndpoint, evaluationsHandler)

    return router
  }
}

