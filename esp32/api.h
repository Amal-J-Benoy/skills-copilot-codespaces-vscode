/**
 * api.h — HTTP backend communication library
 *
 * Sends sensor data to the backend API via HTTP POST.
 * Formats data as JSON matching the backend's expected schema.
 *
 * Depends on: config.h, sensors.h
 * Libraries: HTTPClient (built-in), ArduinoJson
 */

#ifndef API_H
#define API_H

#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"
#include "sensors.h"

// ─────────────────────────────────────────
// URL Construction
// ─────────────────────────────────────────

/**
 * Build the full backend endpoint URL from config values.
 * Stored in a static buffer — do not store a pointer across calls.
 */
static String _buildURL() {
    String url = "http://";
    url += SERVER_IP;
    url += ":";
    url += SERVER_PORT;
    url += API_ENDPOINT;
    return url;
}

// ─────────────────────────────────────────
// JSON Serialization
// ─────────────────────────────────────────

/**
 * Serialize sensor readings + battery level into a JSON string.
 *
 * Output format:
 * {
 *   "deviceId":    "ESP32-WORKER-001",
 *   "temperature": 36.5,
 *   "humidity":    55.0,
 *   "uvIndex":     5.2,
 *   "batteryLevel":85
 * }
 *
 * @param data        Sensor readings.
 * @param battery     Battery percentage (0–100).
 * @param output      String that will receive the JSON payload.
 */
void buildJsonPayload(const SensorData& data, int battery, String& output) {
    // Use a statically sized JSON document (256 bytes is sufficient for this payload)
    StaticJsonDocument<256> doc;

    doc["deviceId"] = DEVICE_ID;

    if (data.tempValid)
        doc["temperature"] = round(data.temperature * 10.0f) / 10.0f;
    else
        doc["temperature"] = nullptr;

    if (data.humidityValid)
        doc["humidity"] = round(data.humidity * 10.0f) / 10.0f;
    else
        doc["humidity"] = nullptr;

    if (data.uvValid)
        doc["uvIndex"] = round(data.uvIndex * 100.0f) / 100.0f;
    else
        doc["uvIndex"] = nullptr;

    doc["batteryLevel"] = battery;

    output = "";
    serializeJson(doc, output);
}

// ─────────────────────────────────────────
// HTTP POST
// ─────────────────────────────────────────

/**
 * Send a JSON sensor-data payload to the backend via HTTP POST.
 *
 * Retries once on connection failure. Logs status to Serial.
 *
 * @param data     Sensor readings to transmit.
 * @param battery  Battery percentage (0–100).
 * @return         HTTP status code (>0), or negative error code on failure.
 */
int apiSendData(const SensorData& data, int battery) {
    if (WiFi.status() != WL_CONNECTED) {
        DEBUG_PRINTLN(F("[API] No WiFi — skipping POST"));
        return -1;
    }

    String payload;
    buildJsonPayload(data, battery, payload);

    String url = _buildURL();
    DEBUG_PRINT(F("[API] POST "));
    DEBUG_PRINT(url);
    DEBUG_PRINT(F("  body="));
    DEBUG_PRINTLN(payload);

    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(8000);   // 8-second timeout

    int httpCode = http.POST(payload);

    if (httpCode > 0) {
        DEBUG_PRINT(F("[API] Response: "));
        DEBUG_PRINTLN(httpCode);
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
            String response = http.getString();
            DEBUG_PRINTLN(response);
        }
    } else {
        DEBUG_PRINT(F("[API] POST failed, error: "));
        DEBUG_PRINTLN(http.errorToString(httpCode));

        // Single retry
        DEBUG_PRINTLN(F("[API] Retrying..."));
        delay(1000);
        httpCode = http.POST(payload);
        DEBUG_PRINT(F("[API] Retry result: "));
        DEBUG_PRINTLN(httpCode);
    }

    http.end();
    return httpCode;
}

#endif // API_H
