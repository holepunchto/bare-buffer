#include <js.h>
#include <js/ffi.h>
#include <pear.h>

static void
pear_buffer_set_zero_fill_enabled_fast (js_ffi_receiver_t *receiver, uint32_t enabled) {
  js_set_arraybuffer_zero_fill_enabled(enabled);
}

static js_value_t *
pear_buffer_set_zero_fill_enabled (js_env_t *env, js_callback_info_t *info) {
  js_value_t *argv[1];
  size_t argc = 1;

  js_get_callback_info(env, info, &argc, argv, NULL, NULL);

  uint32_t enabled;
  js_get_value_uint32(env, argv[0], &enabled);

  js_set_arraybuffer_zero_fill_enabled(enabled);

  return NULL;
}

static uint32_t
pear_buffer_byte_length_fast (js_ffi_receiver_t *receiver, js_ffi_string_t *str) {
  int n = str->len;
  uint32_t bytes = 0;

  for (int i = 0; i < n; i++) {
    uint8_t code = str->data[i];
    bytes += code <= 0x7f ? 1 : 2;
  }

  return bytes;
}

static js_value_t *
pear_buffer_byte_length (js_env_t *env, js_callback_info_t *info) {
  js_value_t *argv[1];
  size_t argc = 1;

  js_get_callback_info(env, info, &argc, argv, NULL, NULL);

  size_t str_len;
  js_get_value_string_utf8(env, argv[0], NULL, -1, &str_len);

  js_value_t *result;
  js_create_uint32(env, (uint32_t) str_len, &result);

  return result;
}

static js_value_t *
pear_buffer_write (js_env_t *env, js_callback_info_t *info) {
  js_value_t *argv[2];
  size_t argc = 2;

  js_get_callback_info(env, info, &argc, argv, NULL, NULL);

  size_t buf_len;
  char *buf;

  js_get_typedarray_info(env, argv[0], NULL, (void **) &buf, &buf_len, NULL, NULL);

  size_t str_len;
  js_get_value_string_utf8(env, argv[1], buf, buf_len, &str_len);

  js_value_t *result;
  js_create_uint32(env, (uint32_t) str_len, &result);

  return result;
}

static inline int
compare_buffers (size_t a_len, char *a, size_t b_len, char *b) {
  int r = memcmp(a, b, a_len < b_len ? a_len : b_len);

  if (r == 0) {
    if (a_len < b_len) return -1;
    if (a_len > b_len) return 1;
    return 0;
  }

  if (r < 0) {
    return -1;
  }

  return 1;
}

static int32_t
pear_buffer_compare_fast (js_ffi_receiver_t *recv, js_ffi_typedarray_t *a, js_ffi_typedarray_t *b) {
  return compare_buffers(a->len, (char *) a->data.u8, b->len, (char *) b->data.u8);
}

static js_value_t *
pear_buffer_compare (js_env_t *env, js_callback_info_t *info) {
  js_value_t *argv[2];
  size_t argc = 2;

  js_get_callback_info(env, info, &argc, argv, NULL, NULL);

  size_t a_len;
  char *a;

  size_t b_len;
  char *b;

  js_get_typedarray_info(env, argv[0], NULL, (void **) &a, &a_len, NULL, NULL);
  js_get_typedarray_info(env, argv[1], NULL, (void **) &b, &b_len, NULL, NULL);

  js_value_t *result;
  js_create_int32(env, compare_buffers(a_len, a, b_len, b), &result);

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
    js_ffi_create_function(pear_buffer_set_zero_fill_enabled_fast, function_info, &ffi);

    js_value_t *val;
    js_create_function(env, "setZeroFillEnabled", -1, pear_buffer_set_zero_fill_enabled, ffi, &val);
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
    js_ffi_create_function(pear_buffer_byte_length_fast, function_info, &ffi);

    js_value_t *val;
    js_create_function_with_ffi(env, "byteLength", -1, pear_buffer_byte_length, NULL, ffi, &val);
    js_set_named_property(env, exports, "byteLength", val);
  }

  {
    js_value_t *val;
    js_create_function(env, "write", -1, pear_buffer_write, NULL, &val);
    js_set_named_property(env, exports, "write", val);
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
    js_ffi_create_function(pear_buffer_compare_fast, function_info, &ffi);

    js_value_t *val;
    js_create_function_with_ffi(env, "compare", -1, pear_buffer_compare, NULL, ffi, &val);
    js_set_named_property(env, exports, "compare", val);
  }

  return exports;
}

PEAR_MODULE(init)
