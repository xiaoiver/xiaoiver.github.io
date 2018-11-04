precision mediump float;
varying vec3 v_Barycentric;

#extension GL_OES_standard_derivatives : enable
float edgeFactor(){
  vec3 d = fwidth(v_Barycentric);
  vec3 a3 = smoothstep(vec3(0.0), d*1.0, v_Barycentric);
  return min(min(a3.x, a3.y), a3.z);
}

void main() {
  gl_FragColor.rgb = mix(vec3(0.0), vec3(1.0), edgeFactor());
  gl_FragColor.a = 1.0;
}