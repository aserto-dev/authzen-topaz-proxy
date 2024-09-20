export interface AuthZenRequest {
  subject: {
    type: string
    id: string
    properties?: {
      [key: string]: string
    }
  }
  action: {
    name: string
    properties?: {
      [key: string]: string
    }
  }
  resource?: {
    type: string
    id: string
    properties?: {
      [key: string]: string
    }
  }
  context?: {
    [key: string]: string
  }
}
