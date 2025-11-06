/*

This code is not intended to run in VS code using live server, it should be
compiled in the web editor for p5js. Please make sure you are using chrome
as other web broswers are not compatiable. Here is the link to the
p5js editor: https://editor.p5js.org/nicolasp/sketches/qQt7MMBt1

You may go to the above link and replace the code in the web editor with the code
found below in this file.

*/

let serialAvailable = false;
let serialInput = "";
let port, reader, outputStream, inputDone, outputDone, inputStream;
let portIsOpen = false;

let bgColor;
let motionDetected = false; 

function setup() {
  createCanvas(400, 400);
  bgColor = color(0, 0, 255); // start with blue (no motion)
  print("Click on the canvas and press 'c' to connect to Arduino");
}

function draw() {
  background(bgColor);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  if (motionDetected) {
    text("MOTION DETECTED", width / 2, height / 2);
  } else {
    text("NO MOTION", width / 2, height / 2);
  }

  // Process incoming serial data
  if (serialAvailable) {
    serialAvailable = false;
    let trimmed = serialInput.trim();
    serialInput = "";

    // Check what the Arduino sent
    if (trimmed.includes("Motion detected")) {
      motionDetected = true;
      bgColor = color(255, 0, 0); // red
    } else if (trimmed.includes("The action/ motion has stopped")) {
      motionDetected = false;
      bgColor = color(0, 0, 255); // blue
    }

    print(trimmed); // log what we got
  }
}

function keyPressed() {
  if (key === "c") {
    serialConnect();
  }
}

async function serialListen() {
  if (!portIsOpen) return;

  while (portIsOpen) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      serialAvailable = true;
      serialInput += value;
    }
  }
}


async function serialConnect() {
  if (navigator.serial) {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });

    const decoder = new TextDecoderStream();
    inputStream = decoder.readable;
    inputDone = port.readable.pipeTo(decoder.writable);
    reader = inputStream.getReader();

    const encoder = new TextEncoderStream();
    outputDone = encoder.readable.pipeTo(port.writable);
    outputStream = encoder.writable;

    portIsOpen = true;
    print("Port is open");
    serialListen();
  } else {
    print("Serial not compatible with this browser :(");
  }
}

function serialWrite(line) {
  if (portIsOpen) {
    const writer = outputStream.getWriter();
    writer.write(line);
    writer.releaseLock();
  }
}
