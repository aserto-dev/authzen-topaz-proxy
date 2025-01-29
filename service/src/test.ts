import { AuthZENResolver } from "./resolver";

const resolver = new AuthZENResolver({
  baseUrl: 'http://localhost:8181',
  evaluationEndpoint: '/access/v1/evaluation',
  evaluationsEndpoint: '/access/v1/evaluation',
  headers: {
    'foo': 'bar'
  }
})

resolver.evaluation({
  subject: {
    type: "user",
    id: "rick@the-citadel.com"
  },
  action: {
    name: "GET.todos"
  },
  resource: {
    type: "user",
    id: "rick@the-citadel.com"
  }
}).then((result) => {
  console.log(result)
}).catch((error) => {
  console.error(error)
})
