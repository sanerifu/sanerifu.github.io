"use strict";
const canvas = document.querySelector("#grid");
const gl = canvas.getContext("webgl2");
if (gl === null) {
    throw Error("Could not initialize WebGL");
}
const tile_size = 16;
const width = Math.ceil(canvas.width / tile_size);
const height = Math.ceil(canvas.height / tile_size);
const grid = new Uint8Array(width * height);
grid[0] = 255;
grid[20] = 255;
const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R8, width, height);
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RED, gl.UNSIGNED_BYTE, grid);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
function createShader(type, source) {
    const shader = gl.createShader(type);
    if (shader === null) {
        throw Error("Could not create shader");
    }
    let prelude = `#version 300 es
    precision highp float;
    precision highp int;
    `;
    if (type === gl.VERTEX_SHADER) {
        prelude += `
        #define VERTEX
        #define varying out
        `;
    }
    else if (type === gl.FRAGMENT_SHADER) {
        prelude += `
        #define FRAGMENT
        #define varying in
        `;
    }
    gl.shaderSource(shader, prelude + source);
    gl.compileShader(shader);
    const shader_message = gl.getShaderInfoLog(shader);
    if (shader_message && shader_message.length > 0) {
        throw Error(shader_message);
    }
    return shader;
}
function createProgram(source) {
    const vertex = createShader(gl.VERTEX_SHADER, source);
    const fragment = createShader(gl.FRAGMENT_SHADER, source);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    const program_message = gl.getProgramInfoLog(program);
    if (program_message && program_message.length > 0) {
        throw Error(program_message);
    }
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return program;
}
const program = createProgram(`
flat varying ivec2 vPosition;
uniform ivec2 uSize;
uniform int uPixelSize;
uniform ivec2 uScreenSize;
uniform sampler2D uGrid;

#ifdef VERTEX
in vec2 aPosition;

void main() {
    ivec2 grid_position = ivec2(gl_InstanceID % uSize.x, gl_InstanceID / uSize.x);
    vec2 pixel_position = (vec2(grid_position * ivec2(uPixelSize)) + vec2(float(uPixelSize)) * aPosition);
    vec2 normalized_position = pixel_position / vec2(uScreenSize);

    vPosition = grid_position;

    gl_Position = vec4(normalized_position * 2.0f - 1.0f, 0.0f, 1.0f);
}
#endif

#ifdef FRAGMENT
out vec4 oColor;
void main() {
    float data = texelFetch(uGrid, vPosition, 0).r;
    oColor = vec4(data, 0.0f, 1.0f, 1.0f);
}
#endif
`);
gl.useProgram(program);
gl.uniform2i(gl.getUniformLocation(program, "uSize"), width, height);
gl.uniform1i(gl.getUniformLocation(program, "uPixelSize"), tile_size);
gl.uniform2i(gl.getUniformLocation(program, "uScreenSize"), canvas.width, canvas.height);
gl.uniform1i(gl.getUniformLocation(program, "uGrid"), 0);
const quad = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
]);
const quad_vao = gl.createVertexArray();
gl.bindVertexArray(quad_vao);
gl.enableVertexAttribArray(0);
const quad_vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad_vbo);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);
gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, width * height);
