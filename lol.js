precision highp float;\n\
attribute vec3 position;\n\
attribute vec3 normal;\n\
uniform mat3 normalMatrix;\n\
uniform mat4 modelViewMatrix;\n\
uniform mat4 projectionMatrix;\n\
uniform float time;\n\
varying vec3 fNormal;\n\
varying vec3 fPosition;\n\

void main()
{
  fNormal = normalize(normalMatrix * normal);\n\
  vec4 pos = modelViewMatrix * vec4(position, 1.0);\n\
  fPosition = pos.xyz;\n\
  pos.z += 2.0 * sin(time*20.0 + pos.x * 2.0) * cos(time * 20.0 + pos.y * 5.0);\n\
  gl_Position = projectionMatrix * pos;\n\

}


/////////fragment

precision highp float;\n\
uniform float time;\n\
uniform vec2 resolution;\n\
varying vec3 fPosition;\n\
varying vec3 fNormal;\n\

void main()
{
  float len1 = distance(fPosition, vec3(0.0, 2.0, 0.1));\n\
  float len2 = distance(fPosition, vec3(0.1, 0.0, 0.2));\n\
  float len3 = distance(fPosition, vec3(0.0, 0.3, 0.3));\n\
  vec3 c = vec3(fract(len1 * 5.5 + time * 10.0),fract(len2 * 5.5 + time * 4.0),fract(len3 * 5.5 + time * 2.0));\n\
  if (c.r > 0.5) {discard;}\n\
  gl_FragColor = vec4(c.grb, 1.0);\n\
}


///////////////vertex

precision highp float;\n\
attribute vec3 position;\n\
attribute vec3 normal;\n\
uniform mat3 normalMatrix;\n\
uniform mat4 modelViewMatrix;\n\
uniform mat4 projectionMatrix;\n\
uniform float time;\n\
varying vec3 fNormal;\n\
varying vec3 fPosition;\n\


void main()
{
  fNormal = normalize(normalMatrix * normal);\n\
  vec4 pos = modelViewMatrix * vec4(position, 1.0);\n\
  pos.y += 0.2 * sin(35.0 * time);\n\
  fPosition = pos.xyz;\n\
  gl_Position = projectionMatrix * pos;\n\
}
