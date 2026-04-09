# WIRING.md — Pin Assignments & Wiring Diagram

Complete wiring reference for the Smart Wearable Monitoring System.

---

## GPIO Pin Summary

| GPIO | Function | Component | Notes |
|------|----------|-----------|-------|
| 4 | DHT22 Data | DHT22 sensor | 10 kΩ pull-up to 3.3 V required |
| 21 | I2C SDA | OLED SSD1306 | I2C bus |
| 22 | I2C SCL | OLED SSD1306 | I2C bus |
| 25 | LED Output | LED indicator | 220 Ω series resistor to GND |
| 26 | Buzzer Output | Buzzer | Direct or via BC547 transistor |
| 27 | Vibration Motor | Motor via BC547 | Flyback diode (1N4007) required |
| 34 | ADC Input | ML8511 OUT | Input-only pin; no pull-up |
| 35 | ADC Input | Battery divider | Input-only pin; voltage divider |
| 3.3V | Power | DHT22 VCC, OLED VCC, ML8511 VCC/EN | |
| GND | Ground | All GND pins | Common ground |

---

## Wiring Diagram (ASCII)

```
                         ESP32 Dev Board
                     ┌─────────────────────┐
              3.3V ──┤ 3V3           GND   ├── GND (common ground)
                     │                     │
  DHT22 DATA ────────┤ GPIO4               │
                     │                     │
  OLED SDA ──────────┤ GPIO21 (SDA)        │
  OLED SCL ──────────┤ GPIO22 (SCL)        │
                     │                     │
  LED (+) ───────────┤ GPIO25              │
  BUZZER (+) ────────┤ GPIO26              │
  BC547 Base ────────┤ GPIO27              │
                     │                     │
  ML8511 OUT ────────┤ GPIO34 (ADC)        │
  Batt Divider ──────┤ GPIO35 (ADC)        │
                     └─────────────────────┘
```

---

## Component-by-Component Wiring

### DHT22 — Temperature & Humidity Sensor

```
DHT22 Pin 1 (VCC)  ──────── 3.3V
DHT22 Pin 2 (DATA) ──┬───── GPIO 4
                      └──── 10 kΩ ──── 3.3V  (pull-up resistor)
DHT22 Pin 3 (NC)   ──────── (not connected)
DHT22 Pin 4 (GND)  ──────── GND
```

**Notes**:
- A 10 kΩ resistor between the DATA pin and 3.3 V is required.
- Keep the wire short (< 20 cm) for reliable readings.

---

### ML8511 — UV Sensor

```
ML8511 VCC  ─────── 3.3V
ML8511 GND  ─────── GND
ML8511 EN   ─────── 3.3V  (enable pin — tie HIGH for normal operation)
ML8511 OUT  ─────── GPIO 34  (ADC input)
ML8511 3V3  ─────── (not used; internal reference — leave unconnected)
```

**Notes**:
- GPIO 34 is input-only on ESP32 — do **not** connect to a driving output.
- ADC reference is 3.3 V; do not exceed this on the OUT pin.
- Add a 100 nF decoupling capacitor between VCC and GND near the sensor.

---

### OLED SSD1306 — 128×64 Display (I2C)

```
OLED VCC ──────── 3.3V
OLED GND ──────── GND
OLED SDA ──────── GPIO 21
OLED SCL ──────── GPIO 22
```

**Notes**:
- I2C address is typically `0x3C` (some modules use `0x3D`).
- Update `OLED_ADDR` in `config.h` if needed.
- Most SSD1306 breakouts include built-in I2C pull-ups.

---

### LED — Visual Alert Indicator

```
GPIO 25 ──── 220 Ω ──── LED(+) Anode
                         LED(-) Cathode ──── GND
```

**Notes**:
- Use a 220 Ω resistor to limit current to ~10 mA at 3.3 V.
- Any standard 5 mm LED works (red recommended for alerts).

---

### Buzzer — Audio Alert

```
GPIO 26 ──── Buzzer (+)
             Buzzer (-) ──── GND
```

**Notes**:
- Use an **active** buzzer (generates tone on DC voltage).
- If the buzzer draws > 40 mA, drive it through a BC547 transistor:

```
GPIO 26 ──── 1 kΩ ──── BC547 Base
                        BC547 Collector ──── Buzzer (+)
                        BC547 Emitter  ──── GND
                        Buzzer (-)     ──── GND
```

---

### Vibration Motor — Haptic Alert

The vibration motor is an inductive load and **requires** a transistor driver and flyback diode.

```
GPIO 27 ──── 1 kΩ ──── BC547 Base (pin 1)
                        BC547 Collector (pin 3) ──── Motor (+)
                        BC547 Emitter   (pin 2) ──── GND

1N4007 Diode: Cathode (stripe) ──── 3.3V
              Anode           ──── Motor (+)
              (flyback protection — prevents voltage spike)

Motor (-) ──── GND
```

**Notes**:
- The 1N4007 diode is **essential** — without it, the motor's back-EMF
  can damage the ESP32.
- The BC547 base resistor (1 kΩ) limits base current to ~2.3 mA (adequate
  to saturate BC547 for motor currents up to ~100 mA).

---

### Battery Power Circuit

```
18650 Cell
  (+) ──── TP4056 B+
  (-) ──── TP4056 B-

TP4056 OUT+ ──── Rocker Switch ──── AMS1117-3.3V IN
TP4056 OUT- ──────────────────────── AMS1117-3.3V GND

AMS1117-3.3V OUT ──── ESP32 3V3
AMS1117-3.3V GND ──── ESP32 GND

TP4056 USB-C/Micro ──── 5V charger input
```

**Battery Voltage Divider for Level Monitoring**:
```
Battery (+) ──── R1 (100 kΩ) ──┬──── R2 (100 kΩ) ──── GND
                                └──── GPIO 35 (ADC)
```
This halves the battery voltage so it stays within the ESP32's 3.3 V ADC range.

---

## Power Requirements

| Component | Voltage | Typical Current |
|-----------|---------|-----------------|
| ESP32 (active + WiFi) | 3.3 V | 150–240 mA |
| DHT22 | 3.3 V | 1.5 mA |
| ML8511 | 3.3 V | < 1 mA |
| OLED SSD1306 | 3.3 V | 20 mA (full brightness) |
| LED | 3.3 V | 10 mA |
| Buzzer | 3.3 V | 20–30 mA |
| Vibration Motor | 3.3 V | 60–100 mA |
| **Total (peak)** | **3.3 V** | **~400–600 mA** |

**AMS1117-3.3V** is rated for 800 mA continuous — sufficient for this system.

---

## Breadboard Layout Tips

1. Use the breadboard's power rails for 3.3 V and GND distribution.
2. Place decoupling capacitors (100 nF) near each IC's power pin.
3. Keep DHT22 data wire away from motor wires to avoid noise.
4. Mount the vibration motor on a soft surface or use short leads to minimise vibration transmission to other connections.
5. Place the rocker switch on the positive rail from the TP4056 output.
