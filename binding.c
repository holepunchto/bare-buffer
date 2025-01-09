#include <assert.h>
#include <bare.h>
#include <base64.h>
#include <hex.h>
#include <js.h>
#include <stdlib.h>
#include <string.h>
#include <utf.h>

static js_type_tag_t bare_buffer__tag = {0xfea3e944b70b0812, 0xe53bb5c343c040b6};

static inline int
bare_buffer__memcmp (void *a, size_t a_len, void *b, size_t b_len) {
  int r = memcmp(a, b, a_len < b_len ? a_len : b_len);

  if (r == 0) {
    if (a_len < b_len) return -1;
    if (a_len > b_len) return 1;
    return 0;
  }

  return r < 0 ? -1 : 1;
}

static void
bare_buffer__on_free_string (js_env_t *env, void *data, void *finalize_hint) {
  free(data);
}

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

static uint32_t
bare_buffer_typed_byte_length_utf8 (js_value_t *receiver, js_value_t *str, js_typed_callback_info_t *info) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_utf8(env, str, NULL, 0, &str_len);
  assert(err == 0);

  return (uint32_t) str_len;
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

  utf8_t *buf;
  size_t buf_len;
  err = js_get_typedarray_info(env, argv[0], NULL, (void **) &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  js_value_t *result;
  err = js_create_string_utf8(env, buf, buf_len, &result);
  assert(err == 0);

  return result;
}

static uint32_t
bare_buffer_typed_write_utf8 (js_value_t *receiver, js_value_t *typedarray, js_value_t *string, js_typed_callback_info_t *info) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  void *buf;
  size_t buf_len;

  js_typedarray_view_t *buf_view;
  err = js_get_typedarray_view(env, typedarray, NULL, &buf, &buf_len, &buf_view);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_utf8(env, string, buf, buf_len, &str_len);
  assert(err == 0);

  err = js_release_typedarray_view(env, buf_view);
  assert(err == 0);

  return (uint32_t) str_len;
}

static js_value_t *
bare_buffer_write_utf8 (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  void *buf;
  size_t buf_len;
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

  utf16_t *buf;
  size_t buf_len;
  err = js_get_typedarray_info(env, argv[0], NULL, (void **) &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  buf_len /= sizeof(utf16_t);

  js_value_t *result;
  err = js_create_string_utf16le(env, buf, buf_len, &result);
  assert(err == 0);

  return result;
}

static uint32_t
bare_buffer_typed_write_utf16le (js_value_t *receiver, js_value_t *typedarray, js_value_t *string, js_typed_callback_info_t *info) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  void *buf;
  size_t buf_len;

  js_typedarray_view_t *buf_view;
  err = js_get_typedarray_view(env, typedarray, NULL, &buf, &buf_len, &buf_view);
  assert(err == 0);

  buf_len /= sizeof(utf16_t);

  size_t str_len;
  err = js_get_value_string_utf16le(env, string, buf, buf_len, &str_len);
  assert(err == 0);

  str_len *= sizeof(utf16_t);

  err = js_release_typedarray_view(env, buf_view);
  assert(err == 0);

  return (uint32_t) str_len;
}

