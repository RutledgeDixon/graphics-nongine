// models.js
// A module containing objects and functions for loading models

const shaderLocation = "Models/shaders/";

const vRegex = /v (?<x>-?\d*.\d*) (?<y>-?\d*.\d*) (?<z>-?\d*.\d*)/g;
const fRegex = /f (?<a>\d+.*) (?<b>\d+.*) (?<c>\d+.*)/g;
const tRegex = /vt (?<s>\d+.*) (?<t>\d+.*)/g;
const vShaderRegex = /vs (?<vShader>[^\s]+.*[^\s]+)\s*/g;
const fShaderRegex = /fs (?<fShader>[^\s]+.*[^\s]+)\s*/g;

// Return a promise of a json file
function loadJSON(fileName){
    return fetch(fileName)
    .then((res) => res.json())
    .then((data) => data)
    .catch((error) => {
        console.error("Could not load file:", error);
    });
}

// Return a promise of a text file
function loadTXT(fileName) {
    return fetch(fileName)
    .then((res) => res.text())
    .then((data) => data)
    .catch((error) => {
        console.error("Could not load file:", error);
    })
}

// Link shaders to objet and associated variables
function setShaders(model, fShaderSource) {
    gl.shaderSource(model.fShader, fShaderSource);
    gl.compileShader(model.fShader);
    if (!gl.getShaderParameter(model.fShader, gl.COMPILE_STATUS)) {
        console.error("Shader failed to load");
        console.log(fShaderSource);
    }
    
    // Create shader program
    
    // Create a new program for model context
    model.program = model.gl.createProgram();

    // Attach model model's shaders to its program
    model.gl.attachShader(model.program, model.vShader);
    model.gl.attachShader(model.program, model.fShader);

    // Link the program to the context
    model.gl.linkProgram(model.program);
    if (!model.gl.getProgramParameter(model.program, gl.LINK_STATUS)) {
        console.error("Could not initialize shaders");
    }

    // Find attribute and variable in shader, give reference index, attach as Javascript attribute to program variable
    model.program.aVertexPosition = gl.getAttribLocation(model.program, 'aVertexPosition');
    model.program.vTexCoord = gl.getAttribLocation(model.program, 'vTexCoord');
    model.program.uTime = gl.getUniformLocation(model.program, 'uTime');
    model.program.uTranslate = gl.getUniformLocation(model.program, "uTranslate");
    model.program.uScale = gl.getUniformLocation(model.program, "uScale");
    model.program.uRotate = gl.getUniformLocation(model.program, "uRotate");
    model.program.uTint = gl.getUniformLocation(model.program, "uTint");
    model.program.uTexture = gl.getUniformLocation(model.program, "uTexture");
    model.uTexture = gl.getUniformLocation(model.program, "uTexture");

    // Create buffers
    
    // Init Buffers
    model.vao = model.gl.createVertexArray();
    
    // Set vao to be the vertex array
    model.gl.bindVertexArray(model.vao);

    // Create, set, and assign to vertex buffer
    const vertexBuffer = model.gl.createBuffer();
    model.gl.bindBuffer(model.gl.ARRAY_BUFFER, vertexBuffer);
    model.gl.bufferData(model.gl.ARRAY_BUFFER, new Float32Array(model.vertices), model.gl.STATIC_DRAW);
    
    // Send vertex point array to aVertexPosition attributes
    model.gl.enableVertexAttribArray(model.program.aVertexPosition);
    model.gl.vertexAttribPointer(model.program.aVertexPosition, 3, model.gl.FLOAT, false, 0, 0);
    
    // Create set and assign to index buffer
    model.indexBuffer = model.gl.createBuffer();
    model.gl.bindBuffer(model.gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    model.gl.bufferData(model.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), model.gl.DYNAMIC_DRAW);
    
    // Create set and assign to texture buffer
    model.textureBuffer = model.gl.createBuffer();
    model.gl.bindBuffer(model.gl.ARRAY_BUFFER, model.textureBuffer);
    model.gl.bufferData(model.gl.ARRAY_BUFFER, new Float32Array(model.texCoords), model.gl.STATIC_DRAW);
    
    // Send texture coordinate array to vTexCoordPointer
    model.gl.enableVertexAttribArray(model.program.vTexCoord);
    model.gl.vertexAttribPointer(model.program.vTexCoord, 2, model.gl.FLOAT, false, 0, 0);

    // Unbind buffers/arrays
    model.gl.bindVertexArray(null);
    model.gl.bindBuffer(model.gl.ARRAY_BUFFER, null);
    model.gl.bindBuffer(model.gl.ELEMENT_ARRAY_BUFFER, null);
}

