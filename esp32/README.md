# ESP32 Firmware — Smart Wearable Monitoring System

A production-ready, well-commented ESP32 Arduino firmware for a wearable health-monitoring device.  
Reads **temperature**, **humidity**, and **UV index**; displays them on an OLED; triggers audio/visual/haptic alerts; and POSTs data to a Node.js backend every 10 seconds.

---

## 🛠️ Hardware Components

| Category | Component | Notes |
|---|---|---|
| Core | ESP32 Dev Board | Any standard 38-pin board |
| Sensor | DHT22 | Temperature + Humidity |
| Sensor | ML8511 | UV Index (analog output) |
| Display | OLED SSD1306 128×64 | I2C interface |
| Output | LED | GPIO 25 — visual alert |
| Output | Buzzer | GPIO 26 — audio alert |
| Output | Vibration Motor | GPIO 27 via BC547 transistor |
| Power | 18650 Li-Ion Cell | ~2600 mAh |
| Power | TP4056 Module | Li-Ion charger |
| Power | AMS1117-3.3V | Voltage regulator |
| Power | Rocker Switch | Main power switch |
| Support | BC547 Transistor | Motor/buzzer driver |
| Support | 1N4007 Diode | Flyback protection (motor) |
| Support | Resistors | Pull-up / current-limiting |

See **WIRING.md** for the complete circuit diagram.

---

## 📝 Project Structure

```
esp32/
├── firmware/
│   └── wearable_monitor.ino   # Main sketch (entry point)
├── config.h                   # WiFi, server, GPIO, thresholds
├── sensors.h                  # DHT22 + ML8511 library
├── display.h                  # OLED SSD1306 library
├── alerts.h                   # LED + Buzzer + Vibration library
├── wifi.h                     # WiFi connection & retry
├── api.h                      # HTTP POST to backend
├── README.md                  # This file
├── WIRING.md                  # Pin assignments & wiring diagram
└── CALIBRATION.md             # ML8511 calibration guide
```

---

## 📋 Software Setup

### 1. Arduino IDE

- Download from: https://www.arduino.cc/en/software

### 2. ESP32 Board Support

1. Arduino IDE → **File → Preferences**
2. Add to "Additional Boards Manager URLs":  
   `https://dl.espressif.com/dl/package_esp32_index.json`
3. **Tools → Board → Board Manager** → search **esp32** → Install  
   *(by Espressif Systems, v2.x or v3.x)*

### 3. Required Libraries

Install via **Sketch → Include Library → Manage Libraries**:

| Library | Author | Purpose |
|---|---|---|
| DHT sensor library | Adafruit | DHT22 reading |
| Adafruit Unified Sensor | Adafruit | Sensor abstraction |
| Adafruit SSD1306 | Adafruit | OLED display |
| Adafruit GFX Library | Adafruit | Display graphics |
| ArduinoJson | Benoit Blanchon | JSON serialisation |

Built-in (no install needed): `WiFi`, `HTTPClient`

---

## ⚙️ Configuration

Open **`esp32/config.h`** and update these values before uploading:

```cpp
// WiFi
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// Backend server (must be on the same local network)
#define SERVER_IP       "192.168.1.100"
#define SERVER_PORT     5000

// Unique device identifier
#define DEVICE_ID       "ESP32-WORKER-001"
```

All GPIO pins and alert thresholds are also in `config.h`.

---

## 🚀 Upload Firmware

1. Open `esp32/firmware/wearable_monitor.ino` in Arduino IDE  
   *(all `*.h` files must be in `esp32/` — one level above the sketch)*
2. **Tools → Board** → **ESP32 Dev Module**
3. **Tools → Port** → select the COM/tty port for your board
4. Click **Upload** (→)
5. Open **Serial Monitor** at **115200 baud** to view live logs

---

## 📡 Data Transmission

**Frequency**: Every 10 seconds  
**Endpoint**: `POST http://{SERVER_IP}:{SERVER_PORT}/api/sensor-data`

**JSON payload**:
```json
{
  "deviceId":     "ESP32-WORKER-001",
  "temperature":  36.5,
  "humidity":     55.0,
  "uvIndex":       5.2,
  "batteryLevel": 85
}
```

