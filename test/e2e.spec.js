import createGraphqlHandler from '../src/graphql-lambda'
import schema from './schema.gql'
import resolver from './resolver'

describe('end to end test', () => {
  it('handles a valid GET request', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        query: `query ($name: String) { 
          hiWorld: hello,
          hiBob: hello(name: "Bob"),
          hiVariable: hello(name: $name)
        }`,
        variables: JSON.stringify({
          name: 'Bill'
        })
      },
      requestContext: {}
    }
    const context = {}
    const expectedResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          hiWorld: 'hello world',
          hiBob: 'hello Bob',
          hiVariable: 'hello Bill'
        }
      })
    }
    const callback = jest.fn()
    const handler = createGraphqlHandler({ schema, resolver })
    await handler(event, context, callback)
    expect(callback).toBeCalledWith(null, expectedResponse)
    expect.assertions(1)
  })
  it('handles a POST request with JSON body', async () => {
    const requestBody = {
      query: `query sayHi ($name: String) { 
        hiWorld: hello,
        hiBob: hello(name: "Bob"),
        hiVariable: hello(name: $name)
      }`,
      variables: {
        name: 'Bill'
      }
    }
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(requestBody),
      requestContext: {}
    }
    const context = {}
    const expectedResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          hiWorld: 'hello world',
          hiBob: 'hello Bob',
          hiVariable: 'hello Bill'
        }
      })
    }
    const callback = jest.fn()
    const handler = createGraphqlHandler({ schema, resolver })
    await handler(event, context, callback)
    expect(callback).toHaveBeenCalledWith(null, expectedResponse)
    expect.assertions(1)
  })
  it('handles a POST request with a graphql body', async () => {
    const body = `query ($name: String) { 
      hiWorld: hello,
      hiBob: hello(name: "Bob"),
      hiVariable: hello(name: $name)
    }`
    const event = {
      headers: {
        'Content-Type': 'application/graphql'
      },
      httpMethod: 'POST',
      queryStringParameters: {
        variables: JSON.stringify({
          name: 'Bill'
        })
      },
      body,
      requestContext: {}
    }
    const context = {}
    const expectedResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          hiWorld: 'hello world',
          hiBob: 'hello Bob',
          hiVariable: 'hello Bill'
        }
      })
    }
    const callback = jest.fn()
    const handler = createGraphqlHandler({ schema, resolver })
    await handler(event, context, callback)
    expect(callback).toHaveBeenCalledWith(null, expectedResponse)
    expect.assertions(1)
  })
})
