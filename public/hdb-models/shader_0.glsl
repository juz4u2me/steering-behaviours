precision highp float;
uniform vec4 u_diffuse_mat;
varying vec3 v_normal;
varying float v_specularIntensity;
void main(void) {
  float lambert = dot(v_normal,czm_sunDirectionEC);
  float diffuseIntensity = (lambert + 1.0) * 0.5 * 1.0 + 0.3;
  vec4 diffuseColor = u_diffuse_mat;
  vec3 lightColor = vec3(1.0, 1.0, 1.0);
  vec4 color = vec4(diffuseColor.rgb * diffuseIntensity + lightColor.rgb * v_specularIntensity, diffuseColor.a);
  gl_FragColor = color;
}
