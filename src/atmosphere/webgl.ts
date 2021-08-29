/**
 * ======================================================================================================
 *
 * ======================================================================================================
 */
const defaultShaderType = ['VERTEX_SHADER', 'FRAGMENT_SHADER'];
export function createProgramFromScripts(
  gl: WebGLRenderingContext,
  shaderScriptIds: { type: 'vertex' | 'fragment'; script: string }[],
  opt_attribs?: any,
  opt_locations?: any,
  opt_errorCallback?: any,
) {
  const shaders = [];
  for (let ii = 0; ii < shaderScriptIds.length; ++ii) {
    shaders.push(
      createShaderFromScript(
        gl,
        shaderScriptIds[ii],
        (gl as any)[defaultShaderType[ii]],
        opt_errorCallback,
      ),
    );
  }
  return createProgram(
    gl,
    shaders,
    opt_attribs,
    opt_locations,
    opt_errorCallback,
  );
}
/**
 * Loads a shader from a script tag.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} scriptId The id of the script tag.
 * @param {number} opt_shaderType The type of shader. If not passed in it will
 *     be derived from the type of the script tag.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
function createShaderFromScript(
  gl: WebGLRenderingContext,
  { type, script }: { type: 'vertex' | 'fragment'; script: string },
  opt_shaderType: number,
  opt_errorCallback: any,
) {
  let shaderType: number;
  if (type === 'vertex') {
    shaderType = gl.VERTEX_SHADER;
  } else if (type === 'fragment') {
    shaderType = gl.FRAGMENT_SHADER;
  } else {
    throw '*** Error: unknown shader type';
  }

  return loadShader(
    gl,
    script,
    opt_shaderType ? opt_shaderType : shaderType,
    opt_errorCallback,
  );
}
/**
 * Loads a shader.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
function loadShader(
  gl: any,
  shaderSource: any,
  shaderType: any,
  opt_errorCallback: any,
) {
  const errFn = opt_errorCallback || console.error;
  // Create the shader object
  const shader = gl.createShader(shaderType);

  // Load the shader source
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(shader);
    errFn(
      "*** Error compiling shader '" +
        shader +
        "':" +
        lastError +
        `\n` +
        shaderSource
          .split('\n')
          .map((l: any, i: any) => `${i + 1}: ${l}`)
          .join('\n'),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */
function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  multiplier: number = 1,
) {
  const width = (canvas.clientWidth * multiplier) | 0;
  const height = (canvas.clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}
export const m3 = {
  /**
   * Creates a 2D projection matrix
   * @param {number} width width in pixels
   * @param {number} height height in pixels
   * @return {module:webgl-2d-math.Matrix3} a projection matrix that converts from pixels to clipspace with Y = 0 at the top.
   * @memberOf module:webgl-2d-math
   */
  projection(width: number, height: number) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1];
  },

  /**
   * Multiplies by a 2D projection matrix
   * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
   * @param {number} width width in pixels
   * @param {number} height height in pixels
   * @return {module:webgl-2d-math.Matrix3} the result
   * @memberOf module:webgl-2d-math
   */
  project(m: number, width: number, height: number) {
    return multiply(m, m3.projection(width, height));
  },

  /**
   * Creates a 2D translation matrix
   * @param {number} tx amount to translate in x
   * @param {number} ty amount to translate in y
   * @return {module:webgl-2d-math.Matrix3} a translation matrix that translates by tx and ty.
   * @memberOf module:webgl-2d-math
   */
  translation(tx: any, ty: any) {
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
  },

  /**
   * Multiplies by a 2D translation matrix
   * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
   * @param {number} tx amount to translate in x
   * @param {number} ty amount to translate in y
   * @return {module:webgl-2d-math.Matrix3} the result
   * @memberOf module:webgl-2d-math
   */
  translate(m: any, tx: any, ty: any) {
    return multiply(m, m3.translation(tx, ty));
  },

  /**
   * Creates a 2D rotation matrix
   * @param {number} angleInRadians amount to rotate in radians
   * @return {module:webgl-2d-math.Matrix3} a rotation matrix that rotates by angleInRadians
   * @memberOf module:webgl-2d-math
   */
  rotation(angleInRadians: any) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
  },
  /**
   * Multiplies by a 2D rotation matrix
   * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
   * @param {number} angleInRadians amount to rotate in radians
   * @return {module:webgl-2d-math.Matrix3} the result
   * @memberOf module:webgl-2d-math
   */
  rotate(m: any, angleInRadians: any) {
    return multiply(m, m3.rotation(angleInRadians));
  },

  /**
   * Creates a 2D scaling matrix
   * @param {number} sx amount to scale in x
   * @param {number} sy amount to scale in y
   * @return {module:webgl-2d-math.Matrix3} a scale matrix that scales by sx and sy.
   * @memberOf module:webgl-2d-math
   */
  scaling(sx: number, sy: number) {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  },
  /**
   * Multiplies by a 2D scaling matrix
   * @param {module:webgl-2d-math.Matrix3} the matrix to be multiplied
   * @param {number} sx amount to scale in x
   * @param {number} sy amount to scale in y
   * @return {module:webgl-2d-math.Matrix3} the result
   * @memberOf module:webgl-2d-math
   */
  scale(m: any, sx: any, sy: any) {
    return multiply(m, m3.scaling(sx, sy));
  },
};
/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @memberOf module:webgl-utils
 */
