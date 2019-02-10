`
	    #ifdef GL_ES  
            	precision highp float;  
            #endif  
            varying vec2	  vTex;         // row, column to calculate
            uniform sampler2D usampler;		// left in .r, right in .g 
            uniform int		  uLength;      // r1xc1.r2xc2 => product has r2 (or c1) terms
            uniform float	  uStepS;       // increment across source texture
            uniform float	  uStepT;       // increment down source texture
            uniform float	  uOutRows;     // size of output in rows
            uniform float	  uOutCols;     // size of output in columns
            // sum row r x col c 
            float sumrowcol(float row, float col) {  
            	float sum = 0.;             // sum  
            	float ss = 0.;              // column on source texture  
            	float tt = 0.;              // row on source texture  
            	float r = row*uStepT;       // moving texture coordinate  
            	float c = col*uStepS;       // moving texture coordinate  
            	for (int pos=0 ; pos<2048 ; ++pos) { 
            		if(pos>=uLength) break; // stop when we multiple a row by a column  
            			float m1 = texture2D(usampler,vec2(ss,r)).r;  
            			float m2 = texture2D(usampler,vec2(c,tt)).g;  
            			sum += (m1*m2);  
            			ss += uStepS;  
            			tt += uStepT;  
            		}  
            		return sum;  
            	}  
            	  
            	void main(void) {  
            		  
            		// get the implied row and column from .s and .t of passed texel  
            		float col = floor((vTex.s*uOutRows));  
            		float row = floor((vTex.t*uOutCols));

            		// sum row x col for the passed pixel  
            		float v = sumrowcol(row,col);  
             
            		// Render to IEEE 754 Floating Point
            		if (v==0.) {  
            			gl_FragColor = vec4(0.,0.,0.,0.);  
            			return;  
            		}  
            		float a = abs(v);   
            		gl_FragColor = vec3(v,0.,0.);
            	} ;
        return fragmentShader;
`
