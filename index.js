const binding = require('./binding')

// https://www.rfc-editor.org/rfc/rfc3490#section-3.1
const separators = /[\x2E。．｡]/g

const nonASCII = /[^\0-\x7F]/

const acePrefix = /^xn--/i

exports.encode = function encode(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string. Received type ' + typeof input)
  }

  return binding.encode(input)
}

exports.decode = function decode(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string. Received type ' + typeof input)
  }

  return binding.decode(input)
}

exports.toASCII = function toASCII(input) {
  return mapDomain(input, (label) =>
    nonASCII.test(label) ? 'xn--' + exports.encode(label) : label
  )
}

exports.toUnicode = function toUnicode(input) {
  return mapDomain(input, (label) =>
    acePrefix.test(label) ? exports.decode(label.slice(4).toLowerCase()) : label
  )
}

// Only the part after the first "@" of an email address is a domain, so the
// local part before it is passed through as is.
function mapDomain(input, fn) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string. Received type ' + typeof input)
  }

  const at = input.indexOf('@')

  const local = input.slice(0, at + 1)
  const domain = input.slice(at + 1).replace(separators, '.')

  return local + domain.split('.').map(fn).join('.')
}
