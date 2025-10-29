// Rutledge Dixon and Sam Armstrong
// October 28 2025
// Textured Objects
var canvas;
var gl;
var program;

var vPosition;
var vColor;
var vNormal;

var vertexBuffer;
var indexBuffer; 
var colorBuffer;
var normalBuffer;

var scale = 0.25;
var rotate = {degrees: {x: 0, y: 0, z: 0}, x: false, y: false, z: false};
var translate = {x: 0, y: 0, z: 0};

var pastMouseSpot = {x: 0, y: 0};
var toggledMouseSpot = {x: 0, y: 0};

var points = [];
var vertices = [];
var indices = [];
var colors = [];
var normals = [];

var isAnimating = true;
var activeObject = 0;

var object0VertexCount = 0;
var object0StartIndex = 0;

var object1VertexCount = 0;
var object1StartIndex = 0;

var rufflesVertices = [
    [0, 0, 0],
    [0, 1.7, 0],
    [0.4, 1.65, 0],
    [0.7, 1.4, 0],
    [0.7, 1.1, 0],
    [0.36, 0.8, 0],
    [0.7, 0, 0]
];

var rufflesIndices = [
    0, 1, 2,
    0, 2, 3,
    1, 3, 4,
    1, 4, 5,
    0, 5, 6
];

var rufflesObject = {
    vertices: rufflesVertices,
    indices: rufflesIndices,
    color: Array(rufflesVertices.length).fill([0.8, 0.2, 0.2]),
    normals: calculateNormals(rufflesVertices, rufflesIndices),
    scale: 0.25
};

var schmabbyVertices = [
    [0, 1, 0],
    [-1, 1, 0],
    [0, -1, 0],
    [-1, -1, 0],
    [-1.4, 0.4, 0],
    [0, 0.4, 0],
    [-1.4, -0.4, 0],
    [0, -0.4, 0],
    [-1.4, 1, 0],
    [-1, 1.5, 0],
    [0, 1.3, 0],
    [0.3, 1, 0],
    [0, 0.3, 0],
    [-0.2, 0.3, 0],
    [0.2, 0.3, 0],
    [0.1, 0, 0]
];

var schmabbyIndices = [
    0, 1, 2,
    1, 2, 3,
    4, 5, 6,
    6, 5, 7,
    8, 9, 0,
    10, 11, 1,
    0, 12, 11,
    13, 14, 15
];

var schmabbyObject = {
    vertices: schmabbyVertices,
    indices: schmabbyIndices,
    color: Array(schmabbyVertices.length).fill([0.0, 0.59, 0.0]),
    normals: calculateNormals(schmabbyVertices, schmabbyIndices),
    scale: 0.25
};

var cubeVertices = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
];

var cubeIndices = [
    0, 1, 2,
    0, 2, 3,
    4, 5, 6,
    4, 6, 7,
    0, 1, 4,
    1, 4, 5,
    1, 5, 6,
    1, 2, 6,
    2, 3, 7,
    2, 6, 7,
    3, 7, 4,
    3, 0, 4
];

var cubeObject = {
    vertices: cubeVertices,
    indices: cubeIndices,
    color: Array(cubeVertices.length).fill([0.0, 0.0, 0.59]),
    normals: calculateNormals(cubeVertices, cubeIndices),
    scale: 0.25
};

//center the vertices around the origin
schmabbyObject.vertices = centerObject(schmabbyObject.vertices);
rufflesObject.vertices = centerObject(rufflesObject.vertices);
cubeObject.vertices = centerObject(cubeObject.vertices);

//set the two objects
var object0 = rufflesObject
var object1 = cubeObject


