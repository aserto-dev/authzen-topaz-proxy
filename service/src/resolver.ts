import axios from 'axios';
import { AuthZEN, AuthZENConfig, EvaluationRequest, EvaluationsRequest } from './interface';

export class AuthZENResolver implements AuthZEN {
  config: AuthZENConfig
  private evaluationEndpoint: string
  private evaluationsEndpoint: string

  constructor(config: AuthZENConfig) {
    // TODO: validate config
    this.config = config
    this.evaluationEndpoint = config.evaluationEndpoint ? config.baseUrl + config.evaluationEndpoint : config.baseUrl
    this.evaluationsEndpoint = config.evaluationsEndpoint ? config.baseUrl + config.evaluationsEndpoint : config.baseUrl
  }

  async evaluation(evaluationRequest: EvaluationRequest): Promise<boolean> {
    // do the actual request
    // set this.headers
    // POST this.baseUrl || this.evaluationEndpoint
    const response = await axios.post(this.evaluationEndpoint, evaluationRequest, {
      headers: this.config.headers
    })

    return response.data
  }

  async evaluations(evaluationsRequest: EvaluationsRequest): Promise<boolean[]> {
    // do the actual request
    // set this.headers
    // POST this.baseUrl || this.evaluationsEndpoint
    // TODO: add error handling
    const response = await axios.post(this.evaluationsEndpoint, evaluationsRequest, {
      headers: this.config.headers
    })

    return response.data
  }
}

