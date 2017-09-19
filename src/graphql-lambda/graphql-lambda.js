import requiredParam from '../utils/required-param'

export default function createGraphqlLambda (
  { getGraphqlResponse = requiredParam('options.getGraphqlResponse') } = {}
) {
  return function createGraphqlHandler (
    {
      schema = requiredParam('options.schema'),
      resolver,
      context = {},
      logger
    } = {}
  ) {
    return async function (event, lambdaContext, callback) {
      try {
        context.request = event
        const response = await getGraphqlResponse({
          ...event,
          context,
          logger,
          resolver,
          schema
        })
        callback(null, response)
      } catch (error) {
        callback(error)
      }
    }
  }
}