// Compile shader code
function loadShaders (model, vShaderFile, fShaderFile) {
    model.vShader = gl.createShader(gl.VERTEX_SHADER);
    loadTXT(shaderLocation+vShaderFile).then((vShaderSource) => {
        gl.shaderSource(model.vShader, vShaderSource);
        gl.compileShader(model.vShader);
        if (!gl.getShaderParameter(model.vShader, gl.COMPILE_STATUS)) {
            console.error("Shader failed to load");
            console.log(vShaderSource);
        }

        model.fShader = gl.createShader(gl.FRAGMENT_SHADER);
        loadTXT(shaderLocation+fShaderFile).then((fShaderSource) => {
            setShaders(model, fShaderSource);

            model.loaded = true;
        });
    });
}

// Load vertices and indices from OBJ file
function loadTrianglesOBJ (model, file) {
    // Parse vertices
    model.vertices = [];
    for (const i of file.matchAll(vRegex)) {
        model.vertices.push(parseFloat(i.groups.x));
        model.vertices.push(parseFloat(i.groups.y));
        model.vertices.push(parseFloat(i.groups.z));
    }

    // Parse texture coordinates from file
    let objTextureCoords = [];
    for (const i of file.matchAll(tRegex)) {
        objTextureCoords.push(parseFloat(i.groups.s));
        objTextureCoords.push(parseFloat(i.groups.t));
    }

    // Initialize arrays
    model.indices = [];
    let vertexCount = model.vertices.length / 3;
    
    // Create texture coordinate array that matches vertex array size
    model.texCoords = new Array(vertexCount * 2).fill(0.0);
    
    // Parse faces and build proper texture coordinate mapping
    for (const i of file.matchAll(fRegex)) {
        // Parse face format: vertex/texture/normal
        let aParts = i.groups.a.split('/');
        let bParts = i.groups.b.split('/');
        let cParts = i.groups.c.split('/');
        
        // Vertex indices (1-indexed in OBJ, convert to 0-indexed)
        let aVertIndex = parseInt(aParts[0]) - 1;
        let bVertIndex = parseInt(bParts[0]) - 1;
        let cVertIndex = parseInt(cParts[0]) - 1;
        
        model.indices.push(aVertIndex);
        model.indices.push(bVertIndex);
        model.indices.push(cVertIndex);
        
        // Map texture coordinates to vertices
        if (aParts.length > 1 && aParts[1] !== '' && objTextureCoords.length > 0) {
            let aTexIndex = parseInt(aParts[1]) - 1;
            let bTexIndex = parseInt(bParts[1]) - 1;
            let cTexIndex = parseInt(cParts[1]) - 1;
            
            // Assign texture coordinates to the correct vertex positions
            model.texCoords[aVertIndex * 2] = objTextureCoords[aTexIndex * 2];
            model.texCoords[aVertIndex * 2 + 1] = objTextureCoords[aTexIndex * 2 + 1];
            model.texCoords[bVertIndex * 2] = objTextureCoords[bTexIndex * 2];
            model.texCoords[bVertIndex * 2 + 1] = objTextureCoords[bTexIndex * 2 + 1];
            model.texCoords[cVertIndex * 2] = objTextureCoords[cTexIndex * 2];
            model.texCoords[cVertIndex * 2 + 1] = objTextureCoords[cTexIndex * 2 + 1];
        }
    }

    model.mode = gl.TRIANGLES;
}

/* Obsolete
// Return shader file names
function getShadersOBJ(file) {
    let vShaderFile = vShaderRegex.exec(file);
    if (vShaderFile != null) {
        vShaderFile = vShaderFile[1];
    } else {
        vShaderFile = "default.vs";
    }
    let fShaderFile = fShaderRegex.exec(file);
    if (fShaderFile != null) {
        fShaderFile = fShaderFile[1];
    } else {
        fShaderFile = "default.fs";
    }
    return [vShaderFile, fShaderFile];
}*/

