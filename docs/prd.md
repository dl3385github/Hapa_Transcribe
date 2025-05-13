# Hapa Transcribe: Product Requirements Document

## Overview

Hapa Transcribe is a real-time, privacy-focused transcription module built for the Hapa decentralized ecosystem. It enables high-accuracy, low-latency audio transcription while maintaining the privacy and security principles of the Hapa architecture.

## Problem Statement

Current decentralized alternatives to centralized communication tools like Zoom/Otter.ai lack integrated AI transcription capabilities, creating a significant gap in the feature set needed for a complete decentralized collaboration experience.

## Solution

Hapa Transcribe bridges this gap by leveraging OpenAI's WebRTC API to provide accurate, real-time transcription within Hapa's peer-to-peer architecture, enhancing the collaboration experience while maintaining privacy and security.

## Target Audience

- Primary users of the Hapa.ai decentralized ecosystem
- Participants in Consul meetings (3-person collaboration units)
- Users requiring accessible alternatives to audio-only communication
- Privacy-conscious individuals who need transcription services

## Core Features

### 1. Audio Source Selection
- **Choose from multiple audio sources:**
  - Device microphone
  - System audio
  - Hapa P2P streams (from Consul meetings)
- **Default selection:**
  - Application remembers and defaults to the user's last-used source
  - Provides clear visual indication of current audio source

### 2. Real-Time Transcription
- **Live transcript display:**
  - Scrolling panel showing text as it's transcribed
  - Speaker identification when supported by OpenAI
  - Clear visual differentiation between speakers
- **Language support:**
  - Automatic language detection based on user preferences in Hapa profile
  - Support for multiple languages as provided by OpenAI's API

### 3. Ephemeral Token Handling
- **Secure API authentication:**
  - User authentication via Hapa's DID (Decentralized Identifier) system
  - Secure generation and handling of ephemeral OpenAI tokens
  - Transparent token expiry and renewal process

### 4. Transcript Management
- **Storage options:**
  - Save transcripts to Hyperdrive with user-defined permissions
  - Local storage for offline access
- **Export capabilities:**
  - Plain text format
  - JSON format with metadata (timestamps, speakers)
  - Copy to clipboard functionality

## Non-Functional Requirements

### Performance
- **Latency:** Less than 500ms end-to-end delay from speech to displayed text
- **Reliability:** 99.5% uptime during active transcription sessions
- **Accuracy:** Comparable to leading centralized transcription services

### Security
- Zero exposure of OpenAI API keys to client devices
- End-to-end encryption for stored transcripts
- No persistent storage of raw audio data

### Compatibility
- Works as standalone web application
- Embeddable in Hapa's Electron app via `<webview>` component
- Responsive design supporting desktop and mobile views

### Accessibility
- Screen reader compatible transcript interface
- Keyboard shortcuts for all major functions
- Color schemes compliant with WCAG 2.1 AA standards

## Success Metrics
- **Adoption rate:** % of Hapa users regularly using transcription
- **Accuracy:** User-reported satisfaction with transcription accuracy
- **Performance:** Average latency maintained below target threshold
- **Engagement:** Increased participation in Consul meetings by users who benefit from transcription 