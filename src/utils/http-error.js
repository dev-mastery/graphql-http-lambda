export default class HttpError extends Error {
  constructor ({ body, headers, statusCode } = {}) {
    super(body)
    this.body = body
    this.headers = headers
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}
