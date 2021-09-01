import { createProgramFromScripts, m3 } from './webgl';
import { range } from './range';

export function paint(
  canvas: HTMLCanvasElement,
  paintLogic: string,
  radius: number,
) {
  var gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error();
  }

  // setup GLSL program
  var program = createProgramFromScripts(gl, [
    {
      type: 'vertex',
      script: `
attribute vec2 a_position;

uniform mat3 u_matrix;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_scale;

varying vec4 v_color;
float PI = 3.14159265358979323846264;

void main() {
  ${paintLogic}
}
    `,
    },
    {
      type: 'fragment',
      script: `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}  
`,
    },
  ]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
  const centerPosLocation = gl.getUniformLocation(program, 'u_center');
  const radiusLocation = gl.getUniformLocation(program, 'u_radius');

  // Create a buffer.
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Set Geometry.
  const triangles = genTriangleArray(canvas.width, canvas.height, 10);
  setGeometry(gl, triangles);

  var translation = [0, 0];
  var angleInRadians = 0;
  var scale = [1, 1];

  // Draw the scene.
  // resizeCanvasToDisplaySize(gl.canvas as any);
  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset,
  );

  // Compute the matrix
  var matrix = m3.projection(gl.canvas.width, gl.canvas.height);
  matrix = m3.translate(matrix, translation[0], translation[1]);
  matrix = m3.rotate(matrix, angleInRadians);
  matrix = m3.scale(matrix, scale[0], scale[1]);

  // Set the matrix.
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform2f(centerPosLocation, gl.canvas.width / 2, gl.canvas.height / 2);
  gl.uniform1f(radiusLocation, radius);

  // Draw the geometry.
  for (let i = 0; i < triangles.length; ) {
    const drawLength = Math.min(triangles.length - i, 100);
    var primitiveType = gl.TRIANGLES;
    var offset = i * 3;
    var count = 3 * drawLength;
    gl.drawArrays(primitiveType, offset, count);
    i += drawLength;
  }
}
// Fill the buffer with the values that define a triangle.
// Note, will put the values in whatever buffer is currently
// bound to the ARRAY_BUFFER bind point
function setGeometry(gl: WebGLRenderingContext, from: number[][]) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(Array.prototype.concat(...from)),
    gl.STATIC_DRAW,
  );
}
function genTriangleArray(width: number, height: number, step: number) {
  const r = width / 2;
  const ans = [] as number[][];
  for (let angle of range(0, Math.PI * 2, 0.05)) {
    const nextAngle = angle + 0.05;
    for (let dist of range(r * 0.4, r, step / 2)) {
      const nextDist = dist + step;

      const mx = width / 2;
      const my = height / 2;
      const x0 = mx + dist * Math.sin(angle);
      const y0 = my - dist * Math.cos(angle);
      const x1 = mx + nextDist * Math.sin(angle);
      const y1 = my - nextDist * Math.cos(angle);
      const x2 = mx + dist * Math.sin(nextAngle);
      const y2 = my - dist * Math.cos(nextAngle);
      const x3 = mx + nextDist * Math.sin(nextAngle);
      const y3 = my - nextDist * Math.cos(nextAngle);
      ans.push([x0, y0, x1, y1, x2, y2]);
      ans.push([x1, y1, x2, y2, x3, y3]);
    }
  }

  return ans;
}
