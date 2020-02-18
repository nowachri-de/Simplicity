
function headlessGL(width,height,config){
  var canvas = document.getElementById('canvas');
  canvas.width = width;
  canvas.height = height;
  let gl = canvas.getContext('webgl');
  let ext = gl.getExtension("WEBGL_draw_buffers");

  if (!ext){
    console.log("Extension WEBGL_draw_buffers does not exist");
  }
  return gl;
}
   
module.exports = headlessGL;