function main() {
    //load the canvas and context
    canvas = document.getElementById("webgl");
    var header = document.getElementById("header");

    gl = getWebGLContext(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3, 0.3, 0.3, 1.0);

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    if (!program) { return; }
    gl.useProgram(program);
    gl.program = program;
    vPosition = gl.getAttribLocation(program, "a_Position");
    gl.enableVertexAttribArray(vPosition);
    vColor = gl.getAttribLocation(program, "a_Color");
    gl.enableVertexAttribArray(vColor);
    vNormal = gl.getAttribLocation(program, "a_Normal");
    gl.enableVertexAttribArray(vNormal);

    //set up buffers
    vertexBuffer = gl.createBuffer();
    indexBuffer = gl.createBuffer(); 
    colorBuffer = gl.createBuffer();   
    normalBuffer = gl.createBuffer();

    //define ambient light color
    const ambientColor = [0.5, 0.9, 0.5];
    gl.uniform3f(gl.getUniformLocation(program, "u_Ambient_color"), ambientColor[0], ambientColor[1], ambientColor[2]);

    //define spotlight properties
    const spotlightPosition = [2.0, 2.0, 2.0];
    const spotlightDirection = [-1.0, -1.0, -1.0];
    const spotlightColor = [1.0, 1.0, 1.0];
    const spotlightIntensity = 1.7;
    const spotlightConeAngle = Math.cos(Math.PI / 3); // 60 degrees
    const spotlightCutoffAngle = Math.cos(Math.PI / 2); // 90 degrees

    //set spotlight properties in shaders
    gl.uniform3f(gl.getUniformLocation(program, "u_Spotlight_position"), spotlightPosition[0], spotlightPosition[1], spotlightPosition[2]);
    gl.uniform3f(gl.getUniformLocation(program, "u_Spotlight_direction"), spotlightDirection[0], spotlightDirection[1], spotlightDirection[2]);
    gl.uniform3f(gl.getUniformLocation(program, "u_Spotlight_color"), spotlightColor[0], spotlightColor[1], spotlightColor[2]);
    gl.uniform1f(gl.getUniformLocation(program, "u_Spotlight_intensity"), spotlightIntensity);
    gl.uniform1f(gl.getUniformLocation(program, "u_Spotlight_cone_angle"), spotlightConeAngle);
    gl.uniform1f(gl.getUniformLocation(program, "u_Spotlight_cutoff_angle"), spotlightCutoffAngle);

    animateObjects();
    
    function handleMove(event) {
        //find the mouse x and y 
        //      Get canvas bounding rectangle
        const rect = canvas.getBoundingClientRect();
        //      Mouse position relative to canvas
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        //      Convert to clip space
        let xClip = (x / canvas.width) * 2 - 1;
        let yClip = -((y / canvas.height) * 2 - 1);

        // pass to vertex shader
        const cM = gl.getUniformLocation(program, "u_translate");
        gl.uniform2fv(cM, flatten([xClip, yClip]));

        pastMouseSpot.x = xClip;
        pastMouseSpot.y = yClip;
    }
    function handleKeyPress(event) {
        //pressing spacebear toggles active object
        if (event.code === 'Space') {
            toggleActiveObject();
            console.log("Spacebear pressed");
        }
        //pressing 't' toggles animation
        if (event.code === 'KeyT') {
            toggleAnimation();
        }
    }
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mousemove', handleMove);
}

function animateObjects() {
    points = []; //clear points array
    vertices = [];
    indices = [];
    colors = [];
    normals = [];

    //push objects to points array
    pushObArr(object0, 0);
    pushObArr(object1, object0.vertices.length);
    
    // Bind and buffer vertex data
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    // bind and buffer color data
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    
    // bind and buffer normal data
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    
    // Bind and buffer index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);

    //update transformation data
    rotate.degrees.y += 1;
    rotate.y = true;
    rotate.degrees.x += 0.5;
    rotate.x = true;
    rotate.degrees.z += 2;
    rotate.z = true;

    // Draw objects with separate transformations
    drawObjectsSeparately();

    //re-render if WE WANT TO BRO
    if (isAnimating) {
        requestAnimationFrame(animateObjects);
    }
}

