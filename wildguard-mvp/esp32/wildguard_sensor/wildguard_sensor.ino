/*
  WildGuard — ESP32 roadside sensor unit (hackathon hardware MVP)
  -----------------------------------------------------------------
  Hardware:
    - HC-SR04 ultrasonic distance sensor  -> proximity/hazard proxy only.
      This does NOT identify wildlife species or objects — it is a simple
      distance trigger standing in for a future PIR/radar/thermal/CV/LiDAR
      sensor layer.
    - SG90 servo                          -> represents a boom-gate style
      automated intervention (prototype only, not a real road closure).
    - Red + Green LEDs                    -> visual warning state.
    - 16x2 LCD (via I2C backpack)         -> speed/warning display.

  Networking:
    - Connects to Wi-Fi, then POSTs JSON events to the WildGuard backend at
      WILDGUARD_API_URL. Authenticated with a shared DEVICE_API_KEY header
      (see .env.local -> DEVICE_API_KEY on the server side).
    - The backend's response tells this device which command to act on:
      ACTIVATE_WARNING | CLEAR | HOLD.

  This firmware is intentionally simple: one loop, one blocking HTTP POST
  per state change, no MQTT broker required for the hackathon MVP.
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ---------------- Configuration ----------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Point this at your deployed / local WildGuard instance, e.g.
// "http://192.168.1.50:3000/api/events" for a laptop on the same LAN, or
// your deployed URL for a hosted demo.
const char* WILDGUARD_API_URL = "http://YOUR_SERVER_HOST:3000/api/events";

// Must match DEVICE_API_KEY in the server's .env.local
const char* DEVICE_API_KEY = "YOUR_DEVICE_API_KEY";

// Must match a device doc's `deviceCode` field in Firestore, e.g. "WC-003"
const char* DEVICE_ID = "WC-003";

const int HAZARD_THRESHOLD_CM = 50;

// ---------------- Pins ----------------
const int PIN_TRIG    = 5;
const int PIN_ECHO     = 18;
const int PIN_SERVO    = 13;
const int PIN_LED_RED  = 25;
const int PIN_LED_GREEN = 26;

Servo boomGate;
LiquidCrystal_I2C lcd(0x27, 16, 2); // common default I2C address

// ---------------- State ----------------
enum WarningState { STATE_NORMAL, STATE_WARNING };
WarningState currentState = STATE_NORMAL;

unsigned long lastSendMs = 0;
const unsigned long SEND_INTERVAL_MS = 1500; // avoid flooding the API

void setup() {
  Serial.begin(115200);

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);

  boomGate.attach(PIN_SERVO);
  setGateOpen();

  lcd.init();
  lcd.backlight();
  showNormalScreen();

  connectWifi();
}

void loop() {
  long distanceCm = readDistanceCm();

  if (millis() - lastSendMs >= SEND_INTERVAL_MS) {
    lastSendMs = millis();
    sendEvent(distanceCm);
  }

  delay(200);
}

// ---------------- Sensor ----------------
long readDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long durationUs = pulseIn(PIN_ECHO, HIGH, 30000); // 30ms timeout ~5m range
  if (durationUs == 0) return 999; // no echo => treat as clear

  // Speed of sound ~343 m/s => 0.0343 cm/us, round trip so /2
  long distance = durationUs * 0.0343 / 2;
  return distance;
}

// ---------------- Networking ----------------
void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println(" connected.");
}

void sendEvent(long distanceCm) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
    return;
  }

  HTTPClient http;
  http.begin(WILDGUARD_API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-api-key", DEVICE_API_KEY);

  StaticJsonDocument<200> payload;
  payload["deviceId"] = DEVICE_ID;
  payload["distance"] = distanceCm;

  String body;
  serializeJson(payload, body);

  int httpStatus = http.POST(body);

  if (httpStatus > 0) {
    String response = http.getString();
    StaticJsonDocument<300> resDoc;
    DeserializationError err = deserializeJson(resDoc, response);
    if (!err) {
      const char* command = resDoc["command"] | "HOLD";
      applyCommand(command, distanceCm);
    }
  } else {
    Serial.printf("POST failed: %s\n", http.errorToString(httpStatus).c_str());
  }

  http.end();
}

// ---------------- Actuation ----------------
void applyCommand(const char* command, long distanceCm) {
  if (strcmp(command, "ACTIVATE_WARNING") == 0) {
    activateWarning(distanceCm);
  } else if (strcmp(command, "CLEAR") == 0) {
    clearWarning();
  }
  // "HOLD" -> no change
}

void activateWarning(long distanceCm) {
  currentState = STATE_WARNING;
  digitalWrite(PIN_LED_RED, HIGH);
  digitalWrite(PIN_LED_GREEN, LOW);
  setGateClosed();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("REDUCE SPEED 40");
  lcd.setCursor(0, 1);
  lcd.print("Dist: ");
  lcd.print(distanceCm);
  lcd.print("cm");
}

void clearWarning() {
  currentState = STATE_NORMAL;
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_LED_GREEN, HIGH);
  setGateOpen();
  showNormalScreen();
}

void setGateOpen() {
  boomGate.write(0); // open position
}

void setGateClosed() {
  boomGate.write(90); // closed position
}

void showNormalScreen() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WildGuard: OK");
  lcd.setCursor(0, 1);
  lcd.print("Speed 80 km/h");
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_RED, LOW);
}
