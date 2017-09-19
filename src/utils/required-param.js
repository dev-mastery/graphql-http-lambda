export default function requiredParam (paramName) {
  throw new Error(`${paramName} is required`)
}
