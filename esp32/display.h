/**
 * display.h — OLED SSD1306 display library
 *
 * Provides initialization and drawing functions for the 128×64 OLED display.
 * Uses I2C (GPIO 21 SDA, GPIO 22 SCL).
 *
 * Depends on: config.h, sensors.h,
 *             Adafruit SSD1306, Adafruit GFX Library
 */

#ifndef DISPLAY_H
#define DISPLAY_H

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"
#include "sensors.h"

// ─────────────────────────────────────────
// OLED instance
// ─────────────────────────────────────────
static Adafruit_SSD1306 oled(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);

// ─────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────

/**
 * Initialize the OLED display.
 * Call once in setup(). Returns true on success, false on failure.
 */
bool displayInit() {
    Wire.begin(OLED_SDA, OLED_SCL);
    if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
        DEBUG_PRINTLN(F("[DISPLAY] SSD1306 init failed — check wiring / I2C address"));
        return false;
    }
    oled.clearDisplay();
    oled.setTextColor(SSD1306_WHITE);
    oled.setTextSize(1);

    // Splash screen
    oled.setCursor(10, 20);
    oled.println(F("Wearable Monitor"));
    oled.setCursor(28, 38);
    oled.println(F("Initializing..."));
    oled.display();
    delay(1500);

    DEBUG_PRINTLN(F("[DISPLAY] SSD1306 initialized"));
    return true;
}

// ─────────────────────────────────────────
// Helper — small battery icon (right side)
// ─────────────────────────────────────────

/**
 * Draw a compact battery icon at the given position.
 * @param x        Left edge of battery body
 * @param y        Top edge of battery body
 * @param percent  Battery percentage (0–100)
 */
void drawBatteryIcon(int x, int y, int percent) {
    // Body (12×6 px)
    oled.drawRect(x, y, 12, 6, SSD1306_WHITE);
    // Cap (2×3 px centered on right side)
    oled.fillRect(x + 12, y + 2, 2, 2, SSD1306_WHITE);
    // Fill level
    int fillW = map(percent, 0, 100, 0, 10);
    if (fillW > 0) {
        oled.fillRect(x + 1, y + 1, fillW, 4, SSD1306_WHITE);
    }
}

// ─────────────────────────────────────────
// Helper — WiFi icon (top-left)
// ─────────────────────────────────────────

/**
 * Draw a simple WiFi indicator at top-left corner.
 * @param connected  true = filled dot, false = hollow dot (offline)
 */
void drawWiFiIcon(bool connected) {
    if (connected) {
        oled.fillCircle(3, 3, 2, SSD1306_WHITE);
    } else {
        oled.drawCircle(3, 3, 2, SSD1306_WHITE);
    }
}

// ─────────────────────────────────────────
// Main Sensor Screen
// ─────────────────────────────────────────

/**
 * Refresh the OLED with the latest sensor readings and status.
 *
 * Layout (128×64):
 *   Row 0  : [WiFi] "WEARABLE MON"  [Batt XX%]
 *   Row 1  : separator line
 *   Row 2  : Temp:  XX.X °C
 *   Row 3  : Hum:   XX.X %
 *   Row 4  : UV:    XX.X
 *   Row 5  : separator line
 *   Row 6  : Status / Alert message
 *
 * @param data       Latest sensor readings
 * @param connected  WiFi connection state
 * @param battery    Battery percentage (0–100)
 * @param alertMsg   Short alert message (e.g. "HIGH TEMP!") or "" for normal
 */
void displayUpdate(const SensorData& data,
                   bool connected,
                   int battery,
                   const char* alertMsg) {
    oled.clearDisplay();

    // ── Header row ─────────────────────────────
    drawWiFiIcon(connected);
    oled.setTextSize(1);
    oled.setCursor(8, 0);
    oled.print(F("WEARABLE MON"));
    drawBatteryIcon(100, 0, battery);
    // Battery percent text (small)
    oled.setCursor(96, 0);
    oled.print(battery);
    oled.print(F("%"));

    // ── Separator ──────────────────────────────
    oled.drawFastHLine(0, 9, OLED_WIDTH, SSD1306_WHITE);

    // ── Sensor Readings ────────────────────────
    oled.setTextSize(1);

    // Temperature
    oled.setCursor(0, 13);
    oled.print(F("Temp:  "));
    if (data.tempValid) {
        oled.print(data.temperature, 1);
        oled.print(F("\xF8C"));   // degree symbol + C
    } else {
        oled.print(F("--.- \xF8C"));
    }

    // Humidity
    oled.setCursor(0, 25);
    oled.print(F("Hum:   "));
    if (data.humidityValid) {
        oled.print(data.humidity, 1);
        oled.print(F(" %"));
    } else {
        oled.print(F("--.- %"));
    }

    // UV Index
    oled.setCursor(0, 37);
    oled.print(F("UV Idx:"));
    if (data.uvValid) {
        oled.print(data.uvIndex, 1);
    } else {
        oled.print(F("---"));
    }

    // ── Separator ──────────────────────────────
    oled.drawFastHLine(0, 48, OLED_WIDTH, SSD1306_WHITE);

    // ── Status / Alert ─────────────────────────
    oled.setCursor(0, 52);
    if (alertMsg && alertMsg[0] != '\0') {
        oled.print(F("! "));
        oled.print(alertMsg);
    } else {
        oled.print(connected ? F("Online  OK") : F("Offline  OK"));
    }

    oled.display();
}

// ─────────────────────────────────────────
// Alert Screen (full-screen message)
// ─────────────────────────────────────────

/**
 * Show a full-screen alert message on the OLED.
 * Use for critical alerts; call displayUpdate() to return to normal view.
 *
 * @param title    Short alert title  (max ~10 chars)
 * @param line1    First detail line
 * @param line2    Second detail line (can be "")
 */
void displayAlert(const char* title, const char* line1, const char* line2) {
    oled.clearDisplay();

    // Invert the title for emphasis
    oled.fillRect(0, 0, OLED_WIDTH, 12, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.setTextSize(1);
    oled.setCursor(4, 2);
    oled.print(F("! ALERT: "));
    oled.print(title);

    oled.setTextColor(SSD1306_WHITE);
    oled.setTextSize(1);

    oled.setCursor(4, 18);
    oled.print(line1);

    if (line2 && line2[0] != '\0') {
        oled.setCursor(4, 32);
        oled.print(line2);
    }

    oled.setCursor(4, 50);
    oled.print(F("Take action now!"));

    oled.display();
}

// ─────────────────────────────────────────
// Low Battery Screen
// ─────────────────────────────────────────

/**
 * Display a low-battery warning overlay.
 */
void displayLowBattery(int percent) {
    oled.clearDisplay();
    oled.setTextSize(2);
    oled.setCursor(10, 10);
    oled.print(F("LOW BATT"));
    oled.setTextSize(1);
    oled.setCursor(20, 40);
    oled.print(percent);
    oled.print(F("% remaining"));
    oled.display();
}

// ─────────────────────────────────────────
// Connecting Screen
// ─────────────────────────────────────────

/**
 * Show "Connecting to WiFi..." while waiting for connection.
 * @param attempt  Current retry attempt number (1-based).
 */
void displayConnecting(int attempt) {
    oled.clearDisplay();
    oled.setTextSize(1);
    oled.setCursor(10, 18);
    oled.print(F("Connecting WiFi"));
    oled.setCursor(10, 32);
    oled.print(F("Attempt: "));
    oled.print(attempt);
    oled.display();
}

#endif // DISPLAY_H
