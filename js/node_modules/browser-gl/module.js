function headlessGL(width,height,config){
  var canvas = document.getElementById('canvas');
  return gl = canvas.getContext('webgl');
}
   
exports.headlessGL = headlessGL;