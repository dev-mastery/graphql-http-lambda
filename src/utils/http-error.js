export default class HttpError extends Error {
  constructor ({ statusCode, message, headers } = {}) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.headers = headers
  }
}
