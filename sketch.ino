#include <Servo.h>
#include <LiquidCrystal.h>

// ----------------------
// PINS
// ----------------------

const int trigPin = 7;
const int echoPin = 6;

const int servoPin = 9;
const int buzzerPin = 8;

// LCD:
// RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

Servo gateServo;

// ----------------------
// SETTINGS
// ----------------------

const int gateOpen = 10;
const int gateClosed = 90;

const int warningDistance = 60;
const int criticalDistance = 30;

int previousState = -1;

// ----------------------
// READ DISTANCE
// ----------------------

float getDistance() {

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);

  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);

  if (duration == 0) {
    return -1;
  }

  float distance =
    duration * 0.0343 / 2.0;

  return distance;
}

// ----------------------
// SETUP
// ----------------------

void setup() {

  Serial.begin(9600);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  pinMode(buzzerPin, OUTPUT);

  gateServo.attach(servoPin);

  gateServo.write(gateOpen);

  lcd.begin(16, 2);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WILDGUARD");

  lcd.setCursor(0, 1);
  lcd.print("STARTING...");

  delay(1500);

  lcd.clear();
  lcd.print("SYSTEM READY");

  delay(1000);
}

// ----------------------
// LOOP
// ----------------------

void loop() {

  float distance = getDistance();

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  int state;

  // SENSOR ERROR
  if (distance < 0) {

    state = 0;

  }

  // CRITICAL
  else if (distance < criticalDistance) {

    state = 3;

  }

  // WARNING
  else if (distance < warningDistance) {

    state = 2;

  }

  // CLEAR
  else {

    state = 1;

  }

  // Only update LCD when state changes
  if (state != previousState) {

    lcd.clear();

    // --------------------
    // SENSOR ERROR
    // --------------------

    if (state == 0) {

      gateServo.write(gateOpen);

      noTone(buzzerPin);

      lcd.setCursor(0, 0);
      lcd.print("SENSOR ERROR");

      lcd.setCursor(0, 1);
      lcd.print("NO ECHO");

      Serial.println("STATE: SENSOR ERROR");
    }

    // --------------------
    // CLEAR
    // --------------------

    else if (state == 1) {

      gateServo.write(gateOpen);

      noTone(buzzerPin);

      lcd.setCursor(0, 0);
      lcd.print("ROAD CLEAR");

      lcd.setCursor(0, 1);
      lcd.print("DIST:");
      lcd.print((int)distance);
      lcd.print("CM");

      Serial.println("STATE: CLEAR");
    }

    // --------------------
    // WARNING
    // --------------------

    else if (state == 2) {

      gateServo.write(gateOpen);

      lcd.setCursor(0, 0);
      lcd.print("HAZARD NEARBY");

      lcd.setCursor(0, 1);
      lcd.print("DIST:");
      lcd.print((int)distance);
      lcd.print("CM");

      Serial.println("STATE: WARNING");
    }

    // --------------------
    // CRITICAL
    // --------------------

    else if (state == 3) {

      gateServo.write(gateClosed);

      lcd.setCursor(0, 0);
      lcd.print("STOP - HAZARD");

      lcd.setCursor(0, 1);
      lcd.print("GATE CLOSED");

      Serial.println("STATE: CRITICAL");
    }

    previousState = state;
  }

  // ----------------------
  // BUZZER CONTROL
  // ----------------------

  if (state == 2) {

    tone(buzzerPin, 1200, 100);
    delay(150);

  }

  else if (state == 3) {

    tone(buzzerPin, 1800);

  }

  else {

    noTone(buzzerPin);

  }

  delay(200);
}
