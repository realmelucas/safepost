#include <WiFi.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASSWORD = "YOUR_PASSWORD";
const char* MQTT_HOST = "192.168.1.10";
const int MQTT_PORT = 1883;
const char* MQTT_USER = "station";
const char* MQTT_PASSWORD = "change-me";
const char* STATION_NO = "S0001";

const int CHECK_BUTTON = 0;
const int STATUS_LED = 2;

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

unsigned long lastOnlineAt = 0;
unsigned long lastCheckAt = 0;

String jsonValue(const String& payload, const String& key) {
  String pattern = "\"" + key + "\":\"";
  int start = payload.indexOf(pattern);
  if (start < 0) return "";
  start += pattern.length();
  int end = payload.indexOf("\"", start);
  if (end < 0) return "";
  return payload.substring(start, end);
}

void publishToStationUp(const String& payload) {
  String topic = String("safepost/station/") + STATION_NO + "/up";
  mqtt.publish(topic.c_str(), payload.c_str(), true);
}

void forwardBroadcastToBadge(const String& badgeNo, const String& message) {
  String topic = String("safepost/badge/") + badgeNo + "/down";
  String payload = "{";
  payload += "\"type\":\"BROADCAST\",";
  payload += "\"noticeType\":\"DRINK_WATER\",";
  payload += "\"message\":\"" + message + "\",";
  payload += "\"durationMs\":5000,";
  payload += "\"ts\":" + String(millis());
  payload += "}";
  mqtt.publish(topic.c_str(), payload.c_str(), true);
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String body;
  for (unsigned int i = 0; i < length; i++) {
    body += (char)payload[i];
  }

  String type = jsonValue(body, "type");
  if (type == "BROADCAST") {
    String badgeNo = jsonValue(body, "badgeNo");
    String message = jsonValue(body, "message");
    if (badgeNo.length() > 0) {
      forwardBroadcastToBadge(badgeNo, message);
    }
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
    String clientId = String("station-") + STATION_NO;
    if (mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
      String downTopic = String("safepost/station/") + STATION_NO + "/down";
      mqtt.subscribe(downTopic.c_str(), 1);
    } else {
      delay(2000);
    }
  }
}

void publishOnline() {
  String payload = "{";
  payload += "\"type\":\"STATION_ONLINE\",";
  payload += "\"stationNo\":\"" + String(STATION_NO) + "\",";
  payload += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  payload += "\"ts\":" + String(millis());
  payload += "}";
  publishToStationUp(payload);
}

void publishMockCheckResult() {
  String payload = "{";
  payload += "\"type\":\"CHECK_RESULT\",";
  payload += "\"stationNo\":\"" + String(STATION_NO) + "\",";
  payload += "\"badgeNo\":\"B0001\",";
  payload += "\"systolic\":122,";
  payload += "\"diastolic\":78,";
  payload += "\"heartRate\":82,";
  payload += "\"alcoholMg100ml\":0,";
  payload += "\"ts\":" + String(millis());
  payload += "}";
  publishToStationUp(payload);
}

void setup() {
  pinMode(CHECK_BUTTON, INPUT_PULLUP);
  pinMode(STATUS_LED, OUTPUT);

  connectWifi();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMqttMessage);
}

void loop() {
  if (!mqtt.connected()) {
    connectMqtt();
  }
  mqtt.loop();

  if (millis() - lastOnlineAt > 30000) {
    lastOnlineAt = millis();
    publishOnline();
  }

  if (digitalRead(CHECK_BUTTON) == LOW && millis() - lastCheckAt > 5000) {
    lastCheckAt = millis();
    publishMockCheckResult();
    digitalWrite(STATUS_LED, HIGH);
    delay(150);
    digitalWrite(STATUS_LED, LOW);
  }
}