// binds active object to mouse movement, rotates inactive object
function drawObjectsSeparately() {
    //clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //draw both objects separately
    drawOneObject(
        object0, 
        0, 
        object0.scale,
        {degrees: {x: 0, y: 0, z: 0}, x: false, y: false, z: false}, 
        {x: 0, y: 0, z: 0}, 
        true, 
    );
    drawOneObject(
        object1, 
        object0.indices.length * 2, 
        object1.scale, 
        rotate, 
        translate, 
        false, 
    );
}

function drawOneObject(object, offset, scale, rotate, translate, useMouse) {
    calculateTransformationMatrix(scale, rotate, translate);
    gl.uniform2fv(gl.getUniformLocation(program, "u_translate"), useMouse ? [pastMouseSpot.x, pastMouseSpot.y] : [toggledMouseSpot.x, toggledMouseSpot.y]);
    gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, offset);
}


function pushObArr(object, offset) {
    //add the vertices and indices to the arrays
    vertices = vertices ? vertices.concat(object.vertices) : object.vertices;
    indices = indices ? indices.concat(object.indices.map(i => i + offset)) : object.indices.map(i => i + offset);

    //recalculate normals in case the object has been transformed
    let newNormals = calculateNormals(object.vertices, object.indices);

    //push points, colors, and normals to arrays
    for (var i = 0; i < object.vertices.length; i++) {
        points.push(object.vertices[i][0], object.vertices[i][1], object.vertices[i][2]);
        colors.push(object.color[i][0], object.color[i][1], object.color[i][2]);
        normals.push(newNormals[i][0], newNormals[i][1], newNormals[i][2]);
    }
}

function toggleAnimation() {
    isAnimating = !isAnimating;
    console.log("Animation toggled: " + isAnimating);
    if (isAnimating) {
        animateObjects();
    }
}

function toggleActiveObject() {
    //switch object0 and object 1
    var temp = object0;
    object0 = object1;
    object1 = temp;

    //save the mouse spot from being toggled
    toggledMouseSpot.x = pastMouseSpot.x;
    toggledMouseSpot.y = pastMouseSpot.y;

    //slowly reduce the scale when toggled
    //  linear
    // object0.scale -= 0.005;
    // object1.scale -= 0.005;
    //  exponential
    object0.scale *= 0.99;
    object1.scale *= 0.99;
}

function toggleAnimationWithButton() {
    toggleAnimation();
    document.getElementById("loserText").innerText = "You're a loser for using the button";
    alert("You used the button, you loser");
}

//take an array of 3d vertices, scale (a float), rotate (degrees, axis), and translate (length, axis)
//scales them, rotates them, translates them, etc. using matrix multiplication
//returns a transformation matrix
function calculateTransformationMatrix(scale, rotate, translate) {
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

//HELPER FUNCTIONS
// Find the midpoint between two 2D points
// Thank you copilot for fixing this for me
function mid(p1, p2, s) {
    return [
        p1[0] * (1 - s) + p2[0] * s,
        p1[1] * (1 - s) + p2[1] * s
    ];
}
// turn array of pairs into a flat Float32Array for the buffer
function flatten(arr) {
    var flat = [];
    for (var i = 0; i < arr.length; i++) {
        flat.push(arr[i]);
    }
    return new Float32Array(flat);
}
//takes an object, returns the object centered at the origin
function centerObject(object) {
    /* CENTER OBJECT */
    var center = [0, 0, 0];
    for (var i = 0; i < object.length; i++) {
        center[0] += object[i][0];
        center[1] += object[i][1];
        center[2] += object[i][2];
    }
    center[0] /= object.length;
    center[1] /= object.length;
    center[2] /= object.length;

    // Center object around the origin
    var centeredObject = object.map(vertex => [
        vertex[0] - center[0],
        vertex[1] - center[1],
        vertex[2] - center[2]
    ]);

    return centeredObject;
}