// 
function loadTrianglesJSON(model, modelInfo) {
    // Set the vertices and indices
    model.vertices = modelInfo.vertices;
    model.indices = modelInfo.indices;
    // Find and set the width and height of the model
    var left = 0, right = 0, up = 0, down = 0;
    for (var vertex = 0; vertex < model.vertices.length; vertex += 3) {
        if (model.vertices[vertex] < left) { left = model.vertices[vertex]; }
        else if (model.vertices[vertex] > right) { right = model.vertices[vertex]; }
        if (model.vertices[vertex] < up) { up = model.vertices[vertex]; }
        else if (model.vertices[vertex] > down) { down = model.vertices[vertex]; }
    }
    model.width = right - left;
    model.height = down - up;
    
    // Set the mode
    switch(modelInfo.mode.toUpperCase()) {
        case "TRIANGLES":
            model.mode = gl.TRIANGLES;
            break;
        case "LINES":
            model.mode = gl.LINES;
            break;
        case "POINTS":
            model.mode = gl.POINTS;
            break;
        case "LINE_LOOP":
            model.mode = gl.LINE_LOOP;
            break;
        case "LINE_STRIP":
            model.mode = gl.LINE_STRIP;
            break;
        case "TRIANGLE_STRIP":
            model.mode = gl.TRIANGLE_STRIP;
            break;
        case "TRIANGLE_FAN":
            model.mode = gl.TRIANGLE_FAN;
            break;
        default:
            model.mode = gl.TRIANGLES;
            break;
    }
}

function parseModelFile (file) {
    let objectFile = /object (.*\.(json|obj))/.exec(file);
    if (objectFile != null) {
        objectFile = objectFile[1];
    } else {
        objectFile = "default.obj"
    }
    let textureFile = /texture (.*\.(png|jpg))/.exec(file);
    if (textureFile != null) {
        textureFile = textureFile[1];
    } else {
        textureFile = "Models/xor.jpeg"
    }
    let vShaderFile = /vShader (.*\.vs)/.exec(file);
    if (vShaderFile != null) {
        vShaderFile = vShaderFile[1];
    } else {
        vShaderFile = "default.vs"
    }
    let fShaderFile = /fShader (.*\.fs)/.exec(file);
    if (fShaderFile != null) {
        fShaderFile = fShaderFile[1];
    } else {
        fShaderFile = "default.fs"
    }
    console.log(objectFile, textureFile, vShaderFile, fShaderFile);

    return [objectFile, textureFile, vShaderFile, fShaderFile];
}


// Model with all properties requried to render separately from other models
class Model {
	width = 0.0;
	height = 0.0;
    constructor(filename, gl) {
        // Link to GL context
        this.gl = gl;
        this.loaded = false;
        loadTXT(filename).then((file) => {
            let [objectFile, textureFile, vShaderFile, fShaderFile] = parseModelFile(file);
            console.log(objectFile, textureFile, vShaderFile, fShaderFile);

            // Create a new nexture for this model
            this.texture = this.gl.createTexture();
            
            var image = new Image();
            image.src = textureFile;

            image.onload = () => {
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            };

            // Load from OBJ file, set loaded when done
            if (/.+\.obj$/.test(objectFile)) {
                loadTXT(objectFile).then((file) => {
                    loadTrianglesOBJ(this, file);
                    // Set the shader
                    loadShaders(this, vShaderFile, fShaderFile);
                });
            // Load from JSON file
            } else if (/.+\.json$/.test(objectFile)) {
                loadJSON(objectFile).then((modelInfo) => {
                    loadTrianglesJSON(this, modelInfo);
                    loadShaders(this, vShaderFile, fShaderFile);
                });
            }
        })

        
    }
}

// Object which can transform its model
class Object {
    constructor (model, translate = [0.0, 0.0, 0.0], scale = [1.0, 1.0, 1.0], rotate = [0.0, 0.0, 0.0], tint = [0.5, 0.5, 0.5], velocity = [0.0, 0.0, 0.0]) {
        this.model = model;
        this.translate = translate;
        this.scale = scale;
        this.rotate = rotate;
        this.tint = tint;
		this.velocity = velocity;
    }
}

