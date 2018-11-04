precision mediump float;
varying vec3 v_Barycentric;

void main() {
    if(any(lessThan(v_Barycentric, vec3(0.1)))){
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    else{
        gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
    }
}