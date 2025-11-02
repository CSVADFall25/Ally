/*
  This is my venmo statement visualization for September 2025.
  I modified the csv to remove all sensitive information such as
  my bank details, venmo username, and full names of people 
  since this dataset will be on github

  X-axis respresents the person I had a transaction with
  Y-axis is the total amount
  Red is money I sent, Green is money I recieved
*/

let table;
let names = [];
let sentTotals = {};
let receivedTotals = {};
let tooltipGraphics;

function preload() {
  table = loadTable('VenmoStatement_September_2025.csv', 'csv');
}

function setup() {
  createCanvas(windowWidth, 500);
  tooltipGraphics = createGraphics(windowWidth, 500);
  textFont('Helvetica');
  textSize(12);
  noStroke();

  let headerRowIndex = -1;
  for (let r = 0; r < table.getRowCount(); r++) {
    if (table.getRow(r).arr.includes('ID')) {
      headerRowIndex = r;
      break;
    }
  }

  if (headerRowIndex === -1) {
    print('Header not found.');
    return;
  }

  let headers = table.getRow(headerRowIndex).arr;
  let typeIndex = headers.indexOf('Type');
  let fromIndex = headers.indexOf('From');
  let toIndex = headers.indexOf('To');
  let amountIndex = headers.indexOf('Amount (total)');

  for (let r = headerRowIndex + 1; r < table.getRowCount(); r++) {
    let row = table.getRow(r).arr;

    /*
    I used GenAI to help write this line (53) for parsing my Venmo statement, 
    since the CSV file contained a lot of inconsistent filler text and 
    disclaimers that made it tricky to process.
    */
    if (!row[1] || isNaN(parseFloat(row[1]))) continue;

    let type = row[typeIndex];
    let from = row[fromIndex];
    let to = row[toIndex];
    let amountStr = row[amountIndex];

    if (!amountStr || !type) continue;
    //convert
    let amount = parseFloat(amountStr.replace(/[^0-9.-]/g, ''));

    if (type === 'Payment') {
      if (from && from.includes('Ally') && amount < 0) {
        if (!sentTotals[to]) sentTotals[to] = 0;
        sentTotals[to] += Math.abs(amount);
      }
      else if (to && to.includes('Ally') && amount > 0) {
        if (!receivedTotals[from]) receivedTotals[from] = 0;
        receivedTotals[from] += Math.abs(amount);
      }      
    }
  }

  let allNames = new Set([...Object.keys(sentTotals), ...Object.keys(receivedTotals)]);
  names = Array.from(allNames);
}

function draw() {
  background(245);
  tooltipGraphics.clear();

  if (names.length === 0) {
    textAlign(CENTER, CENTER);
    text('No Venmo data found. Check CSV formatting.', width / 2, height / 2);
    return;
  }

  let barWidth = width / names.length;
  let maxTotal = max(names.map(name => max(sentTotals[name] || 0, receivedTotals[name] || 0)));

  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    let sent = sentTotals[name] || 0;
    let received = receivedTotals[name] || 0;

    let sentH = map(sent, 0, maxTotal, 0, height - 150);
    let receivedH = map(received, 0, maxTotal, 0, height - 150);
    let x = i * barWidth + 5;
    let baseY = height - 50;

    if (received > 0) {
      fill(70, 200, 100);
      rect(x, baseY - receivedH, barWidth / 2 - 5, receivedH, 4);
    }

    if (sent > 0) {
      fill(220, 80, 80);
      rect(x + barWidth / 2, baseY - sentH, barWidth / 2 - 5, sentH, 4);
    }

    push();
    textAlign(CENTER, TOP);
    fill(0);
    text(name.split(' ')[0], x + barWidth / 2 - 2, height - 40);
    pop();

    let overReceived = mouseX > x && mouseX < x + barWidth / 2 - 5 && mouseY > baseY - receivedH && mouseY < baseY;
    let overSent = mouseX > x + barWidth / 2 && mouseX < x + barWidth - 5 && mouseY > baseY - sentH && mouseY < baseY;
    if (overReceived) {
      drawTooltip([`${name}`, `+ $${nf(received, 1, 2)} received`]);
    } else if (overSent) {
      drawTooltip([`${name}`, `- $${nf(sent, 1, 2)} sent`]);
    }
  }

  image(tooltipGraphics, 0, 0);
}

function drawTooltip(lines) {
  let padding = 8;
  tooltipGraphics.fill(0, 180);
  let boxW = 180, boxH = 40 + lines.length * 16;
  let tipX = constrain(mouseX + 12, 0, width - boxW);
  let tipY = constrain(mouseY - boxH, 0, height - boxH);
  tooltipGraphics.rect(tipX, tipY, boxW, boxH, 6);
  tooltipGraphics.fill(255);
  for (let j = 0; j < lines.length; j++) {
    tooltipGraphics.text(lines[j], tipX + padding, tipY + 20 + j * 14);
  }
}
