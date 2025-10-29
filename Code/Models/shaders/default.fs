#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec3 uTint;

//in vec4 fColor;
in vec2 fTexCoord;

uniform sampler2D uTexture;

void main(void) {
	//fragColor = vec4(uTint, 1.0);
	//fragColor = texture(uTexture, fTexCoord) * fColor * vec4(uTint, 1.0);
	
	fragColor = texture(uTexture, fTexCoord);
}
