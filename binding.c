#include <uv.h>
#include <js.h>
#include <pear.h>

static js_value_t *
string_to_buffer (js_env_t *env, js_callback_info_t *info) {
  js_value_t *argv[1];
  size_t argc = 1;

  js_get_callback_info(env, info, &argc, argv, NULL, NULL);

  size_t str_len;
  js_get_value_string_utf8(env, argv[0], NULL, -1, &str_len);

  char *buf;
  js_value_t *result;
  str_len++; // to fit the NULL

  js_create_arraybuffer(env, str_len, (void **) &buf, &result);

  js_get_value_string_utf8(env, argv[0], buf, str_len, NULL);

  return result;
}

static js_value_t *
buffer_exports (js_env_t *env, js_value_t *exports) {
  {
    js_value_t *val;
    js_create_function(env, "stringToBuffer", -1, string_to_buffer, NULL, &val);
    js_set_named_property(env, exports, "stringToBuffer", val);
  }

  return exports;
}

PEAR_MODULE(buffer_exports)
