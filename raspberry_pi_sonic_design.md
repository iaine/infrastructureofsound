# Raspberry Pi Bluetooth Sonification Engine Design (Complete)

---

# 1. Overview

This document describes a complete system design for running a **Bluetooth-aware sonic dataflow and sonification engine** on a Raspberry Pi 4 or 5 (≤8GB RAM).

The system:
- Captures Bluetooth audio
- Extracts protocol-related observables (jitter, packet loss, spectral changes)
- Sonifies those behaviours in real time
- Integrates with the Sonic Dataflow Language (SDL)

The design prioritises:
- Stability over speed
- Low memory usage
- Extensibility for research

---

# 2. Design Philosophy

## 2.1 Core Idea

The Raspberry Pi acts as a:

> **Transparent sonic infrastructure node**

Unlike mobile platforms, it allows:
- Access to audio routing
- Access to Bluetooth stack tools
- Real-time manipulation and inspection

---

## 2.2 Key Design Decisions

1. Use **frame-based processing** to minimise memory usage
2. Treat Bluetooth as a **temporal/audio phenomenon**, not just data
3. Use **simple DSP for stability**
4. Separate capture, analysis, and synthesis

---

# 3. System Architecture

```
[Audio Source / File / Mic]
        ↓
[ALSA / PipeWire]
        ↓
[Bluetooth Stack (BlueZ)]
        ↓
[Monitor Capture Stream]
        ↓
[Analysis Engine]
        ↓
[SDL Observables]
        ↓
[Sonification Engine]
        ↓
[Audio Output (USB audio interface)]
```

---

# 4. Hardware Requirements

Recommended setup:

- Raspberry Pi 4 or 5 (4GB–8GB RAM)
- USB audio interface (external sound card)
- Bluetooth adapter (onboard or USB)
- Optional: headphones/speakers + microphone

---

# 5. Software Stack

## 5.1 Operating System

```
Raspberry Pi OS Lite (64-bit)
```

---

## 5.2 Audio System

Preferred:

```
PipeWire
```

Install:

```
sudo apt install pipewire pipewire-audio-client-libraries
```

Alternative:
- PulseAudio

---

## 5.3 Python Environment

```
pip install numpy scipy sounddevice librosa soundfile pyyaml networkx
```

---

# 6. Bluetooth Integration

## 6.1 Device Discovery

List sinks:

```
pactl list sinks short
```

Look for:

```
bluez_sink.<device>.monitor
```

---

## 6.2 Audio Capture (Monitor Stream)

This captures decoded Bluetooth audio:

```
parec -d bluez_sink.<device>.monitor
```

---

## 6.3 Python Capture

```
import sounddevice as sd

stream = sd.InputStream(device="bluez_sink.<device>.monitor", samplerate=44100)
```

---

## 6.4 Optional: Packet-Level Observation

```
sudo btmon
```

Provides:
- packet timing
- retransmission data

---

# 7. Processing Pipeline

## 7.1 Frame-Based Processing

Process audio in small blocks (~1024 samples):

```
capture → analyse → sonify → output
```

Advantages:
- low memory usage
- stable operation

---

# 8. Observables Extraction

## 8.1 Jitter

Measured via timing variation:

```
intervals = np.diff(peaks)
jitter = np.std(intervals)
```

---

## 8.2 Packet Loss (Dropouts)

```
energy = np.sum(frame**2)
dropout = energy < threshold
```

---

## 8.3 Spectral Loss

```
centroid = librosa.feature.spectral_centroid(y=frame, sr=44100)
```

---

## 8.4 Latency (Optional)

```
cross_correlation → delay estimation
```

---

# 9. Sonification Engine

## 9.1 Design

Layered synthesis:

```
base tone
+ jitter modulation
+ dropout noise
+ spectral filtering
```

---

## 9.2 Example Synthesis

```
def synth(features):
    t = np.arange(1024)/44100
    signal = np.sin(2*np.pi*(220+features['spectral']*200)*t)

    signal += 0.1*np.sin(2*np.pi*(features['jitter']*50)*t)

    if features['dropout']:
        signal[:50] += np.random.randn(50)*0.4

    return signal
```

---

## 9.3 Output

```
sd.OutputStream(samplerate=44100)
```

---

# 10. Execution Loop

```
while True:
    frame = capture()
    features = analyse(frame)
    audio = synth(features)
    output(audio)
```

---

# 11. SDL Integration

Runtime observables:

```
observables = {
  'jitter': jitter,
  'packet_loss': count,
  'spectral_loss': centroid
}
```

SDL mapping:

```
observables:
  jitter: value
  packet_loss: events
```

---

# 12. Operational Modes

## Mode 1 — File vs Bluetooth

Compare direct vs transmitted audio

## Mode 2 — Live Environment

Mic → Bluetooth → analysis

## Mode 3 — Protocol Probe

Synthetic signals → measure system behaviour

---

# 13. Performance Strategy

- small buffers (<2048 samples)
- avoid full audio storage
- simple DSP

---

# 14. Extensions

- combine btmon + audio
- network streaming
- multi-device deployment

---

# 15. Limitations

- decoded audio only (not raw SBC)
- indirect packet inference unless btmon used

---

# 16. Final Insight

This system transforms the Raspberry Pi into:

> A real-time, inspectable, sonic representation of Bluetooth infrastructure

---

# 17. How to Use

Save as:

raspberry_pi_sonic_design.md

Use as:
- research documentation
- implementation guide
- SDL integration reference

