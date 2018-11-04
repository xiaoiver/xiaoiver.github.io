precision mediump float;
varying vec3 v_Barycentric;

#extension GL_OES_standard_derivatives : enable
float edgeFactor(){
  float f = v_Barycentric.x;
  if( v_Barycentric.x < min(v_Barycentric.y, v_Barycentric.z) )
    f = v_Barycentric.z;

  const float PI = 3.14159265;
  float stipple = pow( clamp( 5.0 * sin( f * 21.0 * PI ), 0.0, 1.0 ), 10.0 );
  float thickness = 2.0 * stipple;

  vec3 d = fwidth(v_Barycentric);
  vec3 a3 = smoothstep(vec3(0.0), d * thickness, v_Barycentric);
  return min(min(a3.x, a3.y), a3.z);
}

void main() {
  gl_FragColor.rgb = mix(vec3(0.0), vec3(1.0), edgeFactor());
  gl_FragColor.a = 1.0;
}