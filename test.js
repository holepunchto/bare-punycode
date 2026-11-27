const test = require('brittle')
const punycode = require('.')

// https://www.rfc-editor.org/rfc/rfc3492#section-7.1
const samples = [
  ['ليهمابتكلموشعربي؟', 'egbpdaj6bu4bxfgehfvwxn'],
  ['他们为什么不说中文', 'ihqwcrb4cv8a8dqg056pqjye'],
  ['3年B組金八先生', '3B-ww4c5e180e575a65lsy2b'],
  ['Hello-Another-Way-それぞれの場所', 'Hello-Another-Way--fc4qua05auwb3674vfr0b'],
  ['-> $1.00 <-', '-> $1.00 <--']
]

test('encode and decode RFC 3492 samples', (t) => {
  for (const [decoded, encoded] of samples) {
    t.is(punycode.encode(decoded), encoded)
    t.is(punycode.decode(encoded), decoded)
  }
})

test('encode and decode code points outside the BMP', (t) => {
  t.is(punycode.encode('\u{1F4A9}'), 'ls8h')
  t.is(punycode.decode('ls8h'), '\u{1F4A9}')
})

test('encode and decode empty string', (t) => {
  t.is(punycode.encode(''), '')
  t.is(punycode.decode(''), '')
})

test('decode is case insensitive', (t) => {
  t.is(punycode.decode('MAANA-PTA'), 'MAñANA')
})

test('decode invalid input', (t) => {
  t.exception.all(() => punycode.decode('ü'), RangeError)
  t.exception.all(() => punycode.decode('99999999999999'), RangeError)
  t.exception.all(() => punycode.decode('a-!'), RangeError)
})

test('encode and decode non-string input', (t) => {
  t.exception.all(() => punycode.encode(1), TypeError)
  t.exception.all(() => punycode.decode(1), TypeError)
  t.exception.all(() => punycode.toASCII(1), TypeError)
  t.exception.all(() => punycode.toUnicode(1), TypeError)
})

test('toASCII', (t) => {
  t.is(punycode.toASCII('example.com'), 'example.com')
  t.is(punycode.toASCII('mañana.com'), 'xn--maana-pta.com')
  t.is(punycode.toASCII('\u{1F4A9}.la'), 'xn--ls8h.la')
  t.is(punycode.toASCII('ñ。ñ．ñ｡ñ'), 'xn--ida.xn--ida.xn--ida.xn--ida')
  t.is(punycode.toASCII('jürgen@mañana.com'), 'jürgen@xn--maana-pta.com')
})

test('toUnicode', (t) => {
  t.is(punycode.toUnicode('example.com'), 'example.com')
  t.is(punycode.toUnicode('xn--maana-pta.com'), 'mañana.com')
  t.is(punycode.toUnicode('XN--MAANA-PTA.com'), 'mañana.com')
  t.is(punycode.toUnicode('xn--ls8h.la'), '\u{1F4A9}.la')
  t.is(punycode.toUnicode('mañana.com'), 'mañana.com')
  t.is(punycode.toUnicode('xn--maana-pta@xn--maana-pta.com'), 'xn--maana-pta@mañana.com')
})
