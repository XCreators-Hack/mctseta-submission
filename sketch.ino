#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

// =====================================================
// WIFI SETTINGS
// =====================================================

const char* WIFI_SSID = "Student WI-FI";
const char* WIFI_PASSWORD = "Stud3nt!@!";


// =====================================================
// API SETTINGS
// =====================================================

// Change this to your laptop's IPv4 address.
//
// Example:
// http://192.168.1.105:3000/api/telemetry

const char* API_URL =
  "http://192.168.40.86:4000/api/telemetry";

// Device identification
const char* DEVICE_ID =
  "ecowildguard-001";

// Development API key
const char* DEVICE_API_KEY =
  "ewg_dev_a7K9mQ2xR8vP4nL6";


// =====================================================
// PINS
// =====================================================

// HC-SR04
const int trigPin = 18;
const int echoPin = 19;

// Passive buzzer
const int buzzerPin = 27;

// Servo
const int servoPin = 25;


// =====================================================
// SERVO
// =====================================================

Servo myServo;


// =====================================================
// SENSOR VARIABLES
// =====================================================

long duration = 0;

float distance = -1;


// =====================================================
// TELEMETRY TIMER
// =====================================================

// Send data every 2 seconds

const unsigned long SEND_INTERVAL = 2000;

unsigned long lastSendTime = 0;


// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(1000);


  Serial.println();
  Serial.println("==============================");
  Serial.println(" EcoWildGuard ESP32");
  Serial.println("==============================");


  // ---------------------------------------------------
  // Ultrasonic Sensor
  // ---------------------------------------------------

  pinMode(trigPin, OUTPUT);

  pinMode(echoPin, INPUT);

  digitalWrite(trigPin, LOW);


  // ---------------------------------------------------
  // Buzzer
  // ---------------------------------------------------

  pinMode(buzzerPin, OUTPUT);

  noTone(buzzerPin);


  // ---------------------------------------------------
  // Servo
  // ---------------------------------------------------

  myServo.setPeriodHertz(50);

  myServo.attach(
    servoPin,
    500,
    2500
  );

  myServo.write(0);


  // ---------------------------------------------------
  // Wi-Fi
  // ---------------------------------------------------

  connectToWiFi();


  Serial.println();
  Serial.println("System ready.");
}


// =====================================================
// MAIN LOOP
// =====================================================

void loop() {

  // Measure distance

  distance = measureDistance();


  // ---------------------------------------------------
  // INVALID SENSOR READING
  // ---------------------------------------------------

  if (distance < 2 || distance > 400) {

    Serial.println("Invalid / no distance reading");

    noTone(buzzerPin);

    myServo.write(0);
  }


  // ---------------------------------------------------
  // VALID SENSOR READING
  // ---------------------------------------------------

  else {

    Serial.print("Distance: ");
    Serial.print(distance, 2);
    Serial.println(" cm");


    handleDistanceBehaviour(distance);
  }


  // ---------------------------------------------------
  // SEND TELEMETRY EVERY 2 SECONDS
  // ---------------------------------------------------

  unsigned long currentTime = millis();


  if (
    currentTime - lastSendTime
    >= SEND_INTERVAL
  ) {

    lastSendTime = currentTime;


    if (
      distance >= 2 &&
      distance <= 400
    ) {

      sendTelemetry(distance);
    }
  }


  delay(100);
}


// =====================================================
// WIFI CONNECTION
// =====================================================

void connectToWiFi() {

  Serial.println();

  Serial.print(
    "Connecting to Wi-Fi: "
  );

  Serial.println(WIFI_SSID);


  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );


  int attempts = 0;


  while (
    WiFi.status() != WL_CONNECTED
    &&
    attempts < 30
  ) {

    delay(500);

    Serial.print(".");

    attempts++;
  }


  Serial.println();


  if (
    WiFi.status()
    == WL_CONNECTED
  ) {

    Serial.println(
      "Wi-Fi connected!"
    );


    Serial.print(
      "ESP32 IP address: "
    );

    Serial.println(
      WiFi.localIP()
    );
  }

  else {

    Serial.println(
      "Wi-Fi connection failed."
    );
  }
}


// =====================================================
// ULTRASONIC SENSOR
// =====================================================

