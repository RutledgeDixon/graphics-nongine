// Takes gl and a list of images
// Configures the textures from the images
function configureTexture(gl, images) {
    let textures = [];
    images.forEach((image) => {
        let texture = gl.createTexture();       
        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap( gl.TEXTURE_2D );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                        gl.NEAREST_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        textures.push(texture);
    });

    return textures;
}

// Takes in vertices ([[]]) and indices ([])e
// Calculate normals for a triangulated object
export function calculateNormals(vertices, indices) {
    var normals = new Array(vertices.length);
    
    // Initialize all normals to [0, 0, 0]
    for (var i = 0; i < vertices.length; i++) {
        normals[i] = [0, 0, 0];
    }
    
    // Calculate face normals and add to vertex normals
    for (var i = 0; i < indices.length; i += 3) {
        var i1 = indices[i];
        var i2 = indices[i + 1];
        var i3 = indices[i + 2];
        
        var v1 = vertices[i1];
        var v2 = vertices[i2];
        var v3 = vertices[i3];
        
        // Calculate two edges
        var edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        var edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
        
        // Cross product to get face normal
        var normal = [
            edge1[1] * edge2[2] - edge1[2] * edge2[1],
            edge1[2] * edge2[0] - edge1[0] * edge2[2],
            edge1[0] * edge2[1] - edge1[1] * edge2[0]
        ];
        
        // Add face normal to each vertex normal
        normals[i1][0] += normal[0];
        normals[i1][1] += normal[1];
        normals[i1][2] += normal[2];
        
        normals[i2][0] += normal[0];
        normals[i2][1] += normal[1];
        normals[i2][2] += normal[2];
        
        normals[i3][0] += normal[0];
        normals[i3][1] += normal[1];
        normals[i3][2] += normal[2];
    }
    
    // Normalize all vertex normals
    for (var i = 0; i < normals.length; i++) {
        var len = Math.sqrt(normals[i][0] * normals[i][0] + 
                            normals[i][1] * normals[i][1] + 
                            normals[i][2] * normals[i][2]);
        if (len > 0) {
            normals[i][0] /= len;
            normals[i][1] /= len;
            normals[i][2] /= len;
        }
    }
    
    return normals;
}

//take an array of 3d vertices, scale (a float), rotate (degrees, axis), and translate (length, axis)
//scales them, rotates them, translates them, etc. using matrix multiplication
//returns a transformation matrix
export function calculateTransformationMatrix(gl, scale, rotate, translate) {
    var radians = {
        x: rotate.x ? rotate.degrees.x * Math.PI / 180.0 : null,
        y: rotate.y ? rotate.degrees.y * Math.PI / 180.0 : null,
        z: rotate.z ? rotate.degrees.z * Math.PI / 180.0 : null
    };
    var cosTheta = {
        x: radians.x ? Math.cos(radians.x) : 1,
        y: radians.y ? Math.cos(radians.y) : 1,
        z: radians.z ? Math.cos(radians.z) : 1
    };
    var sinTheta = {
        x: radians.x ? Math.sin(radians.x) : 0,
        y: radians.y ? Math.sin(radians.y) : 0,
        z: radians.z ? Math.sin(radians.z) : 0
    };

    var rotateZMatrix = [
        cosTheta.z, -sinTheta.z, 0, 0,
        sinTheta.z, cosTheta.z, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    var rotateYMatrix = [
        cosTheta.y, 0, sinTheta.y, 0,
        0, 1, 0, 0,
        -sinTheta.y, 0, cosTheta.y, 0,
        0, 0, 0, 1
    ];
    var rotateXMatrix = [
        1, 0, 0, 0,
        0, cosTheta.x, -sinTheta.x, 0,
        0, sinTheta.x, cosTheta.x, 0,
        0, 0, 0, 1
    ];
    var scaleMatrix = [
        scale, 0, 0, 0,
        0, scale, 0, 0,
        0, 0, scale, 0,
        0, 0, 0, 1
    ];
    /*EXAMPLE TRANSFORMATION MATRICES
    rotating about z axis
    [ cosθ  -sinθ   0   0 ]
    [ sinθ   cosθ   0   0 ]
    [ 0      0      1   0 ]
    [ 0      0      0   1 ]

    rotating about y axis
    [ cosθ   0   sinθ   0 ]
    [ 0      1    0     0 ]
    [ -sinθ  0   cosθ   0 ]
    [ 0      0    0     1 ]

    rotating about x axis
    [ 1      0      0     0 ]
    [ 0    cosθ   -sinθ   0 ]
    [ 0    sinθ    cosθ   0 ]
    [ 0      0      0     1 ]
    */

    //pass the matrices to the vertex shader
    const rZ = gl.getUniformLocation(program, "u_rotateZMatrix");
    const rY = gl.getUniformLocation(program, "u_rotateYMatrix");
    const rX = gl.getUniformLocation(program, "u_rotateXMatrix");
    const sM = gl.getUniformLocation(program, "u_scaleMatrix");
    gl.uniformMatrix4fv(rZ, false, flatten(rotateZMatrix));
    gl.uniformMatrix4fv(rY, false, flatten(rotateYMatrix));
    gl.uniformMatrix4fv(rX, false, flatten(rotateXMatrix));
    gl.uniformMatrix4fv(sM, false, flatten(scaleMatrix));
}