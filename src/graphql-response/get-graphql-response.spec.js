import createGetGraphqlResponse from './get-graphql-response'

describe('graphql response', () => {
  const dummyOptions = {
    graphql: async () => {},
    buildSchema: schema => schema
  }

  it('requires a buildSchema function', () => {
    const options = { ...dummyOptions, buildSchema: undefined }
    expect(() => createGetGraphqlResponse(options)).toThrowError(
      'options.buildSchema is required'
    )
  })

  it('requires a graphql function', () => {
    const options = { ...dummyOptions, graphql: undefined }
    expect(() => createGetGraphqlResponse(options)).toThrowError(
      'options.graphql is required'
    )
  })

  it('only accepts http GET or http POST request', async () => {
    const getGraphqlResponse = createGetGraphqlResponse(dummyOptions)
    const expectedResult = {
      statusCode: 405,
      headers: [{ Accept: 'GET, POST' }],
      body: 'Method not allowed. See Accept header for allowed methods.'
    }
    const actualResult = await getGraphqlResponse({
      httpMethod: 'FOO',
      schema: 'some schema'
    })
    expect(actualResult).toEqual(expectedResult)
  })

  it('handles http GET requests', async () => {
    const options = { ...dummyOptions, graphql: async (...params) => params }
    const getGraphqlResponse = createGetGraphqlResponse(options)
    const queryStringParameters = {
      query: 'some query',
      operation: 'some operation',
      variables: JSON.stringify({ some: 'variable' })
    }
    const resolver = { some: 'resolver' }
    const schema = 'some schema'
    const httpResponse = await getGraphqlResponse({
      httpMethod: 'GET',
      queryStringParameters,
      resolver,
      schema,
      context: null
    })
    const expectedResult = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        schema,
        queryStringParameters.query,
        resolver,
        null,
        JSON.parse(queryStringParameters.variables),
        queryStringParameters.operation
      ])
    }

    expect(httpResponse).toEqual(expectedResult)
  })

  it('handles http POST requests with a JSON body', async () => {
    const options = { ...dummyOptions, graphql: async (...params) => params }
    const getGraphqlResponse = createGetGraphqlResponse(options)
    const requestBody = {
      query: 'some query',
      operation: 'some operation',
      variables: { some: 'variable' }
    }
    const resolver = { some: 'resolver' }
    const schema = 'some schema'
    const httpResponse = await getGraphqlResponse({
      httpMethod: 'POST',
      body: JSON.stringify(requestBody),
      context: null,
      schema,
      resolver
    })
    const expectedResult = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        schema,
        requestBody.query,
        resolver,
        null,
        requestBody.variables,
        requestBody.operation
      ])
    }

    expect(httpResponse).toEqual(expectedResult)
  })

  it('handles http POST requests with a graphql body', async () => {
    const options = { ...dummyOptions, graphql: async (...params) => params }
    const getGraphqlResponse = createGetGraphqlResponse(options)
    const queryStringParameters = {
      operation: 'some operation',
      variables: JSON.stringify({ some: 'variable' })
    }
    const requestBody = `
      type Query {
        hello: String
      }
    `
    const schema = 'some schema'
    const resolver = { some: 'resolver' }
    const httpResponse = await getGraphqlResponse({
      httpMethod: 'POST',
      body: requestBody,
      queryStringParameters,
      context: null,
      headers: {
        'Content-Type': 'application/graphql'
      },
      schema,
      resolver
    })
    const expectedResult = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        schema,
        requestBody,
        resolver,
        null,
        JSON.parse(queryStringParameters.variables),
        queryStringParameters.operation
      ])
    }

    expect(httpResponse).toEqual(expectedResult)
  })

  it('handles rejections from the graphql function', async () => {
    const options = {
      ...dummyOptions,
      graphql: async () => {
        throw Error('boom!')
      }
    }
    const getGraphqlResponse = createGetGraphqlResponse(options)
    const requestBody = {
      query: 'some query',
      operation: 'some operation',
      variables: JSON.stringify({ some: 'variable' })
    }
    const resolver = { some: 'resolver' }
    const schema = 'some schema'
    const httpResponse = await getGraphqlResponse({
      httpMethod: 'POST',
      body: JSON.stringify(requestBody),
      context: null,
      resolver,
      schema,
      logger: { error: () => {} }
    })
    expect(httpResponse).toEqual({
      body: 'Internal Server Error',
      statusCode: 500
    })
  })

  it('handles bad JSON in the body', async () => {
    const options = {
      ...dummyOptions,
      graphql: async () => {}
    }
    const getGraphqlResponse = createGetGraphqlResponse(options)

    const httpResponse = await getGraphqlResponse({
      httpMethod: 'POST',
      body: 'Not JSON',
      context: null,
      schema: 'some schema'
    })
    expect(httpResponse).toEqual({
      statusCode: 400,
      body: 'Bad Request. Body is not a valid JSON string. If you are trying to send graphql as the body, please set your "Content-Type" header to "application/graphql"'
    })
  })

  it('handles missing query', async () => {
    const options = {
      ...dummyOptions,
      graphql: async () => {}
    }
    const getGraphqlResponse = createGetGraphqlResponse(options)

    const httpResponse = await getGraphqlResponse({
      httpMethod: 'POST',
      body: JSON.stringify({ variables: 'foo' }),
      context: null,
      schema: 'some schema'
    })
    expect(httpResponse).toEqual({
      statusCode: 400,
      body: 'Bad Request. Request must contain a GaphQL Query'
    })
  })
})
