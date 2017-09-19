import requiredParam from './required-param'

describe('required param', () => {
  it('throws an exception stating that the given param is required', () => {
    const paramName = 'foo'
    expect(() => requiredParam(paramName)).toThrowError(
      `${paramName} is required`
    )
  })
})
