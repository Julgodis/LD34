precision mediump float;

uniform sampler2D sampler;
uniform sampler2D sampler1;

uniform vec2 size;

varying vec4 outColor;
varying highp vec2 outTexture;
varying vec3 outPosition;
varying float outRotation;
varying mediump float outFlip;

void main(void) 
{
	vec4 DiffuseColor = texture2D(sampler, outTexture);
	gl_FragColor = outColor * vec4(DiffuseColor.rgb, DiffuseColor.a);
}

