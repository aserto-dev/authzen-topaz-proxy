import { Authorizer, AuthzOptions, identityContext, policyContext, policyInstance } from "@aserto/aserto-node"
import { AuthZENResolver, AuthZENConfig, EvaluationRequest, EvaluationResponse, EvaluationsRequest, EvaluationsResponse } from "./interface"

export class TopazAuthzen implements AuthZENResolver {
  private authClient: Authorizer
  private authzOptions: AuthzOptions
  private instanceName: string

  constructor(authClient: Authorizer, authzOptions: AuthzOptions) {
    this.authzOptions = authzOptions
    this.authClient = authClient
    this.instanceName = this.authzOptions.instanceName || 'todo'
  }

  async evaluation(request: EvaluationRequest): Promise<EvaluationResponse> {
    const identity = request.subject?.id
    const actionName = request.action?.name
    const resource = request.resource

    let decision = false
    if (identity && actionName) {
      try {
        decision =
          (await this.authClient.Is({
            identityContext: identityContext(identity, 'SUB'),
            policyInstance: policyInstance(this.instanceName),
            policyContext: policyContext(`todoApp.${actionName}`, ['allowed']),
            resourceContext: { ...resource },
          })) ?? false
      } catch (e) {
        console.error(e)
      }
    }
    return { decision, context: {} }
  }

  async evaluations(request: EvaluationsRequest): Promise<EvaluationsResponse> {
    const evaluations = request.evaluations?.map((e) => ({
      subject: e.subject ?? request.subject,
      action: e.action ?? request.action,
      resource: e.resource ?? request.resource,
      context: e.context ?? request.context,
    })) ?? [request]

    const evalResponse = await Promise.all(
      evaluations.map(async (e) => {
        const decision =
          (await this.authClient.Is({
            identityContext: identityContext(e.subject!.id, 'SUB'),
            policyInstance: policyInstance(this.instanceName),
            policyContext: policyContext(`todoApp.${e.action!.name}`, ['allowed']),
            resourceContext: { ...e.resource },
          })) ?? false
        return { decision, context: {} }
      })
    )
    return { decisions: evalResponse }
  }
}
