#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec3 uTint;

//varying vec4 fColor;
varying  vec2 fTexCoord;

uniform sampler2D texture;

void main(void) {
	//fragColor = vec4(uTint, 1.0);
	//fragColor = texture2D(texture, fTexCoord) * fColor * vec4(uTint, 1.0);
	fragColor = texture2D(texture, fTexCoord) * vec4(uTint, 1.0);
}
