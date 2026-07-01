# Sonic Dataflow Language & System Design

## Purpose and Concept
This project develops a language and system for analysing sound about sound.

Key ideas:
- Medium-specific sound analysis (formats, protocols)
- Tracking transformations (bitrate, sampling, encoding)
- Sonifying dataflows themselves

## Architecture

[Input] → [Capture] → [Signal Representation] → [Processing Nodes] → [Transform Tracking] → [Semantic Layer] → [Sonification] → [Output]

## Core Entities

### Source
- type: microphone | file | stream | bluetooth
- format: wav | mp3 | m4a | raw | aac
- uri: device path or URL

### Signal
- sample_rate
- bitrate
- channels
- encoding

### Node
- type: dsp | model | codec | transport
- implementation: .so file
- function: filter | classify | encode

### Transformation
Tracks changes such as format, bitrate, sampling

### Link
Optional URL reference for models or processes

## Sonification

### Format Icons
- WAV: full spectrum
- MP3: compressed artefacts
- Bluetooth: rhythmic packet glitches

### Transform Mapping
- Bitrate ↓ → high frequency loss
- Compression → noise artefacts
- Sampling change → pitch/time shift

## Inputs
- File
- Microphone
- Stream
- Bluetooth protocol-aware input

## Versioning
Each flow is versioned and comparable over time.

## Next Steps
- Build minimal pipeline
- Define DSL formally
- Implement first sonic icons
