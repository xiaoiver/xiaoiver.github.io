precision mediump float;
varying vec3 v_Barycentric;

#extension GL_OES_standard_derivatives : enable
float edgeFactor(){
    vec3 d = fwidth(v_Barycentric);
    vec3 a3 = smoothstep(vec3(0.0), d*1.5, v_Barycentric);
    return min(min(a3.x, a3.y), a3.z);
}

void main() {
  if (gl_FrontFacing) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0 - edgeFactor());
  }
  else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, (1.0 - edgeFactor()) * 0.3);
  }
}