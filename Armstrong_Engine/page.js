// Set the canvas size based on the window size
// THIS METHOD IS UNUSED
function resizeCanvas() {
    if (canvas_holder == null){
        canvas.height = window.innerHeight - 25;
        canvas.width = window.innerWidth - 25;
    } else {
        var minSide = Math.min(canvas_holder.offsetHeight, canvas_holder.offsetWidth)/2;
        canvas.height = minSide;
        canvas.width = minSide;
    }
}
