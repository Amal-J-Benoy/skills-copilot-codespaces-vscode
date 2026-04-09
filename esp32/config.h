/**
 * config.h — Configuration for Smart Wearable Monitoring System
 *
 * Edit this file with your WiFi credentials, server address, and device ID.
 * All GPIO pin assignments and alert thresholds are defined here.
 */

#ifndef CONFIG_H
#define CONFIG_H

// ─────────────────────────────────────────
// WiFi Credentials
// ─────────────────────────────────────────
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// ─────────────────────────────────────────
// Backend Server
// ─────────────────────────────────────────
#define SERVER_IP       "192.168.1.100"   // Replace with your backend IP
#define SERVER_PORT     5000
#define API_ENDPOINT    "/api/sensor-data"

// ─────────────────────────────────────────
// Device Identity
// ─────────────────────────────────────────
#define DEVICE_ID       "ESP32-WORKER-001"

// ─────────────────────────────────────────
// Sensor GPIO Pins
// ─────────────────────────────────────────
#define DHT_PIN         4     // DHT22 data pin
#define DHT_TYPE        DHT22 // Sensor type

#define UV_SENSOR_PIN   34    // ML8511 analog output (ADC1_CH6)

// ─────────────────────────────────────────
// Display — OLED SSD1306 (I2C)
// ─────────────────────────────────────────
#define OLED_SDA        21    // I2C SDA
#define OLED_SCL        22    // I2C SCL
#define OLED_WIDTH      128
#define OLED_HEIGHT     64
#define OLED_ADDR       0x3C  // I2C address (0x3C or 0x3D)

// ─────────────────────────────────────────
// Output GPIO Pins
// ─────────────────────────────────────────
#define LED_PIN         25    // LED indicator
#define BUZZER_PIN      26    // Buzzer
#define VIBRO_PIN       27    // Vibration motor (via BC547 transistor)

// ─────────────────────────────────────────
// Battery Monitoring
// ─────────────────────────────────────────
#define BATTERY_PIN     35    // ADC pin for battery voltage divider
#define BATTERY_MAX_V   4.2f  // 18650 fully charged voltage
#define BATTERY_MIN_V   3.0f  // 18650 cutoff voltage
#define BATTERY_R1      100000.0f  // Voltage divider R1 (100kΩ)
#define BATTERY_R2      100000.0f  // Voltage divider R2 (100kΩ)

// ─────────────────────────────────────────
// Alert Thresholds
// ─────────────────────────────────────────
#define TEMP_WARN_THRESHOLD   37.0f   // °C — warning level
#define TEMP_HIGH_THRESHOLD   38.0f   // °C — critical level

#define HUMIDITY_WARN_THRESHOLD  65.0f  // % — warning level
#define HUMIDITY_HIGH_THRESHOLD  70.0f  // % — critical level

#define UV_WARN_THRESHOLD    6.0f   // UV Index — warning level (moderate-high)
#define UV_HIGH_THRESHOLD    7.0f   // UV Index — critical level (very high)

#define BATTERY_LOW_THRESHOLD  20    // % — low battery warning

// ─────────────────────────────────────────
// ML8511 Calibration Values
// ─────────────────────────────────────────
// The ML8511 outputs 0 V at 0 mW/cm² and ~3.3 V at ~15 mW/cm².
// ADC is 12-bit (0–4095) referenced to 3.3 V on ESP32.
#define UV_ADC_VOLTAGE_REF  3.3f    // ADC reference voltage (V)
#define UV_ADC_RESOLUTION   4095.0f // 12-bit ADC

// Empirical voltage → UV index conversion points
// (from SparkFun ML8511 breakout datasheet)
#define UV_VOLTAGE_MIN  0.99f   // V at 0 UV index
#define UV_VOLTAGE_MAX  2.9f    // V at 15 UV index
#define UV_INDEX_MAX    15.0f

// ─────────────────────────────────────────
// Timing
// ─────────────────────────────────────────
#define SEND_INTERVAL_MS    10000   // Data transmission interval (10 s)
#define DISPLAY_REFRESH_MS  2000    // OLED refresh interval (2 s)
#define WIFI_RETRY_DELAY_MS 500     // Delay between WiFi connect retries (ms)
#define WIFI_MAX_RETRIES    20      // Maximum WiFi connection retries

// ─────────────────────────────────────────
// Serial Debugging
// ─────────────────────────────────────────
#define SERIAL_BAUD     115200
#define DEBUG_ENABLED   true    // Set false to disable debug output

#define DEBUG_PRINT(msg)   if (DEBUG_ENABLED) { Serial.print(msg); }
#define DEBUG_PRINTLN(msg) if (DEBUG_ENABLED) { Serial.println(msg); }

#endif // CONFIG_H
