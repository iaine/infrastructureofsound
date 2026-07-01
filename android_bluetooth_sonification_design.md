# Android Bluetooth Sonification Engine Design (Complete)

---

# 1. Overview

This document describes a live, on-device sonification engine for Android that captures Bluetooth audio behaviour indirectly and renders it as sound in real time.

The design aligns with the Sonic Dataflow Language (SDL) and treats Bluetooth transmission as an audible process.

---

# 2. Key Design Principle

Android does not expose raw Bluetooth packets, so this system reconstructs protocol behaviour from observable audio and timing features.

→ Bluetooth is implemented as a perceptual and temporal system rather than a packet-level system.

---

# 3. System Architecture

```
Audio Source → AudioTrack → Bluetooth Stack → Headphones → Microphone Capture
                                                    ↓
                                          Analysis + Sonification
                                                    ↓
                                               Audio Output
```

---

# 4. Core Components

## 4.1 Audio Playback (Stimulus)

Used to send known signals through Bluetooth.

Examples:
- impulse trains (timing)
- chirps (spectral analysis)
- noise bursts (loss detection)

---

## 4.2 Audio Capture

Uses AudioRecord to capture environmental or loopback audio.

Captures:
- transmitted signal
- distortion
- timing irregularities

---

## 4.3 Analysis Engine

Processes audio in small frames (~10–50ms)

Extracts:
- jitter
- packet loss
- spectral loss
- latency

---

## 4.4 Feature Extraction (Observables)

### Jitter
Variation in timing between repeated events

### Packet loss
Detected as low-energy or missing segments

### Spectral loss
Loss of high frequencies due to SBC/AAC compression

### Latency
Delay between sent and received signal

---

# 5. Sonification Engine

## 5.1 Layered Sound Model

```
Base tone (signal)
+ jitter modulation
+ dropout clicks
+ spectral filtering
```

---

## 5.2 Mapping Strategy

- jitter → frequency modulation
- packet loss → impulse noise
- spectral loss → low-pass filtering
- latency → delay effect

---

## 5.3 Real-Time Constraints

- processing loop: 10–50ms
- latency budget: ~50ms total

---

# 6. Execution Loop

```
while running:
  capture buffer
  analyse features
  sonify features
  output audio
```

---

# 7. Threading Model

- capture thread
- analysis thread
- audio output thread

Optional: Kotlin coroutines for structured concurrency

---

# 8. SDL Integration

Runtime observables are mapped to SDL-compatible structure:

```yaml
observables:
  jitter: value
  packet_loss: events
  spectral_loss: centroid
```

---

# 9. Justifications

## 9.1 Use of Microphone Capture
- Android hides Bluetooth packets
- microphone captures real-world result of transmission

## 9.2 Frame-based Processing
- enables real-time behaviour
- aligns with audio buffering

## 9.3 Layered Sonification
- preserves continuous listening experience
- allows multiplexing multiple observables

## 9.4 Treating Protocol as Sound
- packet timing → rhythm
- loss → texture
- compression → timbre

---

# 10. Experimental Design

Recommended signals:
- impulse trains → jitter
- sine sweeps → spectral loss
- noise bursts → packet loss

---

# 11. Limitations

- no access to raw SBC frames
- indirect inference of packet behaviour
- environmental noise affects capture

---

# 12. Extensions

- external Bluetooth sniffers
- rooted audio loopback
- hybrid Android + Python system

---

# 13. Final Insight

This engine does not measure Bluetooth directly.

It renders Bluetooth as a perceptual, temporal, and sonic phenomenon.

---

# 14. How to Use

Save as:
android_bluetooth_sonification_design.md

Use as implementation guide and research reference.
