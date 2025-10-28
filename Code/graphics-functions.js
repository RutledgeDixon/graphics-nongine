//returns two textures configured and ready to use
export function configureTexture(gl) {
    let texture1 = gl.createTexture();       
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    let texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return [texture1, texture2];
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