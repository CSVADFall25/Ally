let table;
let nodes = {};
let edges = [];
let months = [];
let fromDropdown, toDropdown, sourceDropdown;
let centerNode;
let isPaused = false;
let warningMessage = "";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function preload() {
  table = loadTable("../ProcessedData/AllVenmo2025_cleaned.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(13);
  noStroke();

  centerNode = new Node("You", width / 2, height / 2);

  for (let r = 0; r < table.getRowCount(); r++) {
    const dateStr = table.getString(r, "Datetime");
    if (!dateStr) continue;
    const parts = dateStr.split("-");
    if (parts.length > 1) {
      const m = int(parts[1]);
      if (!months.includes(m)) months.push(m);
    }
  }
  months.sort((a, b) => a - b);

  const bar = createDiv();
  bar.position(20, 8);
  bar.style("display", "flex");
  bar.style("align-items", "center");
  bar.style("gap", "18px");
  bar.style("z-index", "10");

  const label = createSpan("Filter by Month Range:");
  label.style("color", "#ffffff");
  label.style("font-size", "20px");
  label.parent(bar);

  fromDropdown = createSelect();
  for (let m of months) fromDropdown.option(monthNames[m - 1], m);
  fromDropdown.selected(months[0]);
  fromDropdown.style("min-width", "130px");
  fromDropdown.parent(bar);

  toDropdown = createSelect();
  for (let m of months) toDropdown.option(monthNames[m - 1], m);
  toDropdown.selected(months[months.length - 1]);
  toDropdown.style("min-width", "130px");
  toDropdown.parent(bar);

  const srcLabel = createSpan("Source:");
  srcLabel.style("color", "#ffffff");
  srcLabel.style("font-size", "16px");
  srcLabel.parent(bar);

  sourceDropdown = createSelect();
  sourceDropdown.option("Both");
  sourceDropdown.option("Bank");
  sourceDropdown.option("Venmo Balance");
  sourceDropdown.selected("Both");
  sourceDropdown.style("min-width", "140px");
  sourceDropdown.parent(bar);

  const spacer = createDiv();
  spacer.style("width", "24px");
  spacer.parent(bar);

  let pauseBtn = createButton("⏸ Pause");
  pauseBtn.parent(bar);
  pauseBtn.mousePressed(() => (isPaused = true));

  let resumeBtn = createButton("▶ Resume");
  resumeBtn.parent(bar);
  resumeBtn.mousePressed(() => (isPaused = false));

  // compact, consistent button styling
  pauseBtn.style("font", "11px system-ui");
  pauseBtn.style("padding", "4px 9px");
  pauseBtn.style("border-radius", "5px");
  pauseBtn.style("border", "none");
  pauseBtn.style("background-color", "white");

  resumeBtn.style("font", "11px system-ui");
  resumeBtn.style("padding", "4px 9px");
  resumeBtn.style("border-radius", "5px");
  resumeBtn.style("border", "none");
  resumeBtn.style("background-color", "white");

  fromDropdown.changed(updateGraph);
  toDropdown.changed(updateGraph);
  sourceDropdown.changed(updateGraph);

  updateGraph();
}

function updateGraph() {
  nodes = { You: centerNode };
  edges = [];

  const fromMonth = int(fromDropdown.value());
  const toMonth = int(toDropdown.value());
  const srcChoice = sourceDropdown.value(); // Both | Bank | Venmo Balance

  if (fromMonth > toMonth) {
    warningMessage = "⚠ Invalid month range! Please select a valid range.";
    return;
  } else warningMessage = "";

  const people = {};

  for (let r = 0; r < table.getRowCount(); r++) {
    const dateStr = table.getString(r, "Datetime");
    if (!dateStr) continue;
    const parts = dateStr.split("-");
    if (parts.length < 2) continue;

    const month = int(parts[1]);
    if (month < fromMonth || month > toMonth) continue;

    let from = table.getString(r, "From");
    let to = table.getString(r, "To");

    // normalize self
    if (from === "Ally") from = "You";
    if (to === "Ally") to = "You";

    let involvesBank = false;
    const colCount = table.getColumnCount();
    for (let ci = 0; ci < colCount; ci++) {
      const val = table.getString(r, ci);  
      if (val && String(val).toLowerCase().includes("bank")) {
        involvesBank = true;
        break;
      }
    }
    if (srcChoice === "Bank" && !involvesBank) continue;
    if (srcChoice === "Venmo Balance" && involvesBank) continue;


    const amountStr = table.getString(r, "Amount (total)");
    if (!amountStr) continue;

    const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
    const outgoing = amount < 0;
    const person = outgoing ? to : from;

    if (!person || person.trim() === "" || person === "undefined" || person === "null") continue;
    if (person === "Bank" || person === "You") continue;

    if (!people[person]) people[person] = { incoming: 0, outgoing: 0 };
    if (outgoing) people[person].outgoing += Math.abs(amount);
    else people[person].incoming += Math.abs(amount);
  }

  const minRadius = 250;
  const maxRadius = min(width, height) / 2.3;

  for (let person in people) {
    const angle = random(TWO_PI);
    const r = random(minRadius, maxRadius);
    const x = width / 2 + cos(angle) * r;
    const y = height / 2 + sin(angle) * r;

    const netFlow = people[person].incoming - people[person].outgoing;
    const baseSpeed = 0.8;
    let speed = netFlow > 0
      ? baseSpeed + map(netFlow, 0, 500, 0.1, 0.6)
      : baseSpeed - map(Math.abs(netFlow), 0, 500, 0.2, 0.5);
    if (speed < 0.2) speed = 0.2;

    nodes[person] = new Node(person, x, y, people[person], speed);
    edges.push(new Edge(centerNode, nodes[person]));
  }

  const nodeArray = Object.values(nodes);
  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const n1 = nodeArray[i];
      const n2 = nodeArray[j];
      const d = dist(n1.x, n1.y, n2.x, n2.y);
      const minDist = n1.radius + n2.radius + 20;
      if (d < minDist && n1.name !== "You" && n2.name !== "You") {
        const angle = atan2(n2.y - n1.y, n2.x - n1.x);
        const push = (minDist - d) / 2;
        n1.x -= cos(angle) * push;
        n1.y -= sin(angle) * push;
        n2.x += cos(angle) * push;
        n2.y += sin(angle) * push;
      }
    }
  }
}

