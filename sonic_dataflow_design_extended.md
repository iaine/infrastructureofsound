# Sonic Dataflow Language & System Design (Extended, Research Version)

---

# 1. Conceptual Foundation

## 1.1 Core Idea

This project develops a system for analysing sound through its own infrastructures.

Rather than treating sound purely as signal, it is understood as:

- Material (formats like WAV, MP3, M4A)
- Infrastructural (protocols like Bluetooth, streaming)
- Computational (DSP, models, .so libraries)
- Interpretive (classification and semantic labelling)

The system enables **listening to these layers directly**.

---

## 1.2 Research Aim

1. Design a **Sonic Dataflow Language (SDL)**
2. Build a **runtime system** for executing flows
3. Develop **sonification strategies** for transformations
4. Enable **comparative listening across formats, protocols, and versions**

---

## 1.3 Key Principle

> The dataflow itself becomes the object of listening.

---

# 2. System Architecture

## 2.1 Layered Model

```
[Input Sources]
   ↓
[Capture Layer]
   ↓
[Signal Representation]
   ↓
[Protocol Layer]
   ↓
[Processing Layer]
   ↓
[Transformation Tracking]
   ↓
[Semantic Layer]
   ↓
[Sonification Layer]
   ↓
[Output + Logging]
```

---

# 3. Input Modalities

## 3.1 File Input
- Static
- Deterministic
- Enables exact comparisons

## 3.2 Microphone Input
- Real-time stream
- Context-responsive

## 3.3 Streaming Input
- Packet-based
- Includes jitter and buffering

## 3.4 Bluetooth Input
- Encoded (SBC/AAC)
- Packetised
- Lossy
- Temporal structure introduced

---

# 4. Sonic Dataflow Language (SDL)

## 4.1 Core Structure

```yaml
flow:
  id: unique_flow
```

---

## 4.2 Source

```yaml
source:
  type: file | microphone | stream | bluetooth
  uri: optional
  device: optional
```

---

## 4.3 Signal

```yaml
signal:
  sample_rate: 44100
  bitrate: 16bit
  channels: 2
  encoding: PCM | SBC | AAC
```

---

## 4.4 Node

```yaml
node:
  id: node_id
  type: dsp | model | codec | protocol | transport
  function: encode | decode | filter | classify | transmit
  implementation: path/to/lib.so
```

---

# 5. Protocol Layer (Bluetooth as First-Class)

## 5.1 Design Principle

Protocols are not hidden — they are explicit, modelled, and audible.

---

## 5.2 Protocol Stack

```yaml
protocol_stack:
  - name: bluetooth_a2dp
    transport: bluetooth
    codec: SBC
    profile: audio_stream
```

---

## 5.3 Protocol Nodes

### Encoding
```yaml
- id: bt_encoder
  type: protocol
  layer: encoding
  codec: SBC
  function: encode
```

### Packetisation
```yaml
- id: bt_packetizer
  type: protocol
  layer: packet
  function: packetize
```

### Transport
```yaml
- id: bt_transport
  type: protocol
  layer: transport
  function: transmit
```

### Decoding
```yaml
- id: bt_decoder
  type: protocol
  layer: decoding
  function: decode
```

---

# 6. Processing Layer

## DSP Nodes
```yaml
- id: filter
  type: dsp
  function: lowpass
```

## Model Nodes
```yaml
- id: classifier
  type: model
  function: classify
```

---

# 7. Transformations

```yaml
transformations:
  - from: WAV
    to: MP3

  - from: PCM
    to: SBC

  - from: stream
    to: packets
```

---

# 8. Observables

```yaml
observables:
  - packet_timing
  - jitter
  - packet_loss
  - spectral_loss
  - latency
```

---

# 9. Sonification

## Formats
- WAV → full spectrum
- MP3 → filtered
- SBC → granular

## Transformations
- bitrate ↓ → low-pass
- compression → noise

## Protocol
- packets → rhythm
- loss → clicks

## Classification
- label → pitch
- confidence → amplitude

---

# 10. FULL SDL Example

```yaml
flow:
  id: bluetooth_audio_flow

  source:
    type: file
    uri: file://input.wav

  signal:
    sample_rate: 44100
    encoding: PCM

  protocol_stack:
    - transport: bluetooth
      codec: SBC

  nodes:
    - id: bt_encoder
      type: protocol
      layer: encoding

    - id: bt_packetizer
      type: protocol
      layer: packet

    - id: bt_transport
      type: protocol
      layer: transport

    - id: bt_decoder
      type: protocol
      layer: decoding

    - id: classifier
      type: model
      function: classify

  transformations:
    - from: PCM
      to: SBC
    - from: stream
      to: packets

  observables:
    - packet_timing
    - jitter
    - packet_loss

  output:
    type: audio
    mode: sonified
```

---

# 11. Execution Model

```
SDL → Parser → Graph → Engine → Sonification → Output
```

---

# 12. Prototype Plan

Phase 1:
- file input
- MP3 encode
- simple classifier

Phase 2:
- SDL parsing
- graph system

Phase 3:
- streaming

Phase 4:
- Bluetooth protocols

---

# 13. Versioning & Comparison

- Compare flows over time
- Compare outputs
- Sonify differences

---

# 14. Key Design Decisions

1. Protocols are explicit
2. Transformations are first-class
3. Systems are audible
4. Graphs not pipelines

---

# 15. Final Insight

This is a language for hearing systems.

---

# 16. How to Use

Save as:

sonic_dataflow_design_extended.md

Use as research documentation, extend with SDL files, and version in Git.