function createProgram(
  gl: any,
  shaders: any,
  opt_attribs: any,
  opt_locations: any,
  opt_errorCallback: any,
) {
  const errFn = opt_errorCallback || console.error;
  const program = gl.createProgram();
  shaders.forEach(function (shader: any) {
    gl.attachShader(program, shader);
  });
  if (opt_attribs) {
    opt_attribs.forEach(function (attrib: any, ndx: any) {
      gl.bindAttribLocation(
        program,
        opt_locations ? opt_locations[ndx] : ndx,
        attrib,
      );
    });
  }
  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program);
    errFn('Error in program linking:' + lastError);

    gl.deleteProgram(program);
    return null;
  }
  return program;
}
/**
 * Takes two Matrix3s, a and b, and computes the product in the order
 * that pre-composes b with a.  In other words, the matrix returned will
 * @param {module:webgl-2d-math.Matrix3} a A matrix.
 * @param {module:webgl-2d-math.Matrix3} b A matrix.
 * @return {module:webgl-2d-math.Matrix3} the result.
 * @memberOf module:webgl-2d-math
 */
function multiply(a: any, b: any) {
  var a00 = a[0 * 3 + 0];
  var a01 = a[0 * 3 + 1];
  var a02 = a[0 * 3 + 2];
  var a10 = a[1 * 3 + 0];
  var a11 = a[1 * 3 + 1];
  var a12 = a[1 * 3 + 2];
  var a20 = a[2 * 3 + 0];
  var a21 = a[2 * 3 + 1];
  var a22 = a[2 * 3 + 2];
  var b00 = b[0 * 3 + 0];
  var b01 = b[0 * 3 + 1];
  var b02 = b[0 * 3 + 2];
  var b10 = b[1 * 3 + 0];
  var b11 = b[1 * 3 + 1];
  var b12 = b[1 * 3 + 2];
  var b20 = b[2 * 3 + 0];
  var b21 = b[2 * 3 + 1];
  var b22 = b[2 * 3 + 2];

  return [
    b00 * a00 + b01 * a10 + b02 * a20,
    b00 * a01 + b01 * a11 + b02 * a21,
    b00 * a02 + b01 * a12 + b02 * a22,
    b10 * a00 + b11 * a10 + b12 * a20,
    b10 * a01 + b11 * a11 + b12 * a21,
    b10 * a02 + b11 * a12 + b12 * a22,
    b20 * a00 + b21 * a10 + b22 * a20,
    b20 * a01 + b21 * a11 + b22 * a21,
    b20 * a02 + b21 * a12 + b22 * a22,
  ];
}