function draw() {
  background(20);

  if (warningMessage) {
    fill(255, 100, 100);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(warningMessage, width / 2, height / 2);
    return;
  }

  if (!isPaused) {
    for (let key in nodes) {
      const node = nodes[key];
      if (node.name !== "You" && !node.isHovered()) node.update();
    }
  }

  for (let edge of edges) edge.display();
  for (let key in nodes) nodes[key].display();
  for (let key in nodes) if (nodes[key].isHovered()) nodes[key].showInfo();
}

class Node {
  constructor(name, x, y, stats, speed) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.stats = stats || { incoming: 0, outgoing: 0 };
    this.radius = this.name === "You" ? 35 : 20;
    this.vel = p5.Vector.random2D().mult(speed || 0.5);
  }

  update() {
    this.x += this.vel.x;
    this.y += this.vel.y;
    if (this.x < this.radius || this.x > width - this.radius) this.vel.x *= -1;
    if (this.y < this.radius || this.y > height - this.radius) this.vel.y *= -1;
  }

  display() {
    if (this.name === "You") fill(80, 200, 255);
    else fill(230);
    ellipse(this.x, this.y, this.radius * 2);

    const padding = 6;
    textSize(13);
    const labelWidth = textWidth(this.name) + padding * 2;
    const labelHeight = 18;
    fill(255, 255, 255, 230);
    rect(this.x - labelWidth / 2, this.y - labelHeight / 2, labelWidth, labelHeight, 5);
    fill(0);
    text(this.name, this.x, this.y + 1);
  }

  isHovered() {
    return dist(mouseX, mouseY, this.x, this.y) < this.radius;
  }

  showInfo() {
    fill(255);
    rect(mouseX + 10, mouseY + 10, 180, 70, 6);
    fill(0);
    textAlign(LEFT, TOP);
    text(
      this.name +
        "\nIncoming: $" + this.stats.incoming.toFixed(2) +
        "\nOutgoing: $" + this.stats.outgoing.toFixed(2),
      mouseX + 15,
      mouseY + 15
    );
    textAlign(CENTER, CENTER);
  }
}

class Edge {
  constructor(a, b) { this.a = a; this.b = b; }
  display() {
    strokeWeight(2);
    if (this.b.stats.outgoing > this.b.stats.incoming) stroke(255, 70, 70, 200);
    else if (this.b.stats.incoming > this.b.stats.outgoing) stroke(60, 255, 100, 200);
    else stroke(180);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
    noStroke();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
