# CALIBRATION.md — Sensor Calibration Guide

Calibration reference for DHT22 and ML8511 sensors.

---

## DHT22 — Temperature & Humidity

The DHT22 is factory-calibrated and typically does not require field recalibration.

### Accuracy Specifications

| Parameter | Range | Accuracy |
|-----------|-------|----------|
| Temperature | −40 °C to +80 °C | ±0.5 °C |
| Humidity | 0–100 % RH | ±2–5 % RH |

### Offset Correction (if needed)

If you compare the DHT22 readings against a reference thermometer and find a consistent offset, add a correction constant in `sensors.h`:

```cpp
// Example: if DHT22 reads 0.5 °C high, subtract the offset
#define DHT_TEMP_OFFSET  -0.5f   // °C
#define DHT_HUM_OFFSET    0.0f   // %

// In readTemperature():
float t = dht.readTemperature() + DHT_TEMP_OFFSET;

// In readHumidity():
float h = dht.readHumidity() + DHT_HUM_OFFSET;
```

### Self-Heating

The ESP32 board itself generates heat. Mount the DHT22 at least 3–5 cm away from the ESP32 and any other heat-generating components for the most accurate ambient readings.

---

## ML8511 — UV Index

The ML8511 outputs an analog voltage proportional to UV irradiance (mW/cm²).  
The firmware converts this voltage to a UV index using linear interpolation.

### Voltage → UV Index Mapping

The calibration curve is based on the ML8511 datasheet and SparkFun's breakout board characterisation:

| Output Voltage (V) | UV Index (approx.) |
|---|---|
| 0.99 | 0 |
| 1.10 | 1 |
| 1.22 | 2 |
| 1.33 | 3 |
| 1.45 | 4 |
| 1.56 | 5 |
| 1.68 | 6 |
| 1.79 | 7 |
| 1.91 | 8 |
| 2.02 | 9 |
| 2.14 | 10 |
| 2.25 | 11 |
| 2.37 | 12 |
| 2.48 | 13 |
| 2.60 | 14 |
| 2.80 | 15 |
| ≥ 2.90 | 15 (clamped) |

### Calibration Constants in `config.h`

```cpp
#define UV_VOLTAGE_MIN  0.99f   // V at UV index 0
#define UV_VOLTAGE_MAX  2.90f   // V at UV index 15
#define UV_INDEX_MAX    15.0f
```

Adjust these if your module gives consistently high or low readings compared to a reference UV meter.

### Verifying Calibration

1. Place the sensor under direct outdoor sunlight at solar noon on a clear day.
2. Compare the displayed UV index with a certified UV meter or a weather service UV index report for your location.
3. If there is a consistent offset, scale `UV_VOLTAGE_MIN` and `UV_VOLTAGE_MAX` accordingly.

**Example**: If the firmware reads UV 5 but a reference reads UV 6, shift the calibration down:

```cpp
// Before
#define UV_VOLTAGE_MIN  0.99f
// After (shift the window slightly to scale up readings)
#define UV_VOLTAGE_MIN  0.93f
```

### ADC Noise Reduction

The firmware averages **5 ADC samples** with 10 ms between each reading. This reduces noise caused by:
- ESP32 ADC non-linearity (particularly below ~0.1 V and above ~3.2 V)
- Electrical noise from the motor or buzzer

For even better accuracy, add a 100 nF capacitor from the ML8511 OUT pin to GND on the breadboard.

### Serial Monitor Calibration Mode

To view raw ADC values and calculated voltage during calibration, check the Serial Monitor at 115200 baud. The sensor library logs:

```
[SENSOR] ML8511 ADC=1823  V=1.468  UVIndex=5.78
```

Use these values to fine-tune your calibration constants.

---

## Battery Level Calibration

### Voltage Divider Verification

The battery level calculation assumes equal resistors (R1 = R2 = 100 kΩ).  
If you use different values, update `config.h`:

```cpp
#define BATTERY_R1  100000.0f   // Ohms
#define BATTERY_R2  100000.0f   // Ohms
```

### Checking Full-Scale Reading

1. Charge the 18650 to 4.2 V (TP4056 green LED).
2. Open Serial Monitor and check the reported battery percentage — it should be close to **100 %**.
3. If it reads, e.g., 92 %, your resistors may not be exactly 100 kΩ. Measure them with a multimeter and update the constants.

### Voltage Thresholds

| Constant | Default | Meaning |
|---|---|---|
| `BATTERY_MAX_V` | 4.2 V | 100 % — fully charged 18650 |
| `BATTERY_MIN_V` | 3.0 V | 0 % — safe discharge cutoff |
| `BATTERY_LOW_THRESHOLD` | 20 % | Triggers low-battery alert |

---

## Alert Threshold Tuning

The default thresholds in `config.h` are based on occupational health guidelines. Adjust them to suit your specific use case:

```cpp
// Temperature
#define TEMP_WARN_THRESHOLD   37.0f  // °C — skin temperature warning
#define TEMP_HIGH_THRESHOLD   38.0f  // °C — fever / hyperthermia alert

// Humidity
#define HUMIDITY_WARN_THRESHOLD  65.0f  // %
#define HUMIDITY_HIGH_THRESHOLD  70.0f  // %

// UV Index (WHO scale)
#define UV_WARN_THRESHOLD    6.0f   // High UV
#define UV_HIGH_THRESHOLD    7.0f   // Very High UV
```

UV index risk levels (WHO):
| UV Index | Risk Level |
|---|---|
| 0–2 | Low |
| 3–5 | Moderate |
| 6–7 | High |
| 8–10 | Very High |
| 11+ | Extreme |
