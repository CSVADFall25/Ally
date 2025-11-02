/*
  This program visualizes Apple Health sleep data as a dynamic particle system.
  Each particle represents one sleep segment from rows 2000–3000 of the CSV file.
  You can change which rows the particles are generated from.

  Color corresponds to the Sleep stage:
    Deep  = Blue
    Core  = Purple
    REM   = Magenta
    Awake = Yellow
    In Bed = Green

  Size corresponds to the sleep duration (larger = longer sleep)
  Speed corresponds inversely to the duration (shorter sleep = faster movement)
  
  Hover over a particle to see its start time, end time, duration, and category.
  You can use the pause and resume buttons to stop or continue the animation so you can look at
  the particles better.
*/



let table;
let sleepStart = [];
let sleepEnd = [];
let sleepDuration = [];
let sleepCategory = [];
let particles = [];
let tooltipGraphics;
let isPaused = false;

function preload() {
  table = loadTable('./apple_health_sleep.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  tooltipGraphics = createGraphics(windowWidth, windowHeight);
  colorMode(HSB);
  noStroke();

  let pauseBtn = createButton('⏸ Pause');
  pauseBtn.position(20, 20);
  pauseBtn.mousePressed(() => (isPaused = true));
  let resumeBtn = createButton('▶ Resume');
  resumeBtn.position(100, 20);
  resumeBtn.mousePressed(() => (isPaused = false));
  let totalRows = table.getRowCount();
  let startIndex = constrain(2000, 0, totalRows);
  let endIndex = constrain(3000, 0, totalRows);

  for (let r = startIndex; r < endIndex; r++) {
    let start = table.getString(r, 'start');
    let end = table.getString(r, 'end');
    let duration = float(table.getString(r, 'duration_hrs'));
    let category = table.getString(r, 'category');

    if (!duration || duration <= 0) continue;

    sleepStart.push(start);
    sleepEnd.push(end);
    sleepDuration.push(duration);
    sleepCategory.push(category);

    let hue = getHueForCategory(category);
    let radius = map(duration, 0, 10, 3, 20);
    let speed = map(duration, 0, 10, 1, 0.3);

    particles.push(new SleepParticle(radius, hue, speed));
  }

}

function draw() {
  background(10, 50, 10);

  if (!isPaused) {
    for (let p of particles) {
      p.update();
    }
  }

  for (let p of particles) {
    p.display();
  }

  drawTooltip();
}

class SleepParticle {
  constructor(r, hue, speed) {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(speed);
    this.r = r;
    this.hue = hue;
  }

  update() {
    this.pos.add(this.vel);
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
  }

  display() {
    fill(this.hue, 180, 255, 0.7);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }

  mouseOver(mx, my) {
    return dist(mx, my, this.pos.x, this.pos.y) < this.r;
  }
}

function drawTooltip() {
  tooltipGraphics.clear();

  for (let i = 0; i < particles.length; i++) {
    if (particles[i].mouseOver(mouseX, mouseY)) {
      let lines = [
        `Start: ${sleepStart[i]}`,
        `End: ${sleepEnd[i]}`,
        `Duration: ${nf(sleepDuration[i], 1, 2)} hrs`,
        `Category: ${sleepCategory[i]}`
      ];

      let padding = 8;
      tooltipGraphics.fill(0, 180);
      let boxW = 280, boxH = 90;
      let tipX = constrain(mouseX + 12, 0, width - boxW);
      let tipY = constrain(mouseY - boxH, 0, height - boxH);
      tooltipGraphics.rect(tipX, tipY, boxW, boxH, 6);

      tooltipGraphics.fill(255);
      tooltipGraphics.textSize(12);
      for (let j = 0; j < lines.length; j++) {
        tooltipGraphics.text(lines[j], tipX + padding, tipY + 20 + j * 14);
      }
    }
  }

  image(tooltipGraphics, 0, 0);
}

function getHueForCategory(category) {
  if (!category) return 0;
  let cat = category.toLowerCase().trim();
  if (cat.includes('deep')) return 200;   // blue
  if (cat.includes('core')) return 260;   // purple
  if (cat.includes('rem')) return 320;    // magenta
  if (cat.includes('awake')) return 40;   // yellow
  if (cat.includes('inbed')) return 120;  // green
  return 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  tooltipGraphics = createGraphics(windowWidth, windowHeight);
}
