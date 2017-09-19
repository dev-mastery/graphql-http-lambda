import { graphql, buildSchema } from 'graphql'
import createGetGraphqlHttpResponse from './get-graphql-response'

const getGraphqlHttpResponse = createGetGraphqlHttpResponse({
  graphql,
  buildSchema
})

export default getGraphqlHttpResponse
