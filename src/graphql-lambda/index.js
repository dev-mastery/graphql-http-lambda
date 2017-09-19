import getGraphqlResponse from '../graphql-response'
import createGraphqlLambda from './graphql-lambda'

const createGraphqlHandler = createGraphqlLambda({ getGraphqlResponse })

export default createGraphqlHandler
