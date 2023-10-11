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
  return str->len;
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
compare_buffers (void *a, size_t a_len, void *b, size_t b_len) {
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
  return compare_buffers(a->data.u8, a->len, b->data.u8, b->len);
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
  err = js_create_int32(env, compare_buffers(a, a_len, b, b_len), &result);
  assert(err == 0);

  return result;
}

static js_value_t *
init (js_env_t *env, js_value_t *exports) {
  {
    js_ffi_type_info_t *return_info;
    js_ffi_create_type_info(js_ffi_void, &return_info);

    js_ffi_type_info_t *arg_info[2];
    js_ffi_create_type_info(js_ffi_receiver, &arg_info[0]);
    js_ffi_create_type_info(js_ffi_uint32, &arg_info[1]);

    js_ffi_function_info_t *function_info;
    js_ffi_create_function_info(return_info, arg_info, 2, &function_info);

    js_ffi_function_t *ffi;
    js_ffi_create_function(bare_buffer_set_zero_fill_enabled_fast, function_info, &ffi);

    js_value_t *val;
    js_create_function_with_ffi(env, "setZeroFillEnabled", -1, bare_buffer_set_zero_fill_enabled, NULL, ffi, &val);
    js_set_named_property(env, exports, "setZeroFillEnabled", val);
  }
  {
    js_ffi_type_info_t *return_info;
    js_ffi_create_type_info(js_ffi_int32, &return_info);

    js_ffi_type_info_t *arg_info[2];
    js_ffi_create_type_info(js_ffi_receiver, &arg_info[0]);
    js_ffi_create_type_info(js_ffi_string, &arg_info[1]);

    js_ffi_function_info_t *function_info;
    js_ffi_create_function_info(return_info, arg_info, 2, &function_info);

    js_ffi_function_t *ffi;
    js_ffi_create_function(bare_buffer_byte_length_utf8_fast, function_info, &ffi);

    js_value_t *val;
    js_create_function_with_ffi(env, "byteLengthUTF8", -1, bare_buffer_byte_length_utf8, NULL, ffi, &val);
    js_set_named_property(env, exports, "byteLengthUTF8", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "toStringUTF8", -1, bare_buffer_to_string_utf8, NULL, &val);
    js_set_named_property(env, exports, "toStringUTF8", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "writeUTF8", -1, bare_buffer_write_utf8, NULL, &val);
    js_set_named_property(env, exports, "writeUTF8", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "toStringUTF16LE", -1, bare_buffer_to_string_utf16le, NULL, &val);
    js_set_named_property(env, exports, "toStringUTF16LE", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "writeUTF16LE", -1, bare_buffer_write_utf16le, NULL, &val);
    js_set_named_property(env, exports, "writeUTF16LE", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "toStringBase64", -1, bare_buffer_to_string_base64, NULL, &val);
    js_set_named_property(env, exports, "toStringBase64", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "writeBase64", -1, bare_buffer_write_base64, NULL, &val);
    js_set_named_property(env, exports, "writeBase64", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "toStringHex", -1, bare_buffer_to_string_hex, NULL, &val);
    js_set_named_property(env, exports, "toStringHex", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "writeHex", -1, bare_buffer_write_hex, NULL, &val);
    js_set_named_property(env, exports, "writeHex", val);
  }
  {
    js_ffi_type_info_t *return_info;
    js_ffi_create_type_info(js_ffi_int32, &return_info);

    js_ffi_type_info_t *arg_info[3];
    js_ffi_create_type_info(js_ffi_receiver, &arg_info[0]);
    js_ffi_create_type_info(js_ffi_uint8array, &arg_info[1]);
    js_ffi_create_type_info(js_ffi_uint8array, &arg_info[2]);

    js_ffi_function_info_t *function_info;
    js_ffi_create_function_info(return_info, arg_info, 3, &function_info);

    js_ffi_function_t *ffi;
    js_ffi_create_function(bare_buffer_compare_fast, function_info, &ffi);

    js_value_t *val;
    js_create_function_with_ffi(env, "compare", -1, bare_buffer_compare, NULL, ffi, &val);
    js_set_named_property(env, exports, "compare", val);
  }

  return exports;
}

BARE_MODULE(bare_buffer, init)
