#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec3 uTint;

//in vec4 fColor;
in vec2 vTexCoord;

uniform sampler2D uTexture;

void main(void) {	
	fragColor = texture(uTexture, vTexCoord) * vec4(uTint, 1.0);;
}
