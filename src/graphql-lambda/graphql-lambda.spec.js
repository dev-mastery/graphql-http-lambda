import createGraphqlLambda from './graphql-lambda'

describe('graphql lambda', () => {
  it('requires a function that gets a graphql http response', () => {
    expect(() => createGraphqlLambda()).toThrowError(
      'options.getGraphqlResponse is required'
    )
  })

  it('returns a handler creation function', () => {
    const createHandler = createGraphqlLambda({
      getGraphqlResponse: jest.fn()
    })
    expect(typeof createHandler).toBe('function')
  })
})
