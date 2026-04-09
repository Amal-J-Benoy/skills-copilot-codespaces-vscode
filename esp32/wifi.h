/**
 * wifi.h — WiFi connection management
 *
 * Provides connect / reconnect helpers with retry logic.
 *
 * Depends on: config.h, display.h
 */

#ifndef WIFI_H
#define WIFI_H

#include <WiFi.h>
#include "config.h"
#include "display.h"

// ─────────────────────────────────────────
// Internal State
// ─────────────────────────────────────────
static bool _wifiConnected = false;

// ─────────────────────────────────────────
// Connection
// ─────────────────────────────────────────

/**
 * Attempt to connect to the configured WiFi network.
 *
 * Retries up to WIFI_MAX_RETRIES times, showing progress on the OLED.
 * Returns true if connection was established, false otherwise.
 */
bool wifiConnect() {
    DEBUG_PRINT(F("[WiFi] Connecting to: "));
    DEBUG_PRINTLN(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < WIFI_MAX_RETRIES) {
        delay(WIFI_RETRY_DELAY_MS);
        attempts++;
        DEBUG_PRINT(F("."));
        displayConnecting(attempts);
    }

    if (WiFi.status() == WL_CONNECTED) {
        _wifiConnected = true;
        DEBUG_PRINTLN();
        DEBUG_PRINT(F("[WiFi] Connected. IP: "));
        DEBUG_PRINTLN(WiFi.localIP());
        return true;
    }

    _wifiConnected = false;
    DEBUG_PRINTLN(F("\n[WiFi] Connection failed"));
    return false;
}

// ─────────────────────────────────────────
// Status Checks
// ─────────────────────────────────────────

/**
 * Return true if the ESP32 currently has a valid WiFi connection.
 */
bool wifiIsConnected() {
    return WiFi.status() == WL_CONNECTED;
}

/**
 * Reconnect to WiFi if the connection has dropped.
 * Call this periodically in the main loop.
 *
 * @return true if connection is active after this call.
 */
bool wifiEnsureConnected() {
    if (wifiIsConnected()) {
        return true;
    }

    DEBUG_PRINTLN(F("[WiFi] Connection lost — reconnecting..."));
    _wifiConnected = false;
    return wifiConnect();
}

/**
 * Return the current IP address as a String (empty if not connected).
 */
String wifiIPAddress() {
    if (wifiIsConnected()) {
        return WiFi.localIP().toString();
    }
    return String("Not connected");
}

/**
 * Gracefully disconnect from WiFi.
 */
void wifiDisconnect() {
    WiFi.disconnect(true);
    _wifiConnected = false;
    DEBUG_PRINTLN(F("[WiFi] Disconnected"));
}

#endif // WIFI_H
