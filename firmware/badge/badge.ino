#include <WiFi.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASSWORD = "YOUR_PASSWORD";
const char* MQTT_HOST = "192.168.1.10";
const int MQTT_PORT = 1883;
const char* MQTT_USER = "badge";
const char* MQTT_PASSWORD = "change-me";
const char* BADGE_NO = "B0001";

const int LED_RED = 2;
const int LED_YELLOW = 3;
const int LED_GREEN = 4;
const int SOS_BUTTON = 9;
const int BUZZER = 10;

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

String badgeStatus = "PENDING";
unsigned long lastHeartbeatAt = 0;
unsigned long lastSosAt = 0;

void setStatusLed(const String& status) {
  digitalWrite(LED_RED, status == "FORBIDDEN" || status == "ALERT");
  digitalWrite(LED_YELLOW, status == "PENDING");
  digitalWrite(LED_GREEN, status == "ALLOWED");
}

void beep(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER, HIGH);
    delay(120);
    digitalWrite(BUZZER, LOW);
    delay(120);
  }
}

String jsonValue(const String& payload, const String& key) {
  String pattern = "\"" + key + "\":\"";
  int start = payload.indexOf(pattern);
  if (start < 0) return "";
  start += pattern.length();
  int end = payload.indexOf("\"", start);
  if (end < 0) return "";
  return payload.substring(start, end);
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String body;
  for (unsigned int i = 0; i < length; i++) {
    body += (char)payload[i];
  }

  String type = jsonValue(body, "type");
  if (type == "SET_STATUS") {
    badgeStatus = jsonValue(body, "status");
    setStatusLed(badgeStatus);
    beep(badgeStatus == "ALLOWED" ? 1 : 2);
  }

  if (type == "BROADCAST") {
    beep(3);
  }
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void connectMqtt() {
  while (!mqtt.connected()) {
    String clientId = String("badge-") + BADGE_NO;
    if (mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
      String downTopic = String("safepost/badge/") + BADGE_NO + "/down";
      mqtt.subscribe(downTopic.c_str(), 1);
    } else {
      delay(2000);
    }
  }
}

void publishHeartbeat() {
  String topic = String("safepost/badge/") + BADGE_NO + "/up";
  String payload = "{";
  payload += "\"type\":\"HEARTBEAT\",";
  payload += "\"badgeNo\":\"" + String(BADGE_NO) + "\",";
  payload += "\"battery\":86,";
  payload += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  payload += "\"status\":\"" + badgeStatus + "\",";
  payload += "\"ts\":" + String(millis());
  payload += "}";
  mqtt.publish(topic.c_str(), payload.c_str(), true);
}

void publishSos() {
  String topic = String("safepost/badge/") + BADGE_NO + "/up";
  String payload = "{";
  payload += "\"type\":\"SOS\",";
  payload += "\"badgeNo\":\"" + String(BADGE_NO) + "\",";
  payload += "\"reason\":\"button_pressed\",";
  payload += "\"ts\":" + String(millis());
  payload += "}";
  mqtt.publish(topic.c_str(), payload.c_str(), true);
  badgeStatus = "ALERT";
  setStatusLed(badgeStatus);
  beep(5);
}

void setup() {
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(SOS_BUTTON, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);

  setStatusLed(badgeStatus);
  connectWifi();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMqttMessage);
}

void loop() {
  if (!mqtt.connected()) {
    connectMqtt();
  }
  mqtt.loop();

  if (millis() - lastHeartbeatAt > 30000) {
    lastHeartbeatAt = millis();
    publishHeartbeat();
  }

  if (digitalRead(SOS_BUTTON) == LOW && millis() - lastSosAt > 30000) {
    lastSosAt = millis();
    publishSos();
  }
}
