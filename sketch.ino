#include <Servo.h>

const int trigPin = 7;
const int echoPin = 6;
const int buzzerPin = 12;
const int servoPin = 9;

Servo myServo;

long duration;
float distance;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);

  myServo.attach(servoPin);
  myServo.write(0);

  Serial.begin(9600);
}

void loop() {

  // Make sure trigger starts LOW
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  // Send ultrasonic pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure return time
  duration = pulseIn(echoPin, HIGH);

  // Calculate distance in centimetres
  distance = duration * 0.0343 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Hand/object detected
  if (distance > 0 && distance <= 20) {

    myServo.write(90);

    tone(buzzerPin, 1000);

  } else {

    myServo.write(0);

    noTone(buzzerPin);
  }

  delay(100);
}
