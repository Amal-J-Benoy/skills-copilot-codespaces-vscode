/**
 * alerts.h — LED, Buzzer, and Vibration Motor alert library
 *
 * Provides:
 *   - Alert level classification (NONE / WARNING / CRITICAL)
 *   - LED blink patterns
 *   - Buzzer beep sequences
 *   - Vibration motor pulses
 *   - Composite multi-sensory alert trigger
 *
 * Depends on: config.h, sensors.h
 */

#ifndef ALERTS_H
#define ALERTS_H

#include "config.h"
#include "sensors.h"

// ─────────────────────────────────────────
// Alert Level Enum
// ─────────────────────────────────────────
enum AlertLevel {
    ALERT_NONE     = 0,
    ALERT_WARNING  = 1,   // e.g. temperature 37–38 °C
    ALERT_CRITICAL = 2    // e.g. temperature > 38 °C
};

// ─────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────

/**
 * Configure output GPIO pins for LED, Buzzer, and Vibration Motor.
 * Must be called once in setup().
 */
void alertsInit() {
    pinMode(LED_PIN,    OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(VIBRO_PIN,  OUTPUT);

    // Ensure all outputs start LOW
    digitalWrite(LED_PIN,    LOW);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(VIBRO_PIN,  LOW);

    DEBUG_PRINTLN(F("[ALERTS] LED, Buzzer, Vibration Motor initialized"));
}

// ─────────────────────────────────────────
// Alert Level Classification
// ─────────────────────────────────────────

/**
 * Determine the highest alert level from a SensorData reading.
 *
 * Priority order: temperature > UV > humidity
 *
 * @param data  Latest sensor readings.
 * @return      Highest AlertLevel triggered.
 */
AlertLevel classifyAlert(const SensorData& data) {
    AlertLevel level = ALERT_NONE;

    if (data.tempValid) {
        if (data.temperature >= TEMP_HIGH_THRESHOLD)
            level = max((int)level, (int)ALERT_CRITICAL);
        else if (data.temperature >= TEMP_WARN_THRESHOLD)
            level = max((int)level, (int)ALERT_WARNING);
    }

    if (data.uvValid) {
        if (data.uvIndex >= UV_HIGH_THRESHOLD)
            level = max((int)level, (int)ALERT_CRITICAL);
        else if (data.uvIndex >= UV_WARN_THRESHOLD)
            level = max((int)level, (int)ALERT_WARNING);
    }

    if (data.humidityValid) {
        if (data.humidity >= HUMIDITY_HIGH_THRESHOLD)
            level = max((int)level, (int)ALERT_CRITICAL);
        else if (data.humidity >= HUMIDITY_WARN_THRESHOLD)
            level = max((int)level, (int)ALERT_WARNING);
    }

    return level;
}

/**
 * Build a short human-readable alert message based on sensor data.
 * The message is written into the provided buffer.
 *
 * @param data  Latest sensor readings.
 * @param buf   Output character buffer.
 * @param len   Size of buf.
 */
void buildAlertMessage(const SensorData& data, char* buf, size_t len) {
    buf[0] = '\0';

    if (data.tempValid && data.temperature >= TEMP_HIGH_THRESHOLD) {
        snprintf(buf, len, "HIGH TEMP %.1fC", data.temperature);
        return;
    }
    if (data.uvValid && data.uvIndex >= UV_HIGH_THRESHOLD) {
        snprintf(buf, len, "HIGH UV %.1f", data.uvIndex);
        return;
    }
    if (data.humidityValid && data.humidity >= HUMIDITY_HIGH_THRESHOLD) {
        snprintf(buf, len, "HIGH HUM %.0f%%", data.humidity);
        return;
    }
    if (data.tempValid && data.temperature >= TEMP_WARN_THRESHOLD) {
        snprintf(buf, len, "WARN TEMP %.1fC", data.temperature);
        return;
    }
    if (data.uvValid && data.uvIndex >= UV_WARN_THRESHOLD) {
        snprintf(buf, len, "WARN UV %.1f", data.uvIndex);
        return;
    }
    if (data.humidityValid && data.humidity >= HUMIDITY_WARN_THRESHOLD) {
        snprintf(buf, len, "WARN HUM %.0f%%", data.humidity);
        return;
    }
}

// ─────────────────────────────────────────
// LED Patterns
// ─────────────────────────────────────────

/**
 * Blink the LED a given number of times.
 *
 * @param times    Number of blink cycles.
 * @param onMs     Duration the LED is ON per cycle (ms).
 * @param offMs    Duration the LED is OFF per cycle (ms).
 */
void ledBlink(int times, int onMs, int offMs) {
    for (int i = 0; i < times; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(onMs);
        digitalWrite(LED_PIN, LOW);
        if (i < times - 1) delay(offMs);
    }
}

/**
 * Warning blink — slow, 3×.
 */
void ledWarning() {
    ledBlink(3, 300, 300);
}

/**
 * Critical blink — fast, 6×.
 */
void ledCritical() {
    ledBlink(6, 100, 100);
}

// ─────────────────────────────────────────
// Buzzer Sequences
// ─────────────────────────────────────────

/**
 * Generate a single buzzer beep.
 *
 * @param durationMs  Duration of the beep in ms.
 */
void buzzerBeep(int durationMs) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(durationMs);
    digitalWrite(BUZZER_PIN, LOW);
}

