// Complimentary Color
// Mouse position changes base hue value. Two squares show complementary colors (base, base + 180).
// extended from Rune Madsen's Color Scheme Complimentary Example :https://printingcode.runemadsen.com/examples/color/scheme_complementary/index.html

let innerRadius = 100; // hole size
let outerRadius = 200; // hole size

let steps = 360/15; // resolution

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  background(100);
  drawRing();

  //let baseHue = map(mouseX, 0, width, 0, 360);
  let dx = mouseX - width / 2;
  let dy = mouseY - height / 2;
  let mouseAngle = atan2(dy, dx);
  let baseHue = degrees(mouseAngle); 
  if (baseHue < 0) baseHue += 360; // keep hue in 0–360 range

  let squareWidth = width/2;

  // Square 1: base hue
  fill((baseHue + 0) % 360, 100, 100);
  rect(0, 0, squareWidth, height/4);
  drawColorPosition(baseHue);

  // Square 2: base + 30
  fill((baseHue + 180) % 360, 100, 100);
  rect(squareWidth, 0, squareWidth, height/4);
  drawColorPosition(baseHue + 180);

  // Instruction text
  fill(0); // black text
  textAlign(LEFT, BOTTOM);
  textSize(16);
  text("Hover over or around the ring to change color and the dots will follow your mouse in a circular motion", 20, height - 20);
  
}


function drawColorPosition(hue){
  push();
  translate(width / 2, height / 2); 
  let x1 = cos(radians(hue)) * (innerRadius+(outerRadius-innerRadius)/2);
  let y1 = sin(radians(hue)) * (innerRadius+(outerRadius-innerRadius)/2);
  fill(0);
  ellipse(x1, y1, 20,20);
  pop();
}

function drawRing(){
  push();
  translate(width / 2, height / 2); // center of canvas

  

  for (let angle = 0; angle < 360; angle+=steps) {
    let nextAngle = angle + steps;

    // Outer edge points
    let x1 = cos(radians(angle)) * outerRadius;
    let y1 = sin(radians(angle)) * outerRadius;
    let x2 = cos(radians(nextAngle)) * outerRadius;
    let y2 = sin(radians(nextAngle)) * outerRadius;

    // Inner edge points
    let x3 = cos(radians(nextAngle)) * innerRadius;
    let y3 = sin(radians(nextAngle)) * innerRadius;
    let x4 = cos(radians(angle)) * innerRadius;
    let y4 = sin(radians(angle)) * innerRadius;

    fill(angle, 100, 100);
    quad(x1, y1, x2, y2, x3, y3, x4, y4);
   
  }
  pop();

}