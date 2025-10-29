/*
 * File: ArmstrongDixonTO.js
 * Author: Sam Armstrong, Rutledge Dixon
 * Course: COSC4103 - Computer Graphics
 * Assignment: Textured Object
 * Due Date: October 29, 2025
 * 
 * Adding texturing to our teams' objects.
 */

'use strict';

// List of all objects' associated json files
var jsons = ["Models/Jeff.obj", "Models/monkey.obj", "Models/CG.obj"];

let canvas,
    //canvas_holder,
    gl,
    startTime,
    objects,
    time,
    f_mouseX,
    f_mouseY;

var b_mouseDragging = false;
var a_startMouse = [0.0, 0.0];
var a_startTranslate = [];
var f_startTranslateX = 0, f_startTranslateY = 0;
var b_animate = true;

const DIFFICULTY = 10; // The higher the number the lower the speed could be
const TRIES = 5;


//Pause or unpause the scaling of the objects in the scene: 
function toggleAnimation(){
    var myButton = document.getElementById("button1");
    if(b_animate){
        b_animate = false;
        myButton.innerHTML = "Turn animation ON";
    }
    else{
        b_animate = true;
        myButton.innerHTML = "Turn animation OFF";
    }
}

// Draw all loaded models
function draw() {
    // Reset viewport size/color
    gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
    //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Render all objects
    for(var i of objects) {
        var model = i.model;
        var program = model.program;
		
        // Only run if the shader has loaded (to work with promise structure of fetch)
        if (!model.loaded) { continue; }
		
        // Set this model's program (shaders) for use
        gl.useProgram(program);
		
        // Configure texture
        //configureTextures(gl, i.textureImage);

        // Set uniforms
        if (program.uTime) {
            gl.uniform1f(program.uTime, time);
        }
		
        if (program.uTranslate) {
            gl.uniform3f(program.uTranslate, i.translate[0], i.translate[1], i.translate[2]);
        }

        if (program.uScale) {
            gl.uniform3f(program.uScale, i.scale[0], i.scale[1], i.scale[2]);
        }

        if (program.uRotate) {
            gl.uniform3f(program.uRotate, i.rotate[0], i.rotate[1], i.rotate[2]);
        }
		
        if (program.uTint) {
            gl.uniform3f(program.uTint, i.tint[0], i.tint[1], i.tint[2]);
        }

        // Bind the vertex array
        gl.bindVertexArray(model.vao);
        // Bind the texture array
        gl.bindTexture(gl.TEXTURE_2D, model.texture);
		
        // Draw the model
        gl.drawElements(model.mode, model.indices.length, gl.UNSIGNED_SHORT, 0);
		
        // Clear the gl location for the vertex array
        gl.bindVertexArray(null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

// Run repeatedly
function render() {
    time = (new Date() - startTime)/1000;
	
    // Run looping code
    main();
	
    // Draw frame
    draw();
	
    // Run again
    requestAnimationFrame(render);
}

// Set web page, load objects, start rendering
async function init() {
    // Get canvas
    canvas = document.getElementById( "webgl_canvas" );

    canvas.width = window.innerHeight;
    canvas.height = window.innerHeight;

    // Get gl context:
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("Could not get WebGL context");
        return;
    }
    
    // Set canvas clear color & height:
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.viewport( 0, 0, canvas.width, canvas.height );

    console.log("Canvas size:", canvas.width, canvas.height);

    // Make the canvas have responsive resize:
    window.addEventListener("resize", () => {
        canvas.width = window.innerHeight;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        console.log("Resized to:", window.innerWidth, window.innerHeight);
    });
    
    // Get the time the page was loaded
    startTime = new Date();

    // Load all objects
    var f_offsetX = -0.6666;
    objects = [];
    for (var i of jsons) {
        objects.push(new Object(new Model(i, gl)));
        
        //f_offsetX makes sure the two objects stay separated:
        objects[objects.length - 1].translate[0] = f_offsetX;
        f_offsetX += 0.6666;
    }

    // Write log of generated objects for troubleshooting
    // console.log(objects);
	
	//At the start of a mouse click, save the starting positon of the objects & mouse coordinates.
	canvas.addEventListener('mousedown', function(event) {
        b_mouseDragging = true;

        //Save the mouse's start position:
        a_startMouse[0] = f_mouseX;
        a_startMouse[1] = f_mouseY;

		for (var o of objects) {
            //Save the object's starting position:
            a_startTranslate.push(o.translate[0]);
            a_startTranslate.push(o.translate[1]);
		}
	});

    //Handling things that happen when the mouse moves:
    canvas.addEventListener('mousemove', function(event) {
        //Get canvas position and size:
        const rect = canvas.getBoundingClientRect();
        //Update x & y coordinates of mouse click on the canvas:
        f_mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        f_mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

        //console.log("Mouse: (" + f_mouseX.toFixed(5) + ", " + f_mouseY.toFixed(5) + ")")
        
        //While the mouse click is held, use the saved starting positions to drag the objects on screen:
        if (b_mouseDragging){   
            
            var int_i = 0;
            for (var o of objects) {
                //Find distance of current mouse position from starting mouse position:
                const dx = f_mouseX - a_startMouse[0];
                const dy = f_mouseY - a_startMouse[1];

                //Apply offset relative to the original position
                o.translate[0] = a_startTranslate[int_i] + dx;
                o.translate[1] = a_startTranslate[int_i + 1] + dy;

                int_i += 2;
            }
        }
    });

    //When nothing is clicked on the mouse, user isn't dragging anything:
    canvas.addEventListener('mouseup', function(event) {
        b_mouseDragging = false;
        a_startTranslate = [];
    });
	
    // Begin rendering
    render(gl, objects, startTime);
}

// Loop for code, has access to WebGL code
function main() {
    /*
        gl is the GL context object
        objects is an array of objects defined by the files specified by the jsons array at the top of this file (in order)
            each object has:
                translate is a 3 element array containing the object's position relative to (0.0, 0.0, 0.0)
                tint is a 3 element array containing the object's color
                model contains the WebGL information for the object
        time is the time since the start of the program
    */
	
    let f_scaleModify = 1 + Math.sin(time) / 1.5;
	for (var o of objects) {
		o.tint[0] = Math.abs(Math.cos(time/10.0));
		o.tint[1] = Math.abs(Math.cos(time/9.0 + 10));
		o.tint[2] = Math.abs(Math.cos(time/8.0 + 20));

        //As time goes by, the scale of the models smoothly grows, then shrinks, then grows again in a cycle.
        if (o.model.loaded && b_animate) {
            o.scale = [f_scaleModify, f_scaleModify, f_scaleModify];
            o.rotate = [0.0, time, 0.0];
        }
	}
    f_scaleModify *= 0.5;
    if (objects[2].model.loaded && b_animate) {
	    objects[2].scale = [f_scaleModify, f_scaleModify, f_scaleModify];
    }
}

window.onload=init;
