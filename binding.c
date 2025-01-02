#include <assert.h>
#include <bare.h>
#include <base64.h>
#include <hex.h>
#include <js.h>
#include <js/ffi.h>
#include <stdlib.h>
#include <string.h>
#include <utf.h>

static js_type_tag_t bare_buffer__tag = {0xfea3e944b70b0812, 0xe53bb5c343c040b6};

static js_value_t *
bare_buffer_alloc (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  uint32_t len;
  err = js_get_value_uint32(env, argv[0], &len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_arraybuffer(env, len, NULL, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_alloc_unsafe (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  uint32_t len;
  err = js_get_value_uint32(env, argv[0], &len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_unsafe_arraybuffer(env, len, NULL, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_byte_length_utf8 (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t str_len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_uint32(env, (uint32_t) str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_utf8 (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t str_len;
  utf8_t *str;
  err = js_get_typedarray_info(env, argv[0], NULL, (void **) &str, &str_len, NULL, NULL);
  assert(err == 0);

  js_value_t *result;
  err = js_create_string_utf8(env, str, str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_write_utf8 (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  size_t buf_len;
  void *buf;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_utf8(env, argv[1], buf, buf_len, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_uint32(env, (uint32_t) str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_utf16le (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t str_len;
  utf16_t *str;
  err = js_get_typedarray_info(env, argv[0], NULL, (void **) &str, &str_len, NULL, NULL);
  assert(err == 0);

  str_len /= sizeof(utf16_t);

  js_value_t *result;
  err = js_create_string_utf16le(env, str, str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_write_utf16le (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  size_t buf_len;
  void *buf;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  buf_len /= sizeof(utf16_t);

  size_t str_len;
  err = js_get_value_string_utf16le(env, argv[1], buf, buf_len, &str_len);
  assert(err == 0);

  str_len *= sizeof(utf16_t);

  js_value_t *result;
  err = js_create_uint32(env, (uint32_t) str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_base64 (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t buf_len;
  void *buf;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  size_t str_len;
  err = base64_encode(buf, buf_len, NULL, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = base64_encode(buf, buf_len, str, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_string_utf8(env, str, str_len, &result);
  assert(err == 0);

  free(str);

  return result;
}

static js_value_t *
bare_buffer_write_base64 (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  size_t buf_len;
  void *buf;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_utf8(env, argv[1], NULL, 0, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = js_get_value_string_utf8(env, argv[1], str, str_len, NULL);
  assert(err == 0);

  err = base64_decode(str, str_len, buf, &buf_len);
  assert(err == 0);

  free(str);

  js_value_t *result;
  err = js_create_uint32(env, (uint32_t) buf_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_hex (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t buf_len;
  void *buf;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  size_t str_len;
  err = hex_encode(buf, buf_len, NULL, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = hex_encode(buf, buf_len, str, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_string_utf8(env, str, str_len, &result);
  assert(err == 0);

  free(str);

  return result;
}

static js_value_t *
bare_buffer_write_hex (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  size_t buf_len;
  void *buf;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_utf8(env, argv[1], NULL, 0, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = js_get_value_string_utf8(env, argv[1], str, str_len, NULL);
  assert(err == 0);

  err = hex_decode(str, str_len, buf, &buf_len);
  assert(err == 0);

  free(str);

  js_value_t *result;
  err = js_create_uint32(env, (uint32_t) buf_len, &result);
  assert(err == 0);

  return result;
}

static inline int
bare_buffer__compare (void *a, size_t a_len, void *b, size_t b_len) {
  int r = memcmp(a, b, a_len < b_len ? a_len : b_len);

  if (r == 0) {
    if (a_len < b_len) return -1;
    if (a_len > b_len) return 1;
    return 0;
  }

  return r < 0 ? -1 : 1;
}

static js_value_t *
bare_buffer_compare (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  size_t a_len;
  void *a;
  err = js_get_typedarray_info(env, argv[0], NULL, &a, &a_len, NULL, NULL);
  assert(err == 0);

  size_t b_len;
  void *b;
  err = js_get_typedarray_info(env, argv[1], NULL, &b, &b_len, NULL, NULL);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int32(env, bare_buffer__compare(a, a_len, b, b_len), &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_tag (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  err = js_add_type_tag(env, argv[0], &bare_buffer__tag);
  assert(err == 0);

  return NULL;
}

static js_value_t *
bare_buffer_is_tagged (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  bool is_buffer;
  err = js_check_type_tag(env, argv[0], &bare_buffer__tag, &is_buffer);
  assert(err == 0);

  js_value_t *result;
  err = js_get_boolean(env, is_buffer, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_exports (js_env_t *env, js_value_t *exports) {
  int err;

#define V(name, fn) \
  { \
    js_value_t *val; \
    err = js_create_function(env, name, -1, fn, NULL, &val); \
    assert(err == 0); \
    err = js_set_named_property(env, exports, name, val); \
    assert(err == 0); \
  }

  V("alloc", bare_buffer_alloc);
  V("allocUnsafe", bare_buffer_alloc_unsafe);

  V("byteLengthUTF8", bare_buffer_byte_length_utf8);
  V("toStringUTF8", bare_buffer_to_string_utf8);
  V("writeUTF8", bare_buffer_write_utf8);

  V("toStringUTF16LE", bare_buffer_to_string_utf16le);
  V("writeUTF16LE", bare_buffer_write_utf16le);

  V("toStringBase64", bare_buffer_to_string_base64);
  V("writeBase64", bare_buffer_write_base64);

  V("toStringHex", bare_buffer_to_string_hex);
  V("writeHex", bare_buffer_write_hex);

  V("compare", bare_buffer_compare);
  V("tag", bare_buffer_tag);
  V("isTagged", bare_buffer_is_tagged);
#undef V

  return exports;
}

BARE_MODULE(bare_buffer, bare_buffer_exports)