---

## 📊 Sensor Details

### DHT22 — Temperature & Humidity
- Temperature range: −40 °C to +80 °C (±0.5 °C)
- Humidity range: 0–100 % RH (±2–5 %)
- Interface: Single-wire digital
- Sampling rate: once every ~2 seconds (hardware limit)

### ML8511 — UV Index
- Output: Analog voltage (0–3.3 V → UV index 0–15)
- Interface: Analog ADC (GPIO 34)
- Averaging: 5 samples per reading to reduce noise
- See **CALIBRATION.md** for voltage–UV index mapping

---

## 🔔 Alert System

| Condition | Level | LED | Buzzer | Vibration |
|---|---|---|---|---|
| Temp ≥ 38 °C | CRITICAL | 6× fast blink | 3 rapid beeps | 3 short pulses |
| UV ≥ 7 | CRITICAL | 6× fast blink | 3 rapid beeps | 3 short pulses |
| Humidity ≥ 70 % | CRITICAL | 6× fast blink | 3 rapid beeps | 3 short pulses |
| Temp 37–38 °C | WARNING | 3× slow blink | 2 beeps | 1 long pulse |
| UV 6–7 | WARNING | 3× slow blink | 2 beeps | 1 long pulse |
| Humidity 65–70 % | WARNING | 3× slow blink | 2 beeps | 1 long pulse |
| Battery ≤ 20 % | LOW BATT | 2× blink | 1 beep | 1 pulse |

---

## 🔍 Serial Monitor Output

```
=== Wearable Monitor v1.0 ===
[DISPLAY] SSD1306 initialized
[ALERT] LED, Buzzer, Vibration Motor initialized
[SENSOR] DHT22 initialized on GPIO 4
[SENSOR] ML8511 initialized on GPIO 34
[WiFi] Connecting to: MY_NETWORK
[WiFi] Connected. IP: 192.168.1.105
[MAIN] Setup complete — entering main loop
[SENSOR] Temp=36.5°C  Humidity=54.0%  UVIndex=3.20
[MAIN] Battery: 87%
[API] POST http://192.168.1.100:5000/api/sensor-data  body={...}
[API] Response: 201
[MAIN] Data sent successfully
```

---

## 🔋 Power Consumption & Battery Life

| State | Current Draw |
|---|---|
| Active (sensors + WiFi) | ~180–240 mA |
| WiFi transmit peak | ~300 mA |
| Display + sensors only | ~80–100 mA |

**Estimated battery life with 2600 mAh 18650**:
- Continuous operation: ~8–12 hours
- Extended (increase `SEND_INTERVAL_MS` to 60 s): ~18–24 hours

---

## 🐛 Troubleshooting

### Cannot upload sketch
- Use a **data** USB cable (not charge-only)
- Install **CH340** or **CP2102** USB-to-Serial driver
- Hold **BOOT** button while clicking Upload, release after upload starts

### OLED shows nothing
- Check SDA→GPIO 21, SCL→GPIO 22
- Run an I2C scanner sketch to confirm address (0x3C or 0x3D)
- Confirm 3.3 V power to display

### DHT22 reads NaN
- Verify data pin → GPIO 4 with a 10 kΩ pull-up to 3.3 V
- Wait ≥ 2 s between reads (firmware already handles this)

### ML8511 always reads 0
- Confirm analog pin GPIO 34 is connected to ML8511 OUT
- GPIO 34 is input-only on ESP32 — do not configure as OUTPUT
- Verify 3.3 V supply to ML8511 EN pin

### WiFi not connecting
- Confirm 2.4 GHz network (ESP32 does not support 5 GHz)
- Check SSID/password in `config.h`

### Data not appearing in dashboard
- Verify `SERVER_IP` and `SERVER_PORT` in `config.h`
- Confirm backend server is running and accessible from ESP32's network

---

## 📚 Library Documentation

- [Adafruit DHT Sensor Library](https://github.com/adafruit/DHT-sensor-library)
- [Adafruit SSD1306](https://github.com/adafruit/Adafruit_SSD1306)
- [ArduinoJson](https://arduinojson.org/)
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/)