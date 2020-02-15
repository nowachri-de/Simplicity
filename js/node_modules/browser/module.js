
/**
 * Get the default contex version for create3DContext.
 * First it looks at the URI option |webglVersion|. If it does not exist,
 * then look at the global default3DContextVersion variable.
 */
var getDefault3DContextVersion = function() {
  return default3DContextVersion;
};
/**
 * Checks if an attribute exists on an object case insensitive.
 * @param {!Object} obj Object to check
 * @param {string} attr Name of attribute to look for.
 * @return {string?} The name of the attribute if it exists,
 *         undefined if not.
 */
var hasAttributeCaseInsensitive = function(obj, attr) {
  var lower = attr.toLowerCase();
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && key.toLowerCase() == lower) {
      return key;
    }
  }
};
/**
 * Makes a shallow copy of an object.
 * @param {!Object} src Object to copy
 * @return {!Object} The copy of src.
 */
var shallowCopyObject = function(src) {
  var dst = {};
  for (var attr in src) {
    if (src.hasOwnProperty(attr)) {
      dst[attr] = src[attr];
    }
  }
  return dst;
};
var create3DContext = function(opt_canvas, opt_attributes, opt_version) {
  if (window.initTestingHarness) {
    window.initTestingHarness();
  }
  var attributes = shallowCopyObject(opt_attributes || {});
  if (!hasAttributeCaseInsensitive(attributes, "antialias")) {
    attributes.antialias = false;
    attributes.premultipliedAlpha = false;
    attributes.preserveDrawingBuffer = false;
  }
  if (!opt_version) {
    opt_version = 2;//getDefault3DContextVersion();
  }
  opt_canvas = opt_canvas || document.createElement("canvas");
  if (typeof opt_canvas == 'string') {
    opt_canvas = document.getElementById(opt_canvas);
  }
  var context = null;

  var names;
  switch (opt_version) {
    case 2:
      names = ["webgl2"]; break;
    default:
      names = ["webgl", "experimental-webgl"]; break;
  }

  for (var i = 0; i < names.length; ++i) {
    try {
      context = opt_canvas.getContext(names[i], attributes);
    } catch (e) {
    }
    if (context) {
      break;
    }
  }
  if (!context) {
    testFailed("Unable to fetch WebGL rendering context for Canvas");
  } else {
    if (!window._wtu_contexts) {
      window._wtu_contexts = []
    }
    window._wtu_contexts.push(context);
  }
  return context;
};

function headlessGL(width,height,config){
  var canvas = document.getElementById('canvas');
  canvas.width = width;
  canvas.height = height;

  console.log('browser-gl');
  let gl = canvas.getContext('webgl');
  let ext = gl.getExtension("WEBGL_draw_buffers");
  console.log(ext);
  return gl;
  //return gl = create3DContext(canvas);
}
   
module.exports = headlessGL;