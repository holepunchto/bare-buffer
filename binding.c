#include <assert.h>
#include <bare.h>
#include <base64.h>
#include <hex.h>
#include <js.h>
#include <js/ffi.h>
#include <stdlib.h>
#include <string.h>
#include <utf.h>

static void
bare_buffer_set_zero_fill_enabled_fast (js_ffi_receiver_t *receiver, uint32_t enabled) {
  js_set_arraybuffer_zero_fill_enabled(enabled != 0);
}

static js_value_t *
bare_buffer_set_zero_fill_enabled (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  uint32_t enabled;
  err = js_get_value_uint32(env, argv[0], &enabled);
  assert(err == 0);

  js_set_arraybuffer_zero_fill_enabled(enabled != 0);

  return NULL;
}

static uint32_t
bare_buffer_byte_length_utf8_fast (js_ffi_receiver_t *receiver, js_ffi_string_t *str) {
  const uint8_t *data = (const uint8_t *) str->data;

  uint32_t len = 0;

  for (uint32_t i = 0, n = str->len; i < n; i++) {
    // The string data is latin1 so we add an additional byte count for all
    // non-ASCII characters.
    len += 1 + (data[i] >> 7);
  }

  return len;
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

static int32_t
bare_buffer_compare_fast (js_ffi_receiver_t *recv, js_ffi_typedarray_t *a, js_ffi_typedarray_t *b) {
  return bare_buffer__compare(a->data.u8, a->len, b->data.u8, b->len);
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
bare_buffer_exports (js_env_t *env, js_value_t *exports) {
  int err;

#define V(name, fn, ffi) \
  { \
    js_value_t *val; \
    if (ffi) { \
      err = js_create_function_with_ffi(env, name, -1, fn, NULL, ffi, &val); \
    } else { \
      err = js_create_function(env, name, -1, fn, NULL, &val); \
    } \
    assert(err == 0); \
    err = js_set_named_property(env, exports, name, val); \
    assert(err == 0); \
  }

  {
    js_ffi_type_info_t *return_info;
    err = js_ffi_create_type_info(js_ffi_void, &return_info);
    assert(err == 0);

    js_ffi_type_info_t *arg_info[2];

    err = js_ffi_create_type_info(js_ffi_receiver, &arg_info[0]);
    assert(err == 0);

    err = js_ffi_create_type_info(js_ffi_uint32, &arg_info[1]);
    assert(err == 0);

    js_ffi_function_info_t *function_info;
    err = js_ffi_create_function_info(return_info, arg_info, 2, &function_info);
    assert(err == 0);

    js_ffi_function_t *ffi;
    err = js_ffi_create_function(bare_buffer_set_zero_fill_enabled_fast, function_info, &ffi);
    assert(err == 0);

    V("setZeroFillEnabled", bare_buffer_set_zero_fill_enabled, ffi);
  }

  {
    js_ffi_type_info_t *return_info;
    err = js_ffi_create_type_info(js_ffi_int32, &return_info);
    assert(err == 0);

    js_ffi_type_info_t *arg_info[2];

    err = js_ffi_create_type_info(js_ffi_receiver, &arg_info[0]);
    assert(err == 0);

    err = js_ffi_create_type_info(js_ffi_string, &arg_info[1]);
    assert(err == 0);

    js_ffi_function_info_t *function_info;
    err = js_ffi_create_function_info(return_info, arg_info, 2, &function_info);
    assert(err == 0);

    js_ffi_function_t *ffi;
    err = js_ffi_create_function(bare_buffer_byte_length_utf8_fast, function_info, &ffi);
    assert(err == 0);

    V("byteLengthUTF8", bare_buffer_byte_length_utf8, ffi);
  }

  V("toStringUTF8", bare_buffer_to_string_utf8, NULL);
  V("writeUTF8", bare_buffer_write_utf8, NULL);
  V("toStringUTF16LE", bare_buffer_to_string_utf16le, NULL);
  V("writeUTF16LE", bare_buffer_write_utf16le, NULL);
  V("toStringBase64", bare_buffer_to_string_base64, NULL);
  V("writeBase64", bare_buffer_write_base64, NULL);
  V("toStringHex", bare_buffer_to_string_hex, NULL);
  V("writeHex", bare_buffer_write_hex, NULL);

  {
    js_ffi_type_info_t *return_info;
    err = js_ffi_create_type_info(js_ffi_int32, &return_info);
    assert(err == 0);

    js_ffi_type_info_t *arg_info[3];

    err = js_ffi_create_type_info(js_ffi_receiver, &arg_info[0]);
    assert(err == 0);

    err = js_ffi_create_type_info(js_ffi_uint8array, &arg_info[1]);
    assert(err == 0);

    err = js_ffi_create_type_info(js_ffi_uint8array, &arg_info[2]);
    assert(err == 0);

    js_ffi_function_info_t *function_info;
    err = js_ffi_create_function_info(return_info, arg_info, 3, &function_info);
    assert(err == 0);

    js_ffi_function_t *ffi;
    err = js_ffi_create_function(bare_buffer_compare_fast, function_info, &ffi);
    assert(err == 0);

    V("compare", bare_buffer_compare, ffi);
  }
#undef V

  return exports;
}

BARE_MODULE(bare_buffer, bare_buffer_exports)
