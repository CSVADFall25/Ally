let freeDrawLayer;
let paintByNumLayer;
let baseImage = null;
let fileInput = null;
let uploadLabel = null;

let showColors = false;
let erasing = false;
let brushSizeSlider;
let revealButton, eraseButton, clearButton;
let colorButtons = [];
let selectedColor;
let prevX, prevY;

const rows = 8;
const cols = 10;

let currentMode = "freeDraw"; 
let originalPositions = []; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  freeDrawLayer = createGraphics(windowWidth, windowHeight);
  freeDrawLayer.colorMode(HSB, 360, 100, 100);
  freeDrawLayer.background(255);
  paintByNumLayer = createGraphics(windowWidth, windowHeight);
  paintByNumLayer.colorMode(HSB, 360, 100, 100);
  paintByNumLayer.background(255);
  setupSidebar();
  setupModeTabs();
  selectedColor = color(0, 100, 100);
}

function setupSidebar() {
  let startX = 20;
  let startY = 40;
  let btnSize = 25;
  let gap = 3;

  createP("Blind Palette").style("color", "black").style("font-size", "18px").position(startX, startY);

  // palette grid, 80 colors
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let hueVal = map(c, 0, cols, 0, 360);
      let satVal = map(r, 0, rows - 1, 20, 100);
      let btn = createButton("");
      let x = startX + c * (btnSize + gap);
      let y = startY + 45 + r * (btnSize + gap);
      btn.position(x, y);
      btn.size(btnSize, btnSize);
      btn.mousePressed(() => selectColor(hueVal, satVal));
      btn.style("border", "1px solid #555");
      btn.style("cursor", "pointer");
      btn.style("padding", "0");
      let brightness = map(r, 0, rows - 1, 90, 40);
      btn.style("background", "rgb(" + brightness + "%, " + brightness + "%, " + brightness + "%)");
      colorButtons.push({ btn, hueVal, satVal });
    }
  }
  // Shuffle / Reset buttons
  const shuffleY = startY + 45 + rows * (btnSize + gap) + 5;

  const shuffleButton = createButton("🔀 Shuffle Colors");
  shuffleButton.position(startX, shuffleY);
  styleButton(shuffleButton, "140px");
  shuffleButton.mousePressed(shufflePalette);

  const resetButton = createButton("🔁 Reset Palette");
  resetButton.position(startX + 160, shuffleY);
  styleButton(resetButton, "130px");
  resetButton.mousePressed(resetPalette);

  // brush size
  createP("Brush size:").style("color", "black").position(startX, shuffleY + 40);
  brushSizeSlider = createSlider(5, 50, 15, 1);
  brushSizeSlider.position(startX, shuffleY + 80);
  brushSizeSlider.style("width", "200px");

  // buttons
  let buttonY = shuffleY + 120;
  eraseButton = createButton("🧽 Erase");
  eraseButton.position(startX, buttonY);
  eraseButton.mousePressed(toggleErase);
  styleButton(eraseButton, "90px");

  clearButton = createButton("🧹 Clear");
  clearButton.position(startX + 100, buttonY);
  clearButton.mousePressed(clearCanvas);
  styleButton(clearButton, "90px");

  revealButton = createButton("🎨 Reveal");
  revealButton.position(startX + 200, buttonY);
  revealButton.mousePressed(toggleReveal);
  styleButton(revealButton, "100px");
}

function setupModeTabs() {
  const startX = 20;
  const baseY = 600;

  createP("Mode").style("color", "black").style("font-size", "18px").style("font-weight", "bold").position(startX, baseY - 40);

  const freeBtn = createButton("Free Draw");
  freeBtn.position(startX, baseY);
  styleButton(freeBtn, "120px");
  freeBtn.mousePressed(() => switchMode("freeDraw"));

  const paintBtn = createButton("Paint by Numbers");
  paintBtn.position(startX + 140, baseY);
  styleButton(paintBtn, "150px");
  paintBtn.mousePressed(() => switchMode("paintByNumbers"));

  uploadLabel = createP("Upload an image to paint over before drawing:").style("color", "black").position(startX, 470).hide();

  fileInput = createFileInput(handleUpload);
  fileInput.position(startX, 505);
  fileInput.hide();
}

function draw() {
  background(255);
  const protectedWidth = 15 + cols * 28 + 40;

  stroke(80);
  strokeWeight(1);
  line(protectedWidth, 0, protectedWidth, height);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(protectedWidth + 1, 0, width - protectedWidth - 1, height);
  drawingContext.clip();

  if (currentMode === "paintByNumbers") {
    if (baseImage) {
      image(baseImage, protectedWidth + 1, 0, width - protectedWidth - 1, height);
    } else {
      fill(120);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(20);
      text("Upload an image before painting →", protectedWidth + (width - protectedWidth) / 2, height / 2);
    }
    if (showColors) image(paintByNumLayer, 0, 0);
    else {
      let gray = paintByNumLayer.get();
      gray.filter(GRAY);
      image(gray, 0, 0);
    }
  }

  if (currentMode === "freeDraw") {
    if (showColors) image(freeDrawLayer, 0, 0);
    else {
      let gray = freeDrawLayer.get();
      gray.filter(GRAY);
      image(gray, 0, 0);
    }
  }

  drawingContext.restore();
}

