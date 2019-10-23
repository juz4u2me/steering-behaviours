uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
attribute vec3 a_position;
attribute float a_batchId;
attribute vec3 a_normal;
varying vec3 v_normal;
uniform mat3 u_normalMatrix;
uniform float u_shininess;
uniform float u_specularNorm;
varying float v_specularIntensity;
void main(void) {
  vec4 pos = u_modelViewMatrix * vec4(a_position,1.0);
  v_normal = normalize(u_normalMatrix * (a_normal));
  vec3 viewDir = -normalize(pos.xyz);
  vec3 h = normalize(czm_sunDirectionEC + viewDir);
  v_specularIntensity = max(0., pow(max(dot(v_normal, h), 0.), u_shininess)) * u_specularNorm * 0.0;
  gl_Position = u_projectionMatrix * pos;
}
