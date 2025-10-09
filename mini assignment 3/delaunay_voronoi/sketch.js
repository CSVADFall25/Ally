let points = [];
let velocities = [];
let delaunay, voronoi;
let showVoronoi = true;
let showDelaunay = false;
let img;
let input;

/*
Modified the original Voronoi sketch to allow image upload and color each cell based on
the pixel color that the point is on. View the note in the draw function for more context.
*/

const NUM_POINTS = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);

  createP("Upload an image to use as background:").position(10, 10).style('color', 'white');
  input = createFileInput(handleFile);
  input.position(10, 50);

  // Initialize random points and velocities
  for (let i = 0; i < NUM_POINTS; i++) {
    points.push([random(width), random(height)]);
    velocities.push([random(-2, 2), random(-2, 2)]);
  }

  updateTriangulation();
}

function draw() {
  // Background or uploaded image
  if (img) image(img, 0, 0, width, height);
  else background(0);

  movePoints();
  updateTriangulation();

  /*
  NOTE:
  The Voronoi color fill lags a bit behind the points as they move.
  There’s a delay between the new point positions being set and 
  the new diagram being drawn from how the Delaunay/Voronoi structure 
  is recalculated every frame. Additionlly img.get() is not instantaneous 
  so that also adds to the delay. I tried to do some workarounds but they
  ultimately did not improve the performance, so I am keeping this version.
  */

  if (img && showVoronoi) {
    noStroke();
    for (let i = 0; i < points.length; i++) {
      let [x, y] = points[i];
      let c = img.get(int(x), int(y));
      fill(red(c), green(c), blue(c), 150); 
      //fill(red(c), green(c), blue(c)); //use this if you want it opaque 
      let cell = voronoi.cellPolygon(i);
      if (cell) {
        beginShape();
        for (let [vx, vy] of cell) vertex(vx, vy);
        endShape(CLOSE);
      }
    }
  }

  // Draw Voronoi
  if (showVoronoi) {
    stroke(0, 255, 0, 180);
    noFill();
    for (let cell of voronoi.cellPolygons()) {
      beginShape();
      for (let [x, y] of cell) vertex(x, y);
      endShape(CLOSE);
    }
  }

  // Draw Delaunay
  if (showDelaunay) {
    stroke(255, 150);
    strokeWeight(1);
    noFill();
    for (let tri of delaunay.trianglePolygons()) {
      beginShape();
      for (let [x, y] of tri) vertex(x, y);
      endShape(CLOSE);
    }
  }

  // Draw points
  noStroke();
  fill(255, 100, 100);
  for (let [x, y] of points) {
    circle(x, y, 8);
  }

  drawInstructions();
}


function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      // Scale image to fit canvas while preserving aspect ratio
      let scale = min(width / img.width, height / img.height);
      w = img.width * scale;
      h = img.height * scale;
      x = (width - w) / 2;
      y = (height - h) / 2;
    });
  } else {
    img = null;
  }
}

function movePoints() {
  for (let i = 0; i < points.length; i++) {
    points[i][0] += velocities[i][0];
    points[i][1] += velocities[i][1];

    // bounce off edges
    if (points[i][0] <= 0 || points[i][0] >= width) velocities[i][0] *= -1;
    if (points[i][1] <= 0 || points[i][1] >= height) velocities[i][1] *= -1;
  }
}

function keyPressed() {
  if (key === 'V' || key === 'v') showVoronoi = !showVoronoi;
  if (key === 'D' || key === 'd') showDelaunay = !showDelaunay;
}

function updateTriangulation() {
  if (points.length < 3) return;
  delaunay = d3.Delaunay.from(points);
  voronoi = delaunay.voronoi([0, 0, width, height]);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (img) img.resize(width, height);
}

function drawInstructions() {
  noStroke();
  fill(255);
  textSize(14);
  text('V: Toggle Voronoi | D: Toggle Delaunay', 10, height - 10);
}
