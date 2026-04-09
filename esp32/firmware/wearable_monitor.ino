/**
 * wearable_monitor.ino — Smart Wearable Monitoring System
 *
 * Main firmware for ESP32 Dev Board.
 *
 * Hardware:
 *   Sensors  : DHT22 (GPIO 4)  |  ML8511 UV (GPIO 34, analog)
 *   Display  : OLED SSD1306 128×64 (I2C: SDA=21, SCL=22)
 *   Outputs  : LED (GPIO 25)  |  Buzzer (GPIO 26)  |  Vibration (GPIO 27)
 *   Battery  : 18650 via TP4056 + AMS1117 3.3 V regulator
 *
 * Flow (loop):
 *   1. Read sensors (DHT22 + ML8511)
 *   2. Read battery level
 *   3. Ensure WiFi is connected
 *   4. Update OLED display
 *   5. Evaluate & trigger alerts
 *   6. Every SEND_INTERVAL_MS: POST data to backend
 *
 * Libraries required (install via Arduino IDE Library Manager):
 *   - DHT sensor library   (Adafruit)
 *   - Adafruit Unified Sensor
 *   - Adafruit SSD1306
 *   - Adafruit GFX Library
 *   - ArduinoJson          (Benoit Blanchon)
 *
 * Built-in (no install needed):
 *   - WiFi, HTTPClient
 *
 * Configuration: edit esp32/config.h before uploading.
 */

#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "display.h"
#include "alerts.h"
#include "wifi.h"
#include "api.h"

// ─────────────────────────────────────────
// Global State
// ─────────────────────────────────────────
static unsigned long lastSendTime    = 0;   // Last successful HTTP POST timestamp
static unsigned long lastDisplayTime = 0;   // Last OLED refresh timestamp
static SensorData    currentData;           // Most recent sensor readings
static int           batteryPercent  = 100; // Current battery level (%)
static char          alertMsg[32]    = "";  // Current alert message for OLED

// ─────────────────────────────────────────
// Battery Measurement
// ─────────────────────────────────────────

/**
 * Read battery voltage from the ADC pin and convert to percentage.
 *
 * A simple resistor divider (R1=R2=100kΩ) halves the battery voltage.
 * The ESP32 ADC on GPIO 35 is 12-bit (0–4095) at 3.3 V reference.
 *
 * @return Battery level as an integer percentage (0–100).
 */
int readBatteryPercent() {
    const int SAMPLES = 8;
    long sum = 0;
    for (int i = 0; i < SAMPLES; i++) {
        sum += analogRead(BATTERY_PIN);
        delay(5);
    }
    int raw = sum / SAMPLES;

    // Convert ADC → measured voltage → actual battery voltage
    float measured = (float(raw) / UV_ADC_RESOLUTION) * UV_ADC_VOLTAGE_REF;
    float battV    = measured * ((BATTERY_R1 + BATTERY_R2) / BATTERY_R2);

    // Map battery voltage to percentage, clamped to [0, 100]
    int pct = (int)mapFloat(battV, BATTERY_MIN_V, BATTERY_MAX_V, 0.0f, 100.0f);
    return constrain(pct, 0, 100);
}

// ─────────────────────────────────────────
// Setup
// ─────────────────────────────────────────
void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(500);
    DEBUG_PRINTLN(F("\n=== Wearable Monitor v1.0 ==="));

    // Initialize peripherals
    if (!displayInit()) {
        // Display failed — continue without it; use Serial only
        DEBUG_PRINTLN(F("[MAIN] Continuing without display"));
    }

    alertsInit();
    sensorsInit();

    // Connect to WiFi (non-blocking after max retries)
    wifiConnect();

    DEBUG_PRINTLN(F("[MAIN] Setup complete — entering main loop"));
}

// ─────────────────────────────────────────
// Main Loop
// ─────────────────────────────────────────
void loop() {
    unsigned long now = millis();

    // ── 1. Read sensors ───────────────────
    currentData = readAllSensors();
    printSensorData(currentData);

    // ── 2. Read battery ───────────────────
    batteryPercent = readBatteryPercent();
    DEBUG_PRINT(F("[MAIN] Battery: "));
    DEBUG_PRINT(batteryPercent);
    DEBUG_PRINTLN(F("%"));

    // ── 3. Ensure WiFi ────────────────────
    wifiEnsureConnected();

    // ── 4. Classify & trigger alerts ──────
    AlertLevel level = classifyAlert(currentData);
    buildAlertMessage(currentData, alertMsg, sizeof(alertMsg));
    triggerAlert(level);

    // Low battery alert
    if (batteryPercent <= BATTERY_LOW_THRESHOLD) {
        triggerLowBatteryAlert();
    }

    // ── 5. Update OLED (rate-limited) ─────
    if (now - lastDisplayTime >= DISPLAY_REFRESH_MS) {
        lastDisplayTime = now;

        if (batteryPercent <= BATTERY_LOW_THRESHOLD) {
            displayLowBattery(batteryPercent);
            delay(1500);
        } else if (level == ALERT_CRITICAL) {
            // Build a detail line for the alert screen
            char detail[32];
            snprintf(detail, sizeof(detail), "%s", alertMsg);
            displayAlert("CRITICAL", detail, "Contact supervisor");
        } else {
            displayUpdate(currentData, wifiIsConnected(), batteryPercent, alertMsg);
        }
    }

    // ── 6. Send data every SEND_INTERVAL_MS ──
    if (now - lastSendTime >= SEND_INTERVAL_MS) {
        lastSendTime = now;

        if (wifiIsConnected()) {
            int httpCode = apiSendData(currentData, batteryPercent);
            if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
                DEBUG_PRINTLN(F("[MAIN] Data sent successfully"));
                // Quick confirmation blink
                digitalWrite(LED_PIN, HIGH);
                delay(50);
                digitalWrite(LED_PIN, LOW);
            } else {
                DEBUG_PRINT(F("[MAIN] Data send failed, code="));
                DEBUG_PRINTLN(httpCode);
            }
        } else {
            DEBUG_PRINTLN(F("[MAIN] Offline — data not sent"));
        }
    }

    // Small yield to let WiFi stack process
    delay(100);
}
