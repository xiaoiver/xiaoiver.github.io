/**
 * 只有明暗关系
 *
 */

#ifdef GL_ES
precision mediump float;
#endif

#define SPHERE_NUM 2

uniform vec3 u_EyePosition;
uniform vec3 u_LightPosition;
uniform vec3 u_LightColor;
struct Sphere {
    vec3 center;
    float radius;
    vec3 surfaceColor;
    vec3 emissionColor;
    float transparency;
    float reflection;
};
uniform Sphere u_Spheres[SPHERE_NUM];
varying vec3 v_Position;

bool intersect(in vec3 rayorig, in vec3 raydir,
                in vec3 center, in float radius,
                out float t0, out float t1) {
    vec3 l = center - rayorig;
    float tca = dot(l, raydir);
    if (tca < 0.0) return false;
    float d2 = dot(l, l) - tca * tca;
    if (d2 > radius * radius) return false;
    float thc = sqrt(radius * radius - d2);
    t0 = tca - thc;
    t1 = tca + thc;

    return true;
}

vec3 trace(in vec3 rayorig, in vec3 raydir) {
    vec3 color = vec3(0.0);
    Sphere intersectedSphere;
    bool intersected = false;
    float tnear = 10000.0;
    for (int i = 0; i < SPHERE_NUM; i++) {
        float t0 = 10000.0;
        float t1 = 10000.0;
        if (intersect(rayorig, raydir, u_Spheres[i].center, u_Spheres[i].radius, t0, t1)) {
            if (t0 < 0.0) t0 = t1;
            if (t0 < tnear) {
                tnear = t0;
                intersectedSphere = u_Spheres[i];
                intersected = true;
            }
        }
    }

    if (!intersected) return color;

    vec3 hitPoint = rayorig + raydir * tnear;
    vec3 hitNormal = normalize(hitPoint - intersectedSphere.center);
    vec3 lightDirection = normalize(u_LightPosition - hitPoint);
    float diffuse = clamp(dot(hitNormal, lightDirection), 0.0, 1.0);
    float ambient = 0.15;

    for (int j = 0; j < SPHERE_NUM; j++) {
        float t0, t1;
        if (intersect(hitPoint, lightDirection, u_Spheres[j].center, u_Spheres[j].radius, t0, t1)) {
            diffuse *= 0.2;
            break;
        }
    }

    color += (diffuse + ambient) * intersectedSphere.surfaceColor;
    
    return color;
}
  
void main() {
    vec3 eyeDirection = normalize(v_Position - u_EyePosition);
    gl_FragColor = vec4(trace(u_EyePosition, eyeDirection), 1.0);
}