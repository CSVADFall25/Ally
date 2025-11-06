/*
This code is modified from arduino project hub. Here is the link for the original code:
https://projecthub.arduino.cc/electronicsfan123/interfacing-arduino-uno-with-pir-motion-sensor-593b6b 

This link also includes a diagram of the arduino and bread board set up we used.
*/

const int led = 9; // Led positive terminal to the digital pin 9.              
const int sensor = 5; // signal pin of sensor to digital pin 5.               
int state = LOW;            
int val = 0;                 

void  setup() { // Void setup is ran only once after each powerup or reset of the Arduino  board.
  pinMode(led, OUTPUT); // Led is determined as an output here.    
  pinMode(sensor, INPUT); // PIR motion sensor is determined is an input here.  
  Serial.begin(9600);      
}

void loop(){ // Void loop is ran over and  over and consists of the main program.
  val = digitalRead(sensor);
  if  (val == HIGH) {           
    digitalWrite(led, HIGH);   
    delay(50);  // Delay of led is 500             
    
    if (state == LOW) {
      Serial.println("  Motion detected "); 
      state = HIGH;       
    }
  } 
  else {
      digitalWrite(led, LOW);
      delay(50);             
      
      if  (state == HIGH){
        Serial.println("The action/ motion has stopped");
        state = LOW;       
    }
  }
}
