#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <LiquidCrystal.h>

// =====================================================
// WIFI
// =====================================================

const char *WIFI_SSID =
    "Student WI-FI";

const char *WIFI_PASSWORD =
    "Stud3nt!@!";

// =====================================================
// API
// =====================================================

// Replace with your laptop IPv4 address.
//
// Example:
// http://192.168.0.105:4000/api/telemetry

const char *API_URL =
    "http://192.168.40.86:4000/api/telemetry";

const char *DEVICE_ID =
    "ecowildguard-001";

const char *DEVICE_API_KEY =
    "ewg_dev_a7K9mQ2xR8vP4nL6";

// =====================================================
// ULTRASONIC SENSOR
// =====================================================

const int trigPin = 18;
const int echoPin = 19;

// =====================================================
// PASSIVE BUZZER
// =====================================================

const int buzzerPin = 27;

// =====================================================
// SERVO
// =====================================================

const int servoPin = 25;

Servo gateServo;

// Adjust these if your physical gate moves
// in the opposite direction.

const int GATE_CLOSED = 0;
const int GATE_OPEN = 90;

// Current gate state
bool gateIsOpen = false;

// Prevents startup state from being ignored
bool gateInitialized = false;

// =====================================================
// LCD
// RS, E, D4, D5, D6, D7
// =====================================================

LiquidCrystal lcd(
    13,
    14,
    16,
    17,
    21,
    22);

// =====================================================
// SENSOR VARIABLES
// =====================================================

long duration = 0;

float distance = -1;

// =====================================================
// DISTANCE THRESHOLDS
// =====================================================

// Very close animal
const float CRITICAL_DISTANCE = 10.0;

// Gate closes at or below this distance
const float GATE_CLOSE_DISTANCE = 30.0;

// Gate does not reopen until distance reaches this.
// This prevents servo flickering around 30 cm.
const float GATE_OPEN_DISTANCE = 40.0;

// =====================================================
// TELEMETRY TIMER
// =====================================================

const unsigned long TELEMETRY_INTERVAL =
    2000;

unsigned long lastTelemetryTime = 0;

// =====================================================
// LCD TIMER
// =====================================================

const unsigned long LCD_INTERVAL =
    300;

unsigned long lastLCDUpdate = 0;

// =====================================================
// BUZZER TIMER
// =====================================================

unsigned long lastBuzzerTime = 0;

// =====================================================
// SETUP
// =====================================================