float measureDistance() {

  // Make sure TRIG begins LOW

  digitalWrite(
    trigPin,
    LOW
  );

  delayMicroseconds(2);


  // Send 10 microsecond pulse

  digitalWrite(
    trigPin,
    HIGH
  );

  delayMicroseconds(10);


  digitalWrite(
    trigPin,
    LOW
  );


  // Wait for echo

  duration = pulseIn(
    echoPin,
    HIGH,
    30000
  );


  // Timeout

  if (duration == 0) {

    return -1;
  }


  // Calculate distance

  float calculatedDistance =
    duration * 0.0343 / 2;


  return calculatedDistance;
}


// =====================================================
// DISTANCE BEHAVIOUR
// =====================================================

void handleDistanceBehaviour(
  float currentDistance
) {

  // ---------------------------------------------------
  // VERY CLOSE
  // 2 - 10 CM
  // ---------------------------------------------------

  if (currentDistance <= 10) {

    myServo.write(90);

    tone(
      buzzerPin,
      1500
    );

    delay(80);

    noTone(
      buzzerPin
    );
  }


  // ---------------------------------------------------
  // CLOSE
  // 11 - 30 CM
  // ---------------------------------------------------

  else if (
    currentDistance <= 30
  ) {

    myServo.write(0);

    tone(
      buzzerPin,
      1200
    );

    delay(70);

    noTone(
      buzzerPin
    );
  }


  // ---------------------------------------------------
  // NEARBY
  // 31 - 60 CM
  // ---------------------------------------------------

  else if (
    currentDistance <= 60
  ) {

    myServo.write(0);

    tone(
      buzzerPin,
      900
    );

    delay(50);

    noTone(
      buzzerPin
    );
  }


  // ---------------------------------------------------
  // CLEAR
  // ABOVE 60 CM
  // ---------------------------------------------------

  else {

    myServo.write(0);

    noTone(
      buzzerPin
    );
  }
}


// =====================================================
// DETERMINE STATUS
// =====================================================

String getStatus(
  float currentDistance
) {

  if (
    currentDistance <= 10
  ) {

    return "very_close";
  }


  else if (
    currentDistance <= 30
  ) {

    return "close";
  }


  else if (
    currentDistance <= 60
  ) {

    return "nearby";
  }


  else {

    return "clear";
  }
}


// =====================================================
// SEND DATA TO API
// =====================================================

void sendTelemetry(
  float currentDistance
) {

  // ---------------------------------------------------
  // CHECK WIFI
  // ---------------------------------------------------

  if (
    WiFi.status()
    != WL_CONNECTED
  ) {

    Serial.println(
      "Wi-Fi disconnected."
    );


    Serial.println(
      "Attempting reconnect..."
    );


    connectToWiFi();


    if (
      WiFi.status()
      != WL_CONNECTED
    ) {

      Serial.println(
        "Cannot send telemetry."
      );

      return;
    }
  }


  // ---------------------------------------------------
  // CREATE HTTP REQUEST
  // ---------------------------------------------------

  HTTPClient http;


  http.begin(
    API_URL
  );


  // Tell Express we're sending JSON

  http.addHeader(
    "Content-Type",
    "application/json"
  );


  // Device authentication

  http.addHeader(
    "x-api-key",
    DEVICE_API_KEY
  );


  // ---------------------------------------------------
  // CREATE JSON
  // ---------------------------------------------------

  String status =
    getStatus(
      currentDistance
    );


  String json =
    "{"
    "\"deviceId\":\""
    + String(DEVICE_ID)
    + "\","

    "\"distance\":"
    + String(
        currentDistance,
        2
      )
    + ","

    "\"status\":\""
    + status
    + "\""
    "}";


  // ---------------------------------------------------
  // DEBUG OUTPUT
  // ---------------------------------------------------

  Serial.println();
  Serial.println(
    "Sending telemetry..."
  );

  Serial.println(json);


  // ---------------------------------------------------
  // POST REQUEST
  // ---------------------------------------------------

  int responseCode =
    http.POST(json);


  Serial.print(
    "HTTP response: "
  );

  Serial.println(
    responseCode
  );


  // ---------------------------------------------------
  // SERVER RESPONSE
  // ---------------------------------------------------

  if (
    responseCode > 0
  ) {

    String response =
      http.getString();


    Serial.println(
      "Server response:"
    );

    Serial.println(
      response
    );
  }

  else {

    Serial.println(
      "Request failed."
    );


    Serial.println(
      http.errorToString(
        responseCode
      )
    );
  }


  // Close HTTP connection

  http.end();


  Serial.println();
}
