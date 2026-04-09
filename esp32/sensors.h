/**
 * sensors.h — DHT22 + ML8511 sensor library
 *
 * Provides initialization and reading functions for:
 *   - DHT22 (Temperature & Humidity)
 *   - ML8511 (UV Index via analog ADC)
 *
 * Depends on: config.h, DHT sensor library (Adafruit)
 */

#ifndef SENSORS_H
#define SENSORS_H

#include <DHT.h>
#include "config.h"

// ─────────────────────────────────────────
// Sensor Data Structure
// ─────────────────────────────────────────
struct SensorData {
    float temperature;   // °C
    float humidity;      // %
    float uvIndex;       // 0–15 scale
    bool  tempValid;
    bool  humidityValid;
    bool  uvValid;
};

// ─────────────────────────────────────────
// Internal DHT22 instance
// ─────────────────────────────────────────
static DHT dht(DHT_PIN, DHT_TYPE);

// ─────────────────────────────────────────
// Float map helper (forward declaration)
// ─────────────────────────────────────────
float mapFloat(float x, float inMin, float inMax, float outMin, float outMax);

// ─────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────

/**
 * Initialize DHT22 and ML8511 sensors.
 * Must be called once in setup().
 */
void sensorsInit() {
    dht.begin();
    // ML8511 is a pure analog sensor — configure ADC pin
    analogReadResolution(12);          // 12-bit ADC (0–4095)
    analogSetAttenuation(ADC_11db);    // Full 0–3.3 V range
    DEBUG_PRINTLN(F("[SENSOR] DHT22 initialized on GPIO 4"));
    DEBUG_PRINTLN(F("[SENSOR] ML8511 initialized on GPIO 34"));
}

// ─────────────────────────────────────────
// DHT22 — Temperature & Humidity
// ─────────────────────────────────────────

/**
 * Read temperature from DHT22.
 *
 * @return Temperature in °C, or NAN on error.
 */
float readTemperature() {
    float t = dht.readTemperature();
    if (isnan(t)) {
        DEBUG_PRINTLN(F("[SENSOR] DHT22 temperature read failed"));
        return NAN;
    }
    return t;
}

/**
 * Read relative humidity from DHT22.
 *
 * @return Humidity in %, or NAN on error.
 */
float readHumidity() {
    float h = dht.readHumidity();
    if (isnan(h)) {
        DEBUG_PRINTLN(F("[SENSOR] DHT22 humidity read failed"));
        return NAN;
    }
    return h;
}

// ─────────────────────────────────────────
// ML8511 — UV Index
// ─────────────────────────────────────────

/**
 * Convert a raw 12-bit ADC reading to voltage.
 *
 * @param adcRaw  Raw ADC value (0–4095).
 * @return Voltage in V.
 */
float adcToVoltage(int adcRaw) {
    return (float(adcRaw) / UV_ADC_RESOLUTION) * UV_ADC_VOLTAGE_REF;
}

/**
 * Convert ML8511 output voltage to UV index.
 *
 * Linear interpolation between the calibration points defined in config.h.
 * Values below the minimum voltage are clamped to 0.
 * Values above the maximum voltage are clamped to UV_INDEX_MAX.
 *
 * @param voltage  Sensor output voltage in V.
 * @return UV index (0–15).
 */
float voltageToUVIndex(float voltage) {
    if (voltage <= UV_VOLTAGE_MIN) return 0.0f;
    if (voltage >= UV_VOLTAGE_MAX) return UV_INDEX_MAX;
    return mapFloat(voltage, UV_VOLTAGE_MIN, UV_VOLTAGE_MAX, 0.0f, UV_INDEX_MAX);
}

/**
 * Map a float value from one range to another (equivalent to Arduino map()
 * but for floating-point numbers).
 */
float mapFloat(float x, float inMin, float inMax, float outMin, float outMax) {
    return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Read UV index from ML8511 (averages 5 samples to reduce noise).
 *
 * @return UV index (0–15), or -1.0 on error.
 */
float readUVIndex() {
    const int SAMPLES = 5;
    long sum = 0;
    for (int i = 0; i < SAMPLES; i++) {
        sum += analogRead(UV_SENSOR_PIN);
        delay(10);
    }
    int adcRaw = sum / SAMPLES;

    if (adcRaw < 0 || adcRaw > 4095) {
        DEBUG_PRINTLN(F("[SENSOR] ML8511 ADC read out of range"));
        return -1.0f;
    }

    float voltage = adcToVoltage(adcRaw);
    float uvIdx   = voltageToUVIndex(voltage);

    DEBUG_PRINT(F("[SENSOR] ML8511 ADC="));
    DEBUG_PRINT(adcRaw);
    DEBUG_PRINT(F("  V="));
    DEBUG_PRINT(voltage, 3);
    DEBUG_PRINT(F("  UVIndex="));
    DEBUG_PRINTLN(uvIdx, 2);

    return uvIdx;
}

// ─────────────────────────────────────────
// Composite Reading
// ─────────────────────────────────────────

/**
 * Read all sensors and return a SensorData struct.
 * Individual validity flags are set when a reading is within plausible range.
 */
SensorData readAllSensors() {
    SensorData data;

    data.temperature = readTemperature();
    data.tempValid   = !isnan(data.temperature)
                       && (data.temperature > -40.0f)
                       && (data.temperature < 80.0f);

    data.humidity    = readHumidity();
    data.humidityValid = !isnan(data.humidity)
                         && (data.humidity >= 0.0f)
                         && (data.humidity <= 100.0f);

    data.uvIndex   = readUVIndex();
    data.uvValid   = (data.uvIndex >= 0.0f) && (data.uvIndex <= UV_INDEX_MAX);

    return data;
}

// ─────────────────────────────────────────
// Data Validation Helpers
// ─────────────────────────────────────────

/**
 * Return true if all sensor readings in the struct are valid.
 */
bool allSensorsValid(const SensorData& d) {
    return d.tempValid && d.humidityValid && d.uvValid;
}

/**
 * Print sensor readings to Serial (for debugging).
 */
void printSensorData(const SensorData& d) {
    DEBUG_PRINT(F("[SENSOR] Temp="));
    DEBUG_PRINT(d.tempValid ? d.temperature : -99.0f, 1);
    DEBUG_PRINT(F("°C  Humidity="));
    DEBUG_PRINT(d.humidityValid ? d.humidity : -99.0f, 1);
    DEBUG_PRINT(F("%  UVIndex="));
    DEBUG_PRINTLN(d.uvValid ? d.uvIndex : -1.0f, 2);
}

#endif // SENSORS_H
