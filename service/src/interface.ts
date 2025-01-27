import { Router } from 'express'

export interface AuthZENObject {
  type: string
  id: string
  properties?: {
    [key: string]: string
  }
}

export type Subject = AuthZENObject

export type Resource = AuthZENObject

export interface Action {
  name: string
  properties?: {
    [key: string]: string
  }
}

export interface Context {
  [key: string]: string
}

export interface EvaluationRequest {
  subject: Subject
  action: Action
  resource: Resource
  context?: Context
}

export interface Evaluations {
  subject?: Subject
  action?: Action
  resource?: Resource
  context?: Context
}

export interface EvaluationsRequest extends Evaluations {
  evaluations?: Evaluations[]
}

interface CustomHeaders {
  [key: string]: string
}
export interface AuthZENConfig {
  baseUrl?: string
  evaluationEndpoint?: string
  evaluationsEndpoint?: string
  headers?: CustomHeaders
}

export interface EvaluationResponse {
  decision: boolean
  context: Context
}

export interface EvaluationsResponse {
  decisions: EvaluationResponse[]
}

export interface AuthZENResolver {
  evaluation(request: EvaluationRequest): Promise<EvaluationResponse>
  evaluations(request: EvaluationsRequest): Promise<EvaluationsResponse>
}

export interface AuthZEN {
  registerResolver(config: AuthZENConfig, resolver: AuthZENResolver): Router
}
