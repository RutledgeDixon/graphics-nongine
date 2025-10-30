#version 300 es
precision mediump float;
in vec4 aVertexPosition;
in vec2 aTexCoord;

uniform vec3 uTranslate;
uniform vec3 uScale;
uniform vec3 uRotate;
uniform float uTime;
		
//texture stuff
out vec2 vTexCoord;

void main(void) {
	//assign texture varyings
    vTexCoord = aTexCoord;

	vec3 newPosition = vec3(aVertexPosition);
	newPosition *= uScale;
	mat3 uRotX = mat3(1, 0, 0, 0, cos(uRotate.x), sin(uRotate.x), 0, -sin(uRotate.x), cos(uRotate.x));
	mat3 uRotY = mat3(cos(uRotate.y), 0.0, -sin(uRotate.y), 0, 1.0, 0.0, sin(uRotate.y), 0.0, cos(uRotate.y));
	mat3 uRotZ = mat3(cos(uRotate.z), sin(uRotate.z), 0, -sin(uRotate.z), cos(uRotate.z), 0, 0, 0, 1.0);
	
	newPosition *= uRotX * uRotY * uRotZ;
	newPosition += uTranslate;
	
	gl_Position = vec4(newPosition , 1.0);
}