function mousePressed() {
  prevX = mouseX;
  prevY = mouseY;
}

function mouseDragged() {
  const protectedWidth = 20 + cols * 28 + 40;
  if (mouseX <= protectedWidth) return;

  const w = brushSizeSlider.value();
  let targetLayer;
  if (currentMode === "paintByNumbers") {
    targetLayer = paintByNumLayer;
  } else {
    targetLayer = freeDrawLayer;
  }

  if (currentMode === "paintByNumbers" && !baseImage) return;

  targetLayer.strokeWeight(w);
  if (erasing) {
    targetLayer.erase(255, 255);
    targetLayer.line(prevX, prevY, mouseX, mouseY);
    targetLayer.noErase();
  } else {
    targetLayer.noErase();
    targetLayer.stroke(selectedColor);
    targetLayer.line(prevX, prevY, mouseX, mouseY);
  }

  prevX = mouseX;
  prevY = mouseY;
}

function mouseReleased() {
  prevX = null;
  prevY = null;
}

function shufflePalette() {
  if (originalPositions.length === 0) {
    originalPositions = colorButtons.map((c, i) => ({
      btn: c.btn,
      hueVal: c.hueVal,
      satVal: c.satVal,
      index: i
    }));
  }
  for (let i = colorButtons.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [colorButtons[i], colorButtons[j]] = [colorButtons[j], colorButtons[i]];
  }
  repositionPalette();
}

function resetPalette() {
  if (originalPositions.length === 0) return;
  colorButtons = [...originalPositions];
  repositionPalette();
  originalPositions = [];
}

function repositionPalette() {
  let startX = 20;
  let startY = 40;
  let btnSize = 25;
  let gap = 3;
  colorButtons.forEach((c, i) => {
    let r = floor(i / cols);
    let col = i % cols;
    let x = startX + col * (btnSize + gap);
    let y = startY + 45 + r * (btnSize + gap);
    c.btn.position(x, y);
  });
}

function switchMode(mode) {
  currentMode = mode;
  if (mode === "paintByNumbers") {
    uploadLabel.show();
    fileInput.show();
  } else {
    uploadLabel.hide();
    fileInput.hide();
  }
}

function selectColor(hueVal, satVal) {
  selectedColor = color(hueVal, satVal, 100);
  erasing = false;
  eraseButton.html("🧽 Erase");
  highlightSelected(event.target);
}

function highlightSelected(element) {
  for (let c of colorButtons) c.btn.style("border", "1px solid #555");
  element.style.border = "2px solid white";
}

function toggleErase() {
  erasing = !erasing;
  if (erasing) {
    eraseButton.html("🧽 Erasing");
  } else {
    eraseButton.html("🧽 Erase");
  }
}

function toggleReveal() {
  showColors = !showColors;
  if (showColors) {
    revealButton.html("🫣 Hide");
  } else {
    revealButton.html("🎨 Reveal");
  }

  for (let c of colorButtons) {
    if (showColors) {
      c.btn.style("background", color(c.hueVal, c.satVal, 100));
    } else {
      let brightness = map(c.satVal, 20, 100, 90, 40);
      c.btn.style("background", `rgb(${brightness}%, ${brightness}%, ${brightness}%)`);
    }
  }
}

function clearCanvas() {
  if (currentMode === "paintByNumbers") {
    paintByNumLayer.clear();
    paintByNumLayer.background(255, 255, 255, 0);
  } else {
    freeDrawLayer.clear();
    freeDrawLayer.background(255, 255, 255, 0);
  }
}

function handleUpload(file) {
  if (file.type === "image") {
    loadImage(file.data, (img) => {
      const protectedWidth = 15 + cols * 28 + 40;
      const availableW = width - protectedWidth - 20;
      const scale = min(availableW / img.width, height / img.height);
      const newW = img.width * scale;
      const newH = img.height * scale;

      baseImage = createGraphics(newW, newH);
      baseImage.image(img, 0, 0, newW, newH);

      paintByNumLayer.clear();
      paintByNumLayer.background(255, 255, 255, 0);
    });
  } else {
    baseImage = null;
  }
}

function styleButton(btn, width = "100px") {
  btn.style("background", "#111");
  btn.style("color", "#fff");
  btn.style("border", "1px solid #444");
  btn.style("padding", "6px 10px");
  btn.style("border-radius", "6px");
  btn.style("cursor", "pointer");
  btn.style("width", width);
  btn.style("font-size", "14px");
  btn.style("margin-right", "4px");
}
