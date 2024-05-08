export interface AuthZenRequest {
  subject: {
    identity: string
  }
  action: {
    name: string
  }
  resource?: {
    ownerID: string
    type?: string
  }
  context?: {
    [key: string]: string
  }
}