void setup()
{

  Serial.begin(115200);

  delay(500);

  // ---------------------------------------------------
  // LCD
  // ---------------------------------------------------

  lcd.begin(16, 2);

  displayMessage(
      "EcoWildGuard",
      "Starting...");

  // ---------------------------------------------------
  // ULTRASONIC
  // ---------------------------------------------------

  pinMode(
      trigPin,
      OUTPUT);

  pinMode(
      echoPin,
      INPUT);

  digitalWrite(
      trigPin,
      LOW);

  // ---------------------------------------------------
  // BUZZER
  // ---------------------------------------------------

  pinMode(
      buzzerPin,
      OUTPUT);

  noTone(
      buzzerPin);

  // ---------------------------------------------------
  // SERVO
  // ---------------------------------------------------

  gateServo.setPeriodHertz(50);

  gateServo.attach(
      servoPin,
      500,
      2500);

  // Force a known starting state.
  setGate(false);

  // ---------------------------------------------------
  // SERIAL
  // ---------------------------------------------------

  Serial.println();
  Serial.println("==============================");
  Serial.println(" EcoWildGuard");
  Serial.println("==============================");

  // ---------------------------------------------------
  // WIFI
  // ---------------------------------------------------

  connectToWiFi();

  displayMessage(
      "SYSTEM READY",
      "AUTO MODE");

  delay(1000);
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop()
{

  unsigned long now =
      millis();

  // ---------------------------------------------------
  // READ SENSOR
  // ---------------------------------------------------

  distance =
      measureDistance();

  // ---------------------------------------------------
  // INVALID READING
  // ---------------------------------------------------

  if (
      distance < 2 ||
      distance > 400)
  {

    Serial.println(
        "Invalid / no sensor reading");

    // Fail-safe:
    // Close gate if sensor fails.
    setGate(false);

    noTone(
        buzzerPin);

    if (
        now - lastLCDUpdate >= LCD_INTERVAL)
    {

      lastLCDUpdate =
          now;

      displayMessage(
          "SENSOR ERROR",
          "GATE CLOSED");
    }
  }

  // ---------------------------------------------------
  // VALID READING
  // ---------------------------------------------------

  else
  {

    Serial.print(
        "Distance: ");

    Serial.print(
        distance,
        2);

    Serial.println(
        " cm");

    handleAutomaticSystem(
        distance);
  }

  // ---------------------------------------------------
  // SEND TELEMETRY
  // ---------------------------------------------------

  if (
      now - lastTelemetryTime >= TELEMETRY_INTERVAL)
  {

    lastTelemetryTime =
        now;

    if (
        distance >= 2 &&
        distance <= 400)
    {

      sendTelemetry(
          distance);
    }
  }

  delay(50);
}

// =====================================================
// AUTOMATIC SYSTEM
// =====================================================

void handleAutomaticSystem(
    float currentDistance)
{

  unsigned long now =
      millis();

  // ===================================================
  // CRITICAL
  // <= 10 CM
  // ===================================================

  if (
      currentDistance <= CRITICAL_DISTANCE)
  {

    setGate(false);

    // Short beep approximately once per second
    if (
        now - lastBuzzerTime >= 1000)
    {

      lastBuzzerTime =
          now;

      tone(
          buzzerPin,
          1500);

      delay(120);

      noTone(
          buzzerPin);
    }

    if (
        now - lastLCDUpdate >= LCD_INTERVAL)
    {

      lastLCDUpdate =
          now;

      displayMessage(
          "STOP VEHICLE",
          "ANIMAL AHEAD");
    }
  }

  // ===================================================
  // ANIMAL CROSSING
  // 10 - 30 CM
  // ===================================================

  else if (
      currentDistance <= GATE_CLOSE_DISTANCE)
  {

    setGate(false);

    // Much slower warning beep
    if (
        now - lastBuzzerTime >= 3000)
    {

      lastBuzzerTime =
          now;

      tone(
          buzzerPin,
          1100);

      delay(100);

      noTone(
          buzzerPin);
    }

    if (
        now - lastLCDUpdate >= LCD_INTERVAL)
    {

      lastLCDUpdate =
          now;

      displayMessage(
          "SLOW DOWN",
          "ANIMAL CROSSING");
    }
  }

  // ===================================================
  // TRANSITION / HYSTERESIS
  // 30 - 40 CM
  // ===================================================

  else if (
      currentDistance < GATE_OPEN_DISTANCE)
  {

    // IMPORTANT:
    // Do not change the gate state here.
    //
    // If it was closed, it stays closed.
    // If it was already open, it stays open.
    //
    // This prevents rapid servo movement.

    noTone(
        buzzerPin);

    if (
        now - lastLCDUpdate >= LCD_INTERVAL)
    {

      lastLCDUpdate =
          now;

      displayMessage(
          "CAUTION",
          "CHECK CROSSING");
    }
  }

  // ===================================================
  // ROAD CLEAR
  // >= 40 CM
  // ===================================================

  else
  {

    setGate(true);

    noTone(
        buzzerPin);

    if (
        now - lastLCDUpdate >= LCD_INTERVAL)
    {

      lastLCDUpdate =
          now;

      displayMessage(
          "ROAD CLEAR",
          "DRIVE SAFELY");
    }
  }
}

// =====================================================
// GATE CONTROL
// =====================================================

void setGate(
    bool openGate)
{

  // Do absolutely nothing if the gate is
  // already in the requested position.
  //
  // This is important for servo stability.

  if (
      gateInitialized &&
      gateIsOpen == openGate)
  {

    return;
  }

  gateInitialized = true;

  gateIsOpen =
      openGate;

  if (openGate)
  {

    Serial.println(
        "Gate -> OPEN");

    gateServo.write(
        GATE_OPEN);
  }

  else
  {

    Serial.println(
        "Gate -> CLOSED");

    gateServo.write(
        GATE_CLOSED);
  }
}

// =====================================================
// ULTRASONIC SENSOR
// =====================================================

float measureDistance()
{

  digitalWrite(
      trigPin,
      LOW);

  delayMicroseconds(2);

  digitalWrite(
      trigPin,
      HIGH);

  delayMicroseconds(10);

  digitalWrite(
      trigPin,
      LOW);

  duration =
      pulseIn(
          echoPin,
          HIGH,
          30000);

  if (
      duration == 0)
  {

    return -1;
  }

  float calculatedDistance =
      duration * 0.0343 / 2;

  return calculatedDistance;
}

// =====================================================
// API STATUS
// =====================================================

String getStatus(
    float currentDistance)
{

  if (
      currentDistance <= CRITICAL_DISTANCE)
  {

    return "animal_ahead";
  }

  // Keep warning active through the hysteresis zone.
  // This keeps the UI consistent with the closed gate.

  if (
      currentDistance < GATE_OPEN_DISTANCE)
  {

    return "animal_crossing";
  }

  return "road_clear";
}

// =====================================================
// LCD
// =====================================================

void displayMessage(
    String line1,
    String line2)
{

  // Clear line 1
  lcd.setCursor(
      0,
      0);

  lcd.print(
      "                ");

  lcd.setCursor(
      0,
      0);

  lcd.print(
      line1.substring(
          0,
          16));

  // Clear line 2
  lcd.setCursor(
      0,
      1);

  lcd.print(
      "                ");

  lcd.setCursor(
      0,
      1);

  lcd.print(
      line2.substring(
          0,
          16));
}

// =====================================================
// WIFI
// =====================================================

void connectToWiFi()
{

  Serial.println();

  Serial.print(
      "Connecting to WiFi: ");

  Serial.println(
      WIFI_SSID);

  displayMessage(
      "CONNECTING WIFI",
      "PLEASE WAIT");

  WiFi.begin(
      WIFI_SSID,
      WIFI_PASSWORD);

  int attempts = 0;

  while (
      WiFi.status() != WL_CONNECTED &&
      attempts < 30)
  {

    delay(500);

    Serial.print(".");

    attempts++;
  }

  Serial.println();

  if (
      WiFi.status() == WL_CONNECTED)
  {

    Serial.println(
        "WiFi connected!");

    Serial.print(
        "ESP32 IP: ");

    Serial.println(
        WiFi.localIP());

    displayMessage(
        "WIFI CONNECTED",
        "SYSTEM ONLINE");
  }

  else
  {

    Serial.println(
        "WiFi connection failed");

    displayMessage(
        "WIFI FAILED",
        "LOCAL MODE");
  }

  delay(1000);
}

// =====================================================
// SEND TELEMETRY
// =====================================================

void sendTelemetry(
    float currentDistance)
{

  // Don't let an API outage stop the physical system.
  if (
      WiFi.status() != WL_CONNECTED)
  {

    Serial.println(
        "Telemetry skipped: WiFi offline");

    return;
  }

  HTTPClient http;

  http.begin(
      API_URL);

  http.addHeader(
      "Content-Type",
      "application/json");

  http.addHeader(
      "x-api-key",
      DEVICE_API_KEY);

  String status =
      getStatus(
          currentDistance);

  String gateState =
      gateIsOpen
          ? "open"
          : "closed";

  String json =
      "{"
      "\"deviceId\":\"" +
      String(DEVICE_ID) + "\","

                          "\"distance\":" +
      String(
          currentDistance,
          2) +
      ","

      "\"status\":\"" +
      status + "\","

               "\"gateState\":\"" +
      gateState + "\","

                  "\"controlMode\":\"auto\""
                  "}";

  Serial.println();

  Serial.println(
      "Sending telemetry:");

  Serial.println(
      json);

  int responseCode =
      http.POST(
          json);

  Serial.print(
      "HTTP response: ");

  Serial.println(
      responseCode);

  if (
      responseCode > 0)
  {

    Serial.println(
        http.getString());
  }

  else
  {

    Serial.println(
        "Telemetry request failed");

    Serial.println(
        http.errorToString(
            responseCode));
  }

  http.end();
}