static js_value_t *
bare_buffer_write_utf16le (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  void *buf;
  size_t buf_len;
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

  void *buf;
  size_t buf_len;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  size_t str_len;
  err = base64_encode_utf8(buf, buf_len, NULL, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = base64_encode_utf8(buf, buf_len, str, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_external_string_latin1(env, str, str_len, bare_buffer__on_free_string, NULL, &result, NULL);
  assert(err == 0);

  return result;
}

static uint32_t
bare_buffer_typed_write_base64 (js_value_t *receiver, js_value_t *typedarray, js_value_t *string, js_typed_callback_info_t *info) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  void *buf;
  size_t buf_len;

  js_typedarray_view_t *buf_view;
  err = js_get_typedarray_view(env, typedarray, NULL, &buf, &buf_len, &buf_view);
  assert(err == 0);

  js_string_encoding_t encoding;
  const void *str;
  size_t str_len;

  js_string_view_t *str_view;
  err = js_get_string_view(env, string, &encoding, &str, &str_len, &str_view);
  assert(err == 0);

  if (encoding == js_utf16le) {
    err = base64_decode_utf16le(str, str_len, buf, &buf_len);
    assert(err == 0);
  } else {
    err = base64_decode_utf8(str, str_len, buf, &buf_len);
    assert(err == 0);
  }

  err = js_release_string_view(env, str_view);
  assert(err == 0);

  err = js_release_typedarray_view(env, buf_view);
  assert(err == 0);

  return buf_len;
}

static js_value_t *
bare_buffer_write_base64 (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  void *buf;
  size_t buf_len;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  js_string_encoding_t encoding;
  const void *str;
  size_t str_len;

  js_string_view_t *str_view;
  err = js_get_string_view(env, argv[1], &encoding, &str, &str_len, &str_view);
  assert(err == 0);

  if (encoding == js_utf16le) {
    err = base64_decode_utf16le(str, str_len, buf, &buf_len);
    assert(err == 0);
  } else {
    err = base64_decode_utf8(str, str_len, buf, &buf_len);
    assert(err == 0);
  }

  err = js_release_string_view(env, str_view);
  assert(err == 0);

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

  void *buf;
  size_t buf_len;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  size_t str_len;
  err = hex_encode_utf8(buf, buf_len, NULL, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = hex_encode_utf8(buf, buf_len, str, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_external_string_latin1(env, str, str_len, bare_buffer__on_free_string, NULL, &result, NULL);
  assert(err == 0);

  return result;
}

static uint32_t
bare_buffer_typed_write_hex (js_value_t *receiver, js_value_t *typedarray, js_value_t *string, js_typed_callback_info_t *info) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  void *buf;
  size_t buf_len;

  js_typedarray_view_t *buf_view;
  err = js_get_typedarray_view(env, typedarray, NULL, &buf, &buf_len, &buf_view);
  assert(err == 0);

  js_string_encoding_t encoding;
  const void *str;
  size_t str_len;

  js_string_view_t *str_view;
  err = js_get_string_view(env, string, &encoding, &str, &str_len, &str_view);
  assert(err == 0);

  if (encoding == js_utf16le) {
    err = hex_decode_utf16le(str, str_len, buf, &buf_len);
    assert(err == 0);
  } else {
    err = hex_decode_utf8(str, str_len, buf, &buf_len);
    assert(err == 0);
  }

  err = js_release_string_view(env, str_view);
  assert(err == 0);

  err = js_release_typedarray_view(env, buf_view);
  assert(err == 0);

  return buf_len;
}

static js_value_t *
bare_buffer_write_hex (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  void *buf;
  size_t buf_len;
  err = js_get_typedarray_info(env, argv[0], NULL, &buf, &buf_len, NULL, NULL);
  assert(err == 0);

  js_string_encoding_t encoding;
  const void *str;
  size_t str_len;

  js_string_view_t *str_view;
  err = js_get_string_view(env, argv[1], &encoding, &str, &str_len, &str_view);
  assert(err == 0);

  if (encoding == js_utf16le) {
    err = hex_decode_utf16le(str, str_len, buf, &buf_len);
    assert(err == 0);
  } else {
    err = hex_decode_utf8(str, str_len, buf, &buf_len);
    assert(err == 0);
  }

  err = js_release_string_view(env, str_view);
  assert(err == 0);

  js_value_t *result;
  err = js_create_uint32(env, (uint32_t) buf_len, &result);
  assert(err == 0);

  return result;
}

static int32_t
bare_buffer_typed_compare (js_value_t *receiver, js_value_t *source, js_value_t *target, js_typed_callback_info_t *info) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  void *a;
  size_t a_len;
  err = js_get_typedarray_info(env, source, NULL, &a, &a_len, NULL, NULL);
  assert(err == 0);

  void *b;
  size_t b_len;
  err = js_get_typedarray_info(env, target, NULL, &b, &b_len, NULL, NULL);
  assert(err == 0);

  return bare_buffer__memcmp(a, a_len, b, b_len);
}

static js_value_t *
bare_buffer_compare (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  void *a;
  size_t a_len;
  err = js_get_typedarray_info(env, argv[0], NULL, &a, &a_len, NULL, NULL);
  assert(err == 0);

  void *b;
  size_t b_len;
  err = js_get_typedarray_info(env, argv[1], NULL, &b, &b_len, NULL, NULL);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int32(env, bare_buffer__memcmp(a, a_len, b, b_len), &result);
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

  bool is_tagged;
  err = js_check_type_tag(env, argv[0], &bare_buffer__tag, &is_tagged);
  assert(err == 0);

  js_value_t *result;
  err = js_get_boolean(env, is_tagged, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_exports (js_env_t *env, js_value_t *exports) {
  int err;

#define V(name, untyped, signature, typed) \
  { \
    js_value_t *val; \
    if (signature) { \
      err = js_create_typed_function(env, name, -1, untyped, signature, typed, NULL, &val); \
      assert(err == 0); \
    } else { \
      err = js_create_function(env, name, -1, untyped, NULL, &val); \
      assert(err == 0); \
    } \
    err = js_set_named_property(env, exports, name, val); \
    assert(err == 0); \
  }

  V("alloc", bare_buffer_alloc, NULL, NULL);

  V("allocUnsafe", bare_buffer_alloc_unsafe, NULL, NULL);

  V(
    "byteLengthUTF8",
    bare_buffer_byte_length_utf8,
    &((js_callback_signature_t) {
      .version = 0,
      .result = js_uint32,
      .args_len = 2,
      .args = (int[]) {
        js_object,
        js_string,
      }
    }),
    bare_buffer_typed_byte_length_utf8
  );

  V("toStringUTF8", bare_buffer_to_string_utf8, NULL, NULL);

  V(
    "writeUTF8",
    bare_buffer_write_utf8,
    &((js_callback_signature_t) {
      .version = 0,
      .result = js_uint32,
      .args_len = 3,
      .args = (int[]) {
        js_object,
        js_object,
        js_string,
      }
    }),
    bare_buffer_typed_write_utf8
  );

  V("toStringUTF16LE", bare_buffer_to_string_utf16le, NULL, NULL);

  V(
    "writeUTF16LE",
    bare_buffer_write_utf16le,
    &((js_callback_signature_t) {
      .version = 0,
      .result = js_uint32,
      .args_len = 3,
      .args = (int[]) {
        js_object,
        js_object,
        js_string,
      }
    }),
    bare_buffer_typed_write_utf16le
  );

  V("toStringBase64", bare_buffer_to_string_base64, NULL, NULL);

  V(
    "writeBase64",
    bare_buffer_write_base64,
    &((js_callback_signature_t) {
      .version = 0,
      .result = js_uint32,
      .args_len = 3,
      .args = (int[]) {
        js_object,
        js_object,
        js_string,
      }
    }),
    bare_buffer_typed_write_base64
  );

  V("toStringHex", bare_buffer_to_string_hex, NULL, NULL);

  V(
    "writeHex",
    bare_buffer_write_hex,
    &((js_callback_signature_t) {
      .version = 0,
      .result = js_uint32,
      .args_len = 3,
      .args = (int[]) {
        js_object,
        js_object,
        js_string,
      }
    }),
    bare_buffer_typed_write_hex
  );

  V(
    "compare",
    bare_buffer_compare,
    &((js_callback_signature_t) {
      .version = 0,
      .result = js_int32,
      .args_len = 3,
      .args = (int[]) {
        js_object,
        js_object,
        js_object,
      }
    }),
    bare_buffer_typed_compare
  );

  V("tag", bare_buffer_tag, NULL, NULL);

  V("isTagged", bare_buffer_is_tagged, NULL, NULL);
#undef V

  return exports;
}

BARE_MODULE(bare_buffer, bare_buffer_exports)
