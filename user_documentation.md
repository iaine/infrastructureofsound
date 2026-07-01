# Chain Sonification Tool – User Guide

## Overview
This tool lets you explore audio-processing chains as sound.
Each node represents a processing module, and interacting with it produces sound.

## Getting Started
1. Open `index.html` in a browser
2. Click **Init Audio** (required due to browser audio policy)
3. Click or drag nodes on the canvas to hear sounds

## Controls
- **Init Audio**: Enables audio playback (user-triggered only)
- **Enable parameter mapping**: Activates parameter-driven sound shaping

## Interaction
- **Click node** → plays sound
- **Drag node** → moves it and plays sound

## Sound Mapping

### Stage → Pitch
- Capture stage → lower pitch
- DSP stage → higher pitch

### Graph Structure → Loudness
- More incoming connections = louder sound

### Operations → Timbre
- `aec` → echo/delay
- `agc` → compression
- `ns_` → noise layer

### Parameters (optional)
- `sample_rate` → pitch scaling
- `bitrate` → distortion
- `channel layout` → stereo width (future extension)

## Notes
- Audio is only triggered by user interaction (no autoplay)
- Works best in Chrome or Edge

## Possible Extensions
- Streaming audio graph playback
- Sankey diagram view
- Real-time analysis of actual audio traces

---
Generated documentation for Chain Sonification prototype.
