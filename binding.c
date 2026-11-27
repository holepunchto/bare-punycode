#include <assert.h>
#include <bare.h>
#include <js.h>
#include <punycode.h>
#include <stdlib.h>
#include <utf.h>

// A zero length allocation may return NULL, which would read as a failure.
static inline void *
bare_punycode__alloc(size_t len) {
  return malloc(len == 0 ? 1 : len);
}

static js_value_t *
bare_punycode_encode(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t str_len;
  err = js_get_value_string_utf16le(env, argv[0], NULL, 0, &str_len);
  if (err < 0) return NULL;

  utf16_t *str = bare_punycode__alloc(str_len * sizeof(utf16_t));
  utf32_t *code_points = NULL;
  utf8_t *encoded = NULL;

  js_value_t *result = NULL;

  if (str == NULL) goto out_of_memory;

  err = js_get_value_string_utf16le(env, argv[0], str, str_len, &str_len);
  assert(err == 0);

  size_t len = utf32_length_from_utf16le(str, str_len);

  code_points = bare_punycode__alloc(len * sizeof(utf32_t));
  if (code_points == NULL) goto out_of_memory;

  utf16le_convert_to_utf32(str, str_len, code_points);

  size_t encoded_len = punycode_max_length_from_utf32(len);
  if (encoded_len == (size_t) -1) goto overflow;

  encoded = bare_punycode__alloc(encoded_len);
  if (encoded == NULL) goto out_of_memory;

  err = punycode_encode_utf8(code_points, len, encoded, &encoded_len);
  if (err < 0) goto overflow;

  js_create_string_latin1(env, encoded, encoded_len, &result);

  goto done;

overflow:
  err = js_throw_range_error(env, NULL, "Overflow: input needs wider integers to process");
  assert(err == 0);

  goto done;

out_of_memory:
  err = js_throw_error(env, NULL, "Out of memory");
  assert(err == 0);

done:
  free(str);
  free(code_points);
  free(encoded);

  return result;
}

static js_value_t *
bare_punycode_decode(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t str_len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &str_len);
  if (err < 0) return NULL;

  utf8_t *str = bare_punycode__alloc(str_len);
  utf32_t *code_points = NULL;
  utf16_t *decoded = NULL;

  js_value_t *result = NULL;

  if (str == NULL) goto out_of_memory;

  err = js_get_value_string_utf8(env, argv[0], str, str_len, &str_len);
  assert(err == 0);

  size_t len = utf32_max_length_from_punycode(str_len);

  code_points = bare_punycode__alloc(len * sizeof(utf32_t));
  if (code_points == NULL) goto out_of_memory;

  err = punycode_decode_utf8(str, str_len, code_points, &len);
  if (err < 0) goto invalid;

  size_t decoded_len = utf16_length_from_utf32(code_points, len);

  decoded = bare_punycode__alloc(decoded_len * sizeof(utf16_t));
  if (decoded == NULL) goto out_of_memory;

  utf32_convert_to_utf16le(code_points, len, decoded);

  js_create_string_utf16le(env, decoded, decoded_len, &result);

  goto done;

invalid:
  err = js_throw_range_error(env, NULL, "Invalid input");
  assert(err == 0);

  goto done;

out_of_memory:
  err = js_throw_error(env, NULL, "Out of memory");
  assert(err == 0);

done:
  free(str);
  free(code_points);
  free(decoded);

  return result;
}

static js_value_t *
bare_punycode_exports(js_env_t *env, js_value_t *exports) {
  int err;

#define V(name, fn) \
  { \
    js_value_t *val; \
    err = js_create_function(env, name, -1, fn, NULL, &val); \
    assert(err == 0); \
    err = js_set_named_property(env, exports, name, val); \
    assert(err == 0); \
  }

  V("encode", bare_punycode_encode)
  V("decode", bare_punycode_decode)
#undef V

  return exports;
}

BARE_MODULE(bare_punycode, bare_punycode_exports)
