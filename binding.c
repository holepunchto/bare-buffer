#include <assert.h>
#include <bare.h>
#include <base64.h>
#include <hex.h>
#include <js.h>
#include <stdlib.h>
#include <string.h>
#include <utf.h>

static void
bare_buffer__on_finalize_string(js_env_t *env, void *data, void *finalize_hint) {
  free(data);
}

static inline int
bare_buffer__get_info(js_env_t *env, js_value_t *buffer, void **data, size_t *len) {
  int err;

  bool is_shared;
  err = js_is_sharedarraybuffer(env, buffer, &is_shared);
  if (err < 0) return err;

  if (is_shared) {
    err = js_get_sharedarraybuffer_info(env, buffer, data, len);
  } else {
    err = js_get_arraybuffer_info(env, buffer, data, len);
  }

  return err;
}

static js_value_t *
bare_buffer_alloc(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  int64_t len;
  err = js_get_value_int64(env, argv[0], &len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_arraybuffer(env, len, NULL, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_alloc_unsafe(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  int64_t len;
  err = js_get_value_int64(env, argv[0], &len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_unsafe_arraybuffer(env, len, NULL, &result);
  assert(err == 0);

  return result;
}

static int64_t
bare_buffer_typed_byte_length_utf8(js_value_t *receiver, js_value_t *str, js_typed_callback_info_t *info) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_utf8(env, str, NULL, 0, &str_len);
  assert(err == 0);

  return str_len;
}

static js_value_t *
bare_buffer_byte_length_utf8(js_env_t *env, js_callback_info_t *info) {
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
  err = js_create_int64(env, str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_utf8(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  utf8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_string_utf8(env, &buf[offset], len, &result);
  assert(err == 0);

  return result;
}

static int64_t
bare_buffer_typed_write_utf8(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_value_t *string,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  utf8_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_utf8(env, string, &buf[offset], len, &str_len);
  assert(err == 0);

  return str_len;
}

static js_value_t *
bare_buffer_write_utf8(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  utf8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_utf8(env, argv[3], &buf[offset], len, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int64(env, str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_utf16le(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  utf16_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  offset /= sizeof(utf16_t);
  len /= sizeof(utf16_t);

  js_value_t *result;
  err = js_create_string_utf16le(env, &buf[offset], len, &result);
  assert(err == 0);

  return result;
}

static int64_t
bare_buffer_typed_write_utf16le(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_value_t *string,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  utf16_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  offset /= sizeof(utf16_t);
  len /= sizeof(utf16_t);

  size_t str_len;
  err = js_get_value_string_utf16le(env, string, &buf[offset], len, &str_len);
  assert(err == 0);

  str_len *= sizeof(utf16_t);

  return str_len;
}

static js_value_t *
bare_buffer_write_utf16le(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  utf16_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  offset /= sizeof(utf16_t);
  len /= sizeof(utf16_t);

  size_t str_len;
  err = js_get_value_string_utf16le(env, argv[3], &buf[offset], len, &str_len);
  assert(err == 0);

  str_len *= sizeof(utf16_t);

  js_value_t *result;
  err = js_create_int64(env, str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_latin1(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  latin1_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_string_latin1(env, &buf[offset], len, &result);
  assert(err == 0);

  return result;
}

static int64_t
bare_buffer_typed_write_latin1(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_value_t *string,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  latin1_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_latin1(env, string, &buf[offset], len, &str_len);
  assert(err == 0);

  return str_len;
}

static js_value_t *
bare_buffer_write_latin1(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  latin1_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  size_t str_len;
  err = js_get_value_string_latin1(env, argv[3], &buf[offset], len, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int64(env, str_len, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_base64(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  utf8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  size_t str_len;
  err = base64_encode_utf8(&buf[offset], len, NULL, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = base64_encode_utf8(&buf[offset], len, str, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_external_string_latin1(env, str, str_len, bare_buffer__on_finalize_string, NULL, &result, NULL);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_base64url(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  utf8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  size_t str_len;
  err = base64url_encode_utf8(&buf[offset], len, NULL, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = base64url_encode_utf8(&buf[offset], len, str, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_external_string_latin1(env, str, str_len, bare_buffer__on_finalize_string, NULL, &result, NULL);
  assert(err == 0);

  return result;
}

static int64_t
bare_buffer_typed_write_base64(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_value_t *string,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  utf8_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  js_string_encoding_t encoding;
  const void *str;
  size_t str_len;

  js_string_view_t *str_view;
  err = js_get_string_view(env, string, &encoding, &str, &str_len, &str_view);
  assert(err == 0);

  size_t written = len;

  if (encoding == js_utf16le) {
    err = base64_decode_utf16le(str, str_len, &buf[offset], &written);
  } else {
    err = base64_decode_utf8(str, str_len, &buf[offset], &written);
  }

  if (err != 0) {
    err = js_throw_error(env, NULL, "Invalid input");
    assert(err == 0);

    err = js_release_string_view(env, str_view);
    assert(err == 0);

    return 0;
  }

  err = js_release_string_view(env, str_view);
  assert(err == 0);

  return written;
}

static js_value_t *
bare_buffer_write_base64(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  utf8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  js_string_encoding_t encoding;
  const void *str;
  size_t str_len;

  js_string_view_t *str_view;
  err = js_get_string_view(env, argv[3], &encoding, &str, &str_len, &str_view);
  assert(err == 0);

  size_t written = len;

  if (encoding == js_utf16le) {
    err = base64_decode_utf16le(str, str_len, &buf[offset], &written);
  } else {
    err = base64_decode_utf8(str, str_len, &buf[offset], &written);
  }

  if (err != 0) {
    err = js_throw_error(env, NULL, "Invalid input");
    assert(err == 0);

    err = js_release_string_view(env, str_view);
    assert(err == 0);

    return NULL;
  }

  err = js_release_string_view(env, str_view);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int64(env, written, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_to_string_hex(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  utf8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  size_t str_len;
  err = hex_encode_utf8(&buf[offset], len, NULL, &str_len);
  assert(err == 0);

  utf8_t *str = malloc(str_len);
  err = hex_encode_utf8(&buf[offset], len, str, &str_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_external_string_latin1(env, str, str_len, bare_buffer__on_finalize_string, NULL, &result, NULL);
  assert(err == 0);

  return result;
}

static int64_t
bare_buffer_typed_write_hex(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_value_t *string,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  utf8_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  js_string_encoding_t encoding;
  const void *str;
  size_t str_len;

  js_string_view_t *str_view;
  err = js_get_string_view(env, string, &encoding, &str, &str_len, &str_view);
  assert(err == 0);

  size_t written = len;

  if (encoding == js_utf16le) {
    err = hex_decode_utf16le(str, str_len, &buf[offset], &written);
  } else {
    err = hex_decode_utf8(str, str_len, &buf[offset], &written);
  }

  if (err != 0) {
    err = js_throw_error(env, NULL, "Invalid input");
    assert(err == 0);

    err = js_release_string_view(env, str_view);
    assert(err == 0);

    return 0;
  }

  err = js_release_string_view(env, str_view);
  assert(err == 0);

  return written;
}

static js_value_t *
bare_buffer_write_hex(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 4;
  js_value_t *argv[4];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 4);

  utf8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  js_string_encoding_t encoding;
  const void *str;
  size_t str_len;

  js_string_view_t *str_view;
  err = js_get_string_view(env, argv[3], &encoding, &str, &str_len, &str_view);
  assert(err == 0);

  size_t written = len;

  if (encoding == js_utf16le) {
    err = hex_decode_utf16le(str, str_len, &buf[offset], &written);
  } else {
    err = hex_decode_utf8(str, str_len, &buf[offset], &written);
  }

  if (err != 0) {
    err = js_throw_error(env, NULL, "Invalid input");
    assert(err == 0);

    err = js_release_string_view(env, str_view);
    assert(err == 0);

    return NULL;
  }

  err = js_release_string_view(env, str_view);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int64(env, written, &result);
  assert(err == 0);

  return result;
}

static inline int
bare_buffer__memcmp(void *a, size_t a_len, void *b, size_t b_len) {
  int r = memcmp(a, b, a_len < b_len ? a_len : b_len);

  if (r == 0) {
    if (a_len < b_len) return -1;
    if (a_len > b_len) return 1;
    return 0;
  }

  return r < 0 ? -1 : 1;
}

static int32_t
bare_buffer_typed_compare(
  js_value_t *receiver,
  js_value_t *a_handle,
  int64_t a_offset,
  int64_t a_len,
  js_value_t *b_handle,
  int64_t b_offset,
  int64_t b_len,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  uint8_t *a;
  err = bare_buffer__get_info(env, a_handle, (void **) &a, NULL);
  assert(err == 0);

  uint8_t *b;
  err = bare_buffer__get_info(env, b_handle, (void **) &b, NULL);
  assert(err == 0);

  return bare_buffer__memcmp(&a[a_offset], a_len, &b[b_offset], b_len);
}

static js_value_t *
bare_buffer_compare(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 6;
  js_value_t *argv[6];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 6);

  uint8_t *a;
  err = bare_buffer__get_info(env, argv[0], (void **) &a, NULL);
  assert(err == 0);

  int64_t a_offset;
  err = js_get_value_int64(env, argv[1], &a_offset);
  assert(err == 0);

  int64_t a_len;
  err = js_get_value_int64(env, argv[2], &a_len);
  assert(err == 0);

  uint8_t *b;
  err = bare_buffer__get_info(env, argv[3], (void **) &b, NULL);
  assert(err == 0);

  int64_t b_offset;
  err = js_get_value_int64(env, argv[4], &b_offset);
  assert(err == 0);

  int64_t b_len;
  err = js_get_value_int64(env, argv[5], &b_len);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int32(env, bare_buffer__memcmp(&a[a_offset], a_len, &b[b_offset], b_len), &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_buffer_exports(js_env_t *env, js_value_t *exports) {
  int err;

  js_value_t *constants;
  err = js_create_object(env, &constants);
  assert(err == 0);

  err = js_set_named_property(env, exports, "constants", constants);
  assert(err == 0);

  js_platform_t *platform;
  err = js_get_env_platform(env, &platform);
  assert(err == 0);

  js_platform_limits_t limits = {
    .version = 0,
  };

  err = js_get_platform_limits(platform, &limits);
  assert(err == 0);

#define V(name, value) \
  { \
    js_value_t *val; \
    err = js_create_int64(env, value, &val); \
    assert(err == 0); \
    err = js_set_named_property(env, constants, name, val); \
    assert(err == 0); \
  }

  V("MAX_LENGTH", limits.arraybuffer_length);
  V("MAX_STRING_LENGTH", limits.string_length);
#undef V

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
      .result = js_int64,
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
      .result = js_int64,
      .args_len = 5,
      .args = (int[]) {
        js_object,
        js_object,
        js_int64,
        js_int64,
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
      .result = js_int64,
      .args_len = 3,
      .args = (int[]) {
        js_object,
        js_object,
        js_string,
      }
    }),
    bare_buffer_typed_write_utf16le
  );

  V("toStringLatin1", bare_buffer_to_string_latin1, NULL, NULL);

  V(
    "writeLatin1",
    bare_buffer_write_latin1,
    &((js_callback_signature_t) {
      .version = 0,
      .result = js_int64,
      .args_len = 5,
      .args = (int[]) {
        js_object,
        js_object,
        js_int64,
        js_int64,
        js_string,
      }
    }),
    bare_buffer_typed_write_latin1
  );

  V("toStringBase64", bare_buffer_to_string_base64, NULL, NULL);
  V("toStringBase64URL", bare_buffer_to_string_base64url, NULL, NULL);

  V(
    "writeBase64",
    bare_buffer_write_base64,
    &((js_callback_signature_t) {
      .version = 0,
      .result = js_int64,
      .args_len = 5,
      .args = (int[]) {
        js_object,
        js_object,
        js_int64,
        js_int64,
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
      .result = js_int64,
      .args_len = 5,
      .args = (int[]) {
        js_object,
        js_object,
        js_int64,
        js_int64,
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
      .args_len = 7,
      .args = (int[]) {
        js_object,
        js_object,
        js_int64,
        js_int64,
        js_object,
        js_int64,
        js_int64,
      }
    }),
    bare_buffer_typed_compare
  );
#undef V

  return exports;
}

BARE_MODULE(bare_buffer, bare_buffer_exports)
