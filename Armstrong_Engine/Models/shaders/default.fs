#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec3 uTint;

void main(void) {
	fragColor = vec4(uTint, 1.0);
}
