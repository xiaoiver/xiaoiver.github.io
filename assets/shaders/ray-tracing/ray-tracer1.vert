attribute vec4 a_Position;
varying vec3 v_Position;
// uniform mat4 u_MvpMatrix;

void main() {
    // gl_Position = u_MvpMatrix * a_Position;
    gl_Position = a_Position;
    v_Position = vec3(a_Position);
}