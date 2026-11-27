# bare-punycode

Punycode support for Bare, built on <https://github.com/holepunchto/libpunycode>.

```
npm i bare-punycode
```

## Usage

```js
const punycode = require('bare-punycode')

punycode.toASCII('mañana.com')
// 'xn--maana-pta.com'

punycode.toUnicode('xn--maana-pta.com')
// 'mañana.com'
```

## API

#### `const encoded = punycode.encode(string)`

Encode a string of Unicode code points as Punycode, as specified by [RFC 3492](https://www.rfc-editor.org/rfc/rfc3492). The `xn--` prefix is not added.

#### `const decoded = punycode.decode(string)`

Decode a Punycode string to a string of Unicode code points. The input must not include the `xn--` prefix. Throws a `RangeError` if the input is not valid Punycode.

#### `const ascii = punycode.toASCII(domain)`

Convert a domain name or email address to its ASCII form. Each label of the domain that contains non-ASCII characters is encoded and given the `xn--` prefix. Labels may be separated by any of the separators listed in [RFC 3490](https://www.rfc-editor.org/rfc/rfc3490#section-3.1), and are joined by `.` in the result. For an email address, only the part after the first `@` is converted.

#### `const unicode = punycode.toUnicode(domain)`

Convert a domain name or email address to its Unicode form. Each label of the domain that starts with `xn--`, in any case, is decoded. For an email address, only the part after the first `@` is converted.

## License

Apache-2.0
