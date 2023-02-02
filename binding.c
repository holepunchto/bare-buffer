#include <js.h>
#include <pear.h>

static js_value_t *
init (js_env_t *env, js_value_t *exports) {
  return exports;
}

PEAR_MODULE(init)
