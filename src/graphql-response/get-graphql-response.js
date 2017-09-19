import requiredParam from '../utils/required-param'
import HttpError from '../utils/http-error'

export default function createGetGraphqlResponse ({
  graphql = requiredParam('options.graphql'),
  buildSchema = requiredParam('options.buildSchema')
}) {
  return async function getGraphqlResponse (
    {
      body,
      context,
      headers,
      httpMethod,
      logger = console,
      queryStringParameters,
      resolver,
      schema = requiredParam('options.schema')
    } = {}
  ) {
    try {
      validateMethod(httpMethod)

      let { query, operation, variables } = getGraphqlFromQueryString(
        queryStringParameters
      )

      if (headers && headers['Content-Type'] === 'application/graphql') {
        query = body || query
      } else {
        ;({
          query = query,
          operation = operation,
          variables = variables
        } = getGraphqlFromJsonBody(body))
      }

      validateQuery(query)

      const schemaObject = buildSchema(schema)
      const resolvedQuery = await graphql(
        schemaObject,
        query,
        resolver,
        context,
        variables,
        operation
      )

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resolvedQuery)
      }
    } catch (error) {
      if (error instanceof HttpError) {
        return {
          body: error.body,
          headers: error.headers,
          statusCode: error.statusCode
        }
      }
      logger.error(error)
      return {
        body: 'Internal Server Error',
        statusCode: 500
      }
    }
  }

  function validateMethod (httpMethod) {
    const ACCEPTED_METHODS = ['GET', 'POST']
    if (ACCEPTED_METHODS.includes(httpMethod)) {
      return
    }

    throw new HttpError({
      statusCode: 405,
      headers: [{ Accept: ACCEPTED_METHODS.join(', ') }],
      body: 'Method not allowed. See Accept header for allowed methods.'
    })
  }

  function validateQuery (query) {
    if (!query) {
      throw new HttpError({
        statusCode: 400,
        body: 'Bad Request. Request must contain a GaphQL Query'
      })
    }
  }

  function getGraphqlFromQueryString (queryStringParameters) {
    let { query, operation, variables } = queryStringParameters || {}
    variables = parseVariables(variables)
    return { query, operation, variables }
  }

  function parseVariables (variables) {
    try {
      return variables && JSON.parse(variables)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpError({
          statusCode: 400,
          body: 'Bad Request. Variables property is not a valid JSON string.'
        })
      }
      throw error
    }
  }

  function getGraphqlFromJsonBody (body) {
    try {
      const bodyAsJson = body && JSON.parse(body)
      return {
        query: bodyAsJson && bodyAsJson.query,
        operation: bodyAsJson && bodyAsJson.operation,
        variables: bodyAsJson && bodyAsJson.variables
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpError({
          statusCode: 400,
          body: 'Bad Request. Body is not a valid JSON string. If you are trying to send graphql as the body, please set your "Content-Type" header to "application/graphql"'
        })
      }
      throw error
    }
  }
}
