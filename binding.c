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

static js_value_t *
bare_buffer_validate_utf8(js_env_t *env, js_callback_info_t *info) {
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
  err = js_get_boolean(env, utf8_validate(&buf[offset], len), &result);
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

static js_value_t *
bare_buffer_validate_ascii(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  ascii_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  js_value_t *result;
  err = js_get_boolean(env, ascii_validate(&buf[offset], len), &result);
  assert(err == 0);

  return result;
}

static inline void
bare_buffer__swap16(uint8_t *data, size_t len) {
  for (size_t i = 0; i + 1 < len; i += 2) {
    uint8_t a = data[i];
    data[i] = data[i + 1];
    data[i + 1] = a;
  }
}

static inline void
bare_buffer__swap32(uint8_t *data, size_t len) {
  for (size_t i = 0; i + 3 < len; i += 4) {
    uint8_t a = data[i];
    uint8_t b = data[i + 1];
    data[i] = data[i + 3];
    data[i + 1] = data[i + 2];
    data[i + 2] = b;
    data[i + 3] = a;
  }
}

static inline void
bare_buffer__swap64(uint8_t *data, size_t len) {
  for (size_t i = 0; i + 7 < len; i += 8) {
    for (size_t j = 0; j < 4; j++) {
      uint8_t a = data[i + j];
      data[i + j] = data[i + 7 - j];
      data[i + 7 - j] = a;
    }
  }
}

static const uint8_t *
bare_buffer__memrchr(const uint8_t *data, uint8_t c, size_t len) {
  const size_t chunk_len = 512;

  while (len > 0) {
    size_t take = len < chunk_len ? len : chunk_len;

    const uint8_t *chunk = &data[len - take];

    // When matches are dense the last one is within a few bytes of the end,
    // which is far cheaper to find by looking than by narrowing.
    size_t probe = take < 8 ? take : 8;

    for (size_t i = 0; i < probe; i++) {
      if (chunk[take - 1 - i] == c) return &chunk[take - 1 - i];
    }

    if (memchr(chunk, c, take - probe) != NULL) {
      size_t lo = 0;
      size_t hi = take - probe;

      while (hi - lo > 1) {
        size_t mid = lo + (hi - lo) / 2;

        if (memchr(&chunk[mid], c, hi - mid) != NULL) lo = mid;
        else hi = mid;
      }

      return &chunk[lo];
    }

    len -= take;
  }

  return NULL;
}

static int64_t
bare_buffer__index_of(const uint8_t *data, size_t len, const uint8_t *needle, size_t needle_len, size_t from) {
  if (needle_len == 0 || needle_len > len || from > len - needle_len) return -1;

  if (needle_len == 1) {
    const uint8_t *at = memchr(&data[from], needle[0], len - from);

    return at == NULL ? -1 : (int64_t) (at - data);
  }

  size_t end = len - needle_len + 1;
  size_t i = from;
  size_t rejected = 0;

  while (i < end) {
    const uint8_t *at = memchr(&data[i], needle[0], end - i);

    if (at == NULL) return -1;

    i = (size_t) (at - data);

    if (memcmp(&data[i + 1], &needle[1], needle_len - 1) == 0) return (int64_t) i;

    i++;

    if (++rejected == 32) break;
  }

  if (i >= end) return -1;

  size_t skip[256];

  for (size_t j = 0; j < 256; j++) {
    skip[j] = needle_len;
  }

  for (size_t j = 0; j < needle_len - 1; j++) {
    skip[needle[j]] = needle_len - 1 - j;
  }

  size_t last = needle_len - 1;

  while (i < end) {
    if (data[i + last] == needle[last] && memcmp(&data[i], needle, last) == 0) {
      return (int64_t) i;
    }

    i += skip[data[i + last]];
  }

  return -1;
}

static int64_t
bare_buffer__last_index_of(const uint8_t *data, size_t len, const uint8_t *needle, size_t needle_len, size_t from) {
  if (needle_len == 0 || needle_len > len) return -1;

  if (from > len - needle_len) from = len - needle_len;

  if (needle_len == 1) {
    const uint8_t *at = bare_buffer__memrchr(data, needle[0], from + 1);

    return at == NULL ? -1 : (int64_t) (at - data);
  }

  size_t i = from;
  size_t rejected = 0;

  while (rejected < 32) {
    const uint8_t *at = bare_buffer__memrchr(data, needle[0], i + 1);

    if (at == NULL) return -1;

    i = (size_t) (at - data);

    if (memcmp(&data[i + 1], &needle[1], needle_len - 1) == 0) return (int64_t) i;

    if (i == 0) return -1;

    i--;
    rejected++;
  }

  size_t skip[256];

  for (size_t j = 0; j < 256; j++) {
    skip[j] = needle_len;
  }

  for (size_t j = needle_len - 1; j >= 1; j--) {
    skip[needle[j]] = j;
  }

  while (true) {
    if (data[i] == needle[0] && memcmp(&data[i + 1], &needle[1], needle_len - 1) == 0) {
      return (int64_t) i;
    }

    size_t shift = skip[data[i]];

    if (i < shift) return -1;

    i -= shift;
  }
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

static int32_t
bare_buffer_typed_swap16(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  uint8_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  bare_buffer__swap16(&buf[offset], len);

  return 0;
}

static js_value_t *
bare_buffer_swap16(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  uint8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  bare_buffer__swap16(&buf[offset], len);

  return NULL;
}

static int32_t
bare_buffer_typed_swap32(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  uint8_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  bare_buffer__swap32(&buf[offset], len);

  return 0;
}

static js_value_t *
bare_buffer_swap32(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  uint8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  bare_buffer__swap32(&buf[offset], len);

  return NULL;
}

static int32_t
bare_buffer_typed_swap64(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  uint8_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  bare_buffer__swap64(&buf[offset], len);

  return 0;
}

static js_value_t *
bare_buffer_swap64(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  uint8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  bare_buffer__swap64(&buf[offset], len);

  return NULL;
}

static int64_t
bare_buffer_typed_index_of(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_value_t *needle_handle,
  int64_t needle_offset,
  int64_t needle_len,
  int64_t from,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  uint8_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  uint8_t *needle;
  err = bare_buffer__get_info(env, needle_handle, (void **) &needle, NULL);
  assert(err == 0);

  return bare_buffer__index_of(&buf[offset], len, &needle[needle_offset], needle_len, from);
}

static js_value_t *
bare_buffer_index_of(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 7;
  js_value_t *argv[7];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 7);

  uint8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  uint8_t *needle;
  err = bare_buffer__get_info(env, argv[3], (void **) &needle, NULL);
  assert(err == 0);

  int64_t needle_offset;
  err = js_get_value_int64(env, argv[4], &needle_offset);
  assert(err == 0);

  int64_t needle_len;
  err = js_get_value_int64(env, argv[5], &needle_len);
  assert(err == 0);

  int64_t from;
  err = js_get_value_int64(env, argv[6], &from);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int64(env, bare_buffer__index_of(&buf[offset], len, &needle[needle_offset], needle_len, from), &result);
  assert(err == 0);

  return result;
}

static int64_t
bare_buffer_typed_last_index_of(
  js_value_t *receiver,
  js_value_t *handle,
  int64_t offset,
  int64_t len,
  js_value_t *needle_handle,
  int64_t needle_offset,
  int64_t needle_len,
  int64_t from,
  js_typed_callback_info_t *info
) {
  int err;

  js_env_t *env;
  err = js_get_typed_callback_info(info, &env, NULL);
  assert(err == 0);

  uint8_t *buf;
  err = bare_buffer__get_info(env, handle, (void **) &buf, NULL);
  assert(err == 0);

  uint8_t *needle;
  err = bare_buffer__get_info(env, needle_handle, (void **) &needle, NULL);
  assert(err == 0);

  return bare_buffer__last_index_of(&buf[offset], len, &needle[needle_offset], needle_len, from);
}

static js_value_t *
bare_buffer_last_index_of(js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 7;
  js_value_t *argv[7];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 7);

  uint8_t *buf;
  err = bare_buffer__get_info(env, argv[0], (void **) &buf, NULL);
  assert(err == 0);

  int64_t offset;
  err = js_get_value_int64(env, argv[1], &offset);
  assert(err == 0);

  int64_t len;
  err = js_get_value_int64(env, argv[2], &len);
  assert(err == 0);

  uint8_t *needle;
  err = bare_buffer__get_info(env, argv[3], (void **) &needle, NULL);
  assert(err == 0);

  int64_t needle_offset;
  err = js_get_value_int64(env, argv[4], &needle_offset);
  assert(err == 0);

  int64_t needle_len;
  err = js_get_value_int64(env, argv[5], &needle_len);
  assert(err == 0);

  int64_t from;
  err = js_get_value_int64(env, argv[6], &from);
  assert(err == 0);

  js_value_t *result;
  err = js_create_int64(env, bare_buffer__last_index_of(&buf[offset], len, &needle[needle_offset], needle_len, from), &result);
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
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int64,
      .args_len = 2,
      .args = (int[]){
        js_object,
        js_string,
      }
    }),
    bare_buffer_typed_byte_length_utf8
  );

  V("toStringUTF8", bare_buffer_to_string_utf8, NULL, NULL);

  V("validateUTF8", bare_buffer_validate_utf8, NULL, NULL);

  V(
    "writeUTF8",
    bare_buffer_write_utf8,
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int64,
      .args_len = 5,
      .args = (int[]){
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
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int64,
      .args_len = 5,
      .args = (int[]){
        js_object,
        js_object,
        js_int64,
        js_int64,
        js_string,
      }
    }),
    bare_buffer_typed_write_utf16le
  );

  V("toStringLatin1", bare_buffer_to_string_latin1, NULL, NULL);

  V(
    "writeLatin1",
    bare_buffer_write_latin1,
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int64,
      .args_len = 5,
      .args = (int[]){
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
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int64,
      .args_len = 5,
      .args = (int[]){
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
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int64,
      .args_len = 5,
      .args = (int[]){
        js_object,
        js_object,
        js_int64,
        js_int64,
        js_string,
      }
    }),
    bare_buffer_typed_write_hex
  );

  V("validateAscii", bare_buffer_validate_ascii, NULL, NULL);

  V(
    "swap16",
    bare_buffer_swap16,
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int32,
      .args_len = 4,
      .args = (int[]){
        js_object,
        js_object,
        js_int64,
        js_int64,
      }
    }),
    bare_buffer_typed_swap16
  );

  V(
    "swap32",
    bare_buffer_swap32,
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int32,
      .args_len = 4,
      .args = (int[]){
        js_object,
        js_object,
        js_int64,
        js_int64,
      }
    }),
    bare_buffer_typed_swap32
  );

  V(
    "swap64",
    bare_buffer_swap64,
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int32,
      .args_len = 4,
      .args = (int[]){
        js_object,
        js_object,
        js_int64,
        js_int64,
      }
    }),
    bare_buffer_typed_swap64
  );

  V(
    "indexOf",
    bare_buffer_index_of,
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int64,
      .args_len = 8,
      .args = (int[]){
        js_object,
        js_object,
        js_int64,
        js_int64,
        js_object,
        js_int64,
        js_int64,
        js_int64,
      }
    }),
    bare_buffer_typed_index_of
  );

  V(
    "lastIndexOf",
    bare_buffer_last_index_of,
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int64,
      .args_len = 8,
      .args = (int[]){
        js_object,
        js_object,
        js_int64,
        js_int64,
        js_object,
        js_int64,
        js_int64,
        js_int64,
      }
    }),
    bare_buffer_typed_last_index_of
  );

  V(
    "compare",
    bare_buffer_compare,
    &((js_callback_signature_t){
      .version = 0,
      .result = js_int32,
      .args_len = 7,
      .args = (int[]){
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