/**
 * Warning beep — two short beeps.
 */
void buzzerWarning() {
    buzzerBeep(200);
    delay(150);
    buzzerBeep(200);
}

/**
 * Critical alarm — three rapid beeps.
 */
void buzzerCritical() {
    for (int i = 0; i < 3; i++) {
        buzzerBeep(100);
        delay(80);
    }
}

// ─────────────────────────────────────────
// Vibration Motor Patterns
// ─────────────────────────────────────────

/**
 * Pulse the vibration motor.
 *
 * @param pulses     Number of pulses.
 * @param onMs       Duration motor is ON per pulse (ms).
 * @param offMs      Duration motor is OFF between pulses (ms).
 */
void vibroPulse(int pulses, int onMs, int offMs) {
    for (int i = 0; i < pulses; i++) {
        digitalWrite(VIBRO_PIN, HIGH);
        delay(onMs);
        digitalWrite(VIBRO_PIN, LOW);
        if (i < pulses - 1) delay(offMs);
    }
}

/**
 * Warning vibration — one medium pulse.
 */
void vibroWarning() {
    vibroPulse(1, 400, 0);
}

/**
 * Critical vibration — three short pulses.
 */
void vibroCritical() {
    vibroPulse(3, 150, 100);
}

// ─────────────────────────────────────────
// Combined Multi-Sensory Alert
// ─────────────────────────────────────────

/**
 * Trigger the appropriate multi-sensory alert sequence based on the level.
 *
 *  ALERT_NONE     — all outputs LOW (silent).
 *  ALERT_WARNING  — slow LED blink + double beep + single vibration.
 *  ALERT_CRITICAL — fast LED blink + rapid alarm + triple vibration.
 *
 * Note: This function is blocking for the duration of the alert sequence.
 *       Keep sequences short (< 2 s) to avoid blocking the main loop.
 *
 * @param level  Alert level returned by classifyAlert().
 */
void triggerAlert(AlertLevel level) {
    switch (level) {
        case ALERT_WARNING:
            DEBUG_PRINTLN(F("[ALERT] WARNING level triggered"));
            ledWarning();
            buzzerWarning();
            vibroWarning();
            break;

        case ALERT_CRITICAL:
            DEBUG_PRINTLN(F("[ALERT] CRITICAL level triggered"));
            ledCritical();
            buzzerCritical();
            vibroCritical();
            break;

        case ALERT_NONE:
        default:
            // Ensure all outputs are off
            digitalWrite(LED_PIN,    LOW);
            digitalWrite(BUZZER_PIN, LOW);
            digitalWrite(VIBRO_PIN,  LOW);
            break;
    }
}

/**
 * Low-battery alert — short single beep and LED flash.
 */
void triggerLowBatteryAlert() {
    DEBUG_PRINTLN(F("[ALERT] Low battery alert"));
    ledBlink(2, 500, 200);
    buzzerBeep(300);
    vibroPulse(1, 300, 0);
}

#endif // ALERTS_H
