attribute vec4 a_Position;
attribute vec3 a_Barycentric;
varying vec3 v_Barycentric;
// uniform mat4 u_MvpMatrix;

void main() {
    // gl_Position = u_MvpMatrix * a_Position;
    v_Barycentric = a_Barycentric;
    gl_Position = a_Position;
}
