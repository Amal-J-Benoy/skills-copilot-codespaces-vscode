# ESP32 Firmware - Smart Wearable Monitoring System

## 🛠️ Hardware Requirements

- **ESP32 Development Board**
- **MLX90614** (Infrared Temperature Sensor)
- **VEML6075** (UV Sensor)
- **USB Cable** (for programming)
- **Jumper Wires**
- **Power Supply** (5V)

## 📦 Wiring Diagram

```
ESP32          MLX90614    VEML6075
GND    ------> GND         GND
3.3V   ------> VCC         VCC
GPIO21 (SDA) -> SDA        SDA
GPIO22 (SCL) -> SCL        SCL
```

## 📋 Software Setup

### 1. Arduino IDE Installation
- Download from: https://www.arduino.cc/en/software
- Install Arduino IDE

### 2. ESP32 Board Support
- In Arduino IDE: File → Preferences
- Add URL: `https://dl.espressif.com/dl/package_esp32_index.json`
- Tools → Board → Board Manager → Search "esp32" → Install

### 3. Required Libraries

Install via Arduino IDE (Sketch → Include Library → Manage Libraries):

```
- MLX90614 by SparkFun Electronics
- VEML6075 by Adafruit
- WiFi (built-in)
```

## 📝 Project Structure

```
esp32/
├── main/
│   └── main.ino           # Main sketch
├── wifi.h                 # WiFi configuration
├── sensors.h              # Sensor initialization
├── api.h                  # API communication
└── README.md              # This file
```

## ⚙️ Configuration

Edit `main.ino` with your credentials:

```cpp
// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend Server
const char* serverAddress = "192.168.x.x"; // Backend IP
const int serverPort = 5000;

// Device ID
const char* deviceId = "ESP32_001";
```

## 📡 Data Transmission

**Frequency**: Every 5 seconds

**Data Format**:
```json
{
  "deviceId": "ESP32_001",
  "temperature": 36.5,
  "uvIndex": 5.2
}
```

**Endpoint**: `POST http://{backend-ip}:5000/api/sensor-data`

## 🚀 Upload Firmware

1. Connect ESP32 via USB
2. Select Board: Tools → Board → ESP32 Dev Module
3. Select Port: Tools → Port → COM port
4. Click Upload button
5. Monitor Serial (9600 baud) for logs

## 📊 Sensor Readings

### MLX90614 (Temperature)
- Range: -40°C to 125°C
- I2C Address: 0x5A
- Reading interval: ~100ms

### VEML6075 (UV)
- Range: 0-15 UV Index
- I2C Address: 0x10
- Reading interval: ~50ms

## 🔍 Serial Monitor Output

```
[INFO] Starting WiFi connection...
[INFO] Connected to WiFi: MY_NETWORK
[INFO] IP Address: 192.168.1.100
[INFO] MLX90614 initialized
[INFO] VEML6075 initialized
[INFO] Sending data: {temp: 36.5, uv: 5.2}
[INFO] Response: 200 OK
[ERROR] Failed to connect to backend
```

## 🐛 Troubleshooting

### Device not uploading
- Check USB cable (data cable, not charging only)
- Install CH340 drivers for USB-to-Serial

### No sensor readings
- Verify I2C connections
- Check Address with I2C scanner
- Reinstall sensor libraries

### WiFi not connecting
- Verify SSID and password
- Check 2.4GHz WiFi (5GHz not supported)
- Check router firewall

### Data not reaching backend
- Verify backend is running
- Check IP address and port
- Check firewall/NAT rules

## 🔋 Power Consumption

- Active: ~150-200mA
- Deep Sleep: ~10mA
- WiFi TX: ~300mA peak

For battery operation, consider:
- Increase reading interval to 30-60 seconds
- Implement deep sleep mode
- Use larger capacity battery

## 📚 Library Documentation

- [Adafruit MLX90614](https://learn.adafruit.com/adafruit-mlx90614-contactless-ir-thermometer)
- [Adafruit VEML6075](https://learn.adafruit.com/adafruit-veml6075-uv-index-sensor)
- [ESP32 WiFi](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/network/esp_wifi.html)