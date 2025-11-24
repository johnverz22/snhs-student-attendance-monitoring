# IP Address Visual Guide

## The Simple Answer

```
┌─────────────────────────────────────────────────────────────┐
│  Are you testing on a PHYSICAL PHONE?                      │
│                                                             │
│  YES → Use: http://192.168.100.83:3000/api                │
│                                                             │
│  NO (Emulator/Simulator) → See below                       │
└─────────────────────────────────────────────────────────────┘
```

## Visual Network Diagram

### Physical Phone Setup (What You Need!)

```
┌──────────────────────────────────────────────────────────────┐
│                      Your WiFi Network                       │
│                                                              │
│  ┌─────────────────┐              ┌──────────────────┐     │
│  │   Your Mac      │              │  Physical Phone  │     │
│  │                 │              │                  │     │
│  │  Server running │◄────WiFi────►│  Flutter App     │     │
│  │  on port 3000   │              │                  │     │
│  │                 │              │  Uses:           │     │
│  │  IP: 192.168.   │              │  192.168.100.83  │     │
│  │      100.83     │              │                  │     │
│  └─────────────────┘              └──────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘

✅ Phone connects to Mac's real IP address on the WiFi network
✅ Both devices must be on the SAME WiFi network
```

### Android Emulator Setup (Different!)

```
┌──────────────────────────────────────────────────────────────┐
│                       Your Mac                               │
│                                                              │
│  ┌─────────────────┐              ┌──────────────────┐     │
│  │   Server        │              │  Android         │     │
│  │   localhost     │              │  Emulator        │     │
│  │   port 3000     │              │                  │     │
│  │                 │              │  Flutter App     │     │
│  │                 │◄──Virtual───►│                  │     │
│  │                 │   Network    │  Uses:           │     │
│  │                 │              │  10.0.2.2        │     │
│  │                 │              │  (maps to host)  │     │
│  └─────────────────┘              └──────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘

✅ Emulator uses special virtual network
✅ 10.0.2.2 is a magic address that means "host machine"
❌ This does NOT work on physical phones!
```

## The Key Difference

### Physical Phone
```
Phone → WiFi Router → Your Mac (192.168.100.83)
        Real network connection
```

### Android Emulator
```
Emulator → Virtual Network → Host (10.0.2.2 = localhost)
           Simulated connection
```

## What Each IP Address Means

### 192.168.100.83
```
┌────────────────────────────────────────┐
│  Your Mac's REAL IP on WiFi network   │
│                                        │
│  ✅ Works from: Physical phones        │
│  ✅ Works from: Other computers        │
│  ✅ Works from: Tablets                │
│  ❌ Doesn't work from: Emulators       │
│  ❌ Doesn't work from: Your Mac itself │
│     (macOS routing quirk)              │
└────────────────────────────────────────┘
```

### 10.0.2.2
```
┌────────────────────────────────────────┐
│  Android Emulator's special address   │
│                                        │
│  ✅ Works from: Android emulator ONLY  │
│  ❌ Doesn't work from: Physical phones │
│  ❌ Doesn't work from: iOS simulator   │
│  ❌ Doesn't work from: Other devices   │
│                                        │
│  This is NOT a real IP address!        │
│  It's a virtual address that only      │
│  exists inside the emulator.           │
└────────────────────────────────────────┘
```

### localhost / 127.0.0.1
```
┌────────────────────────────────────────┐
│  Loopback address (same machine)      │
│                                        │
│  ✅ Works from: iOS simulator          │
│  ✅ Works from: Your Mac's browser     │
│  ❌ Doesn't work from: Physical phones │
│  ❌ Doesn't work from: Android emulator│
└────────────────────────────────────────┘
```

## Decision Tree

```
Start: What device are you using?
│
├─► Physical Android Phone
│   └─► Use: http://192.168.100.83:3000/api
│
├─► Physical iPhone
│   └─► Use: http://192.168.100.83:3000/api
│
├─► Android Emulator (Android Studio)
│   └─► Use: http://10.0.2.2:3000/api
│
└─► iOS Simulator (Xcode)
    └─► Use: http://localhost:3000/api
```

## Testing Checklist

### Before Running Your Flutter App:

1. **Find your LAN IP**
   ```bash
   npm run network
   ```
   Look for: `192.168.100.83` (or similar)

2. **Test from phone's browser**
   - Open Safari/Chrome on your phone
   - Visit: `http://192.168.100.83:3000/health`
   - Should see: `{"status":"ok",...}`

3. **Update Flutter config**
   - File: `student_app/lib/config/api_config.dart`
   - Change to: `http://192.168.100.83:3000/api`

4. **Rebuild and run**
   ```bash
   cd student_app
   flutter clean
   flutter run
   ```

## Common Mistakes

### ❌ WRONG: Using 10.0.2.2 on Physical Phone
```dart
// This will NOT work on a physical phone!
static const String baseUrl = 'http://10.0.2.2:3000/api';
```
**Error**: Connection refused / Network unreachable

### ✅ CORRECT: Using LAN IP on Physical Phone
```dart
// This WILL work on a physical phone!
static const String baseUrl = 'http://192.168.100.83:3000/api';
```

## Summary Table

| Device | IP to Use | Why |
|--------|-----------|-----|
| 📱 Physical Android | `192.168.100.83` | Real WiFi network |
| 📱 Physical iPhone | `192.168.100.83` | Real WiFi network |
| 🖥️ Android Emulator | `10.0.2.2` | Virtual network |
| 🖥️ iOS Simulator | `localhost` | Shares host network |

## Remember

**10.0.2.2 = Android Emulator ONLY**
**192.168.100.83 = Physical Phones**

If you're debugging on a physical Android phone, you MUST use your Mac's LAN IP (192.168.100.83), not 10.0.2.2!
