// Hello World Portrait
// created by Jennifer Jacobs September 26 2019. Inspired by Casey Reas' and Ben Fry's draw a face assignment.
// Converted to p5.js

function setup() {
  // set the size of the canvas to 600 x 600 pixels
  createCanvas(600, 600);

  // set the background color to black
  background("white");

  ellipseMode(CENTER);
  fill(255, 255, 0);
  ellipse(width/2, height/2, 300, 300);

  fill(0,0,0);
  rect(width / 2 - 90, height / 2 - 90, 50, 10);
  rect(width / 2 + 40, height / 2 - 90, 50, 10);

  fill(0, 0, 0);
  ellipse(width/2 - 60, height/2 - 50, 20, 20);
  ellipse(width/2 + 60, height/2 - 50, 20, 20);

  ellipseMode(CENTER);
  ellipse(width / 2, height / 2, 50, 40);

  ellipseMode(CENTER);
  fill(0, 0, 0);
  ellipse(width / 2, height / 2 + 80, 100, 70);

  ellipseMode(CENTER);
  fill(255, 0, 0);
  ellipse(width / 2, height / 2 + 95, 55, 45);

}