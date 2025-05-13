# Hapa Transcribe: UI/UX Specification

## Overview

This document outlines the user interface and experience design for Hapa Transcribe, a real-time transcription module for the Hapa ecosystem. The design follows Hapa's existing visual language while ensuring accessibility, usability, and intuitive interactions.

## Design Principles

1. **Minimalism**
   - Clean, uncluttered interfaces
   - Focus on content (transcript) with minimal distractions
   - Visual hierarchy emphasizing the most important elements

2. **Consistency with Hapa**
   - Match Hapa's existing color palette and typography
   - Use familiar interaction patterns from the parent application
   - Maintain consistent iconography and visual language

3. **Accessibility**
   - High contrast text for readability
   - Screen reader compatibility
   - Keyboard navigation support
   - Color schemes that accommodate color blindness

4. **Responsiveness**
   - Adapt gracefully between standalone and embedded modes
   - Support various screen sizes and orientations
   - Maintain usability across device types

## Color Palette

- **Primary**: `#2A2D34` (Dark slate for main UI elements)
- **Secondary**: `#5E6572` (Medium gray for secondary elements)
- **Accent**: `#5F9EA0` (Cadet blue for interactive elements)
- **Background**: `#F7F7F2` (Off-white for backgrounds)
- **Text**: `#0A0908` (Near-black for primary text)
- **Success**: `#4CAF50` (Green for success states)
- **Error**: `#F44336` (Red for error states)
- **Dark Mode Variations**:
  - Background: `#1E1E24`
  - Text: `#F7F7F2`
  - Accents: Brighter versions of standard colors

## Typography

- **Primary Font**: Inter (sans-serif)
- **Monospace Font**: Roboto Mono (for timestamps, etc.)
- **Font Sizes**:
  - Heading: 20px (1.25rem)
  - Subheading: 16px (1rem)
  - Body: 14px (0.875rem)
  - Small: 12px (0.75rem)
- **Line Heights**:
  - 1.5 for body text
  - 1.2 for headings

## Components

### 1. Transcription Panel

The main component displaying real-time transcriptions.

**States**:
- Idle (not transcribing)
- Listening (actively transcribing)
- Processing (brief moments of processing)
- Error (connection issues or other errors)

**Elements**:
- Transcript text area (scrollable)
- Speaker indicators (when available)
- Timestamp markers
- Auto-scroll toggle
- Copy/export buttons

![Transcription Panel Wireframe](../assets/wireframes/transcription-panel.png)

```html
<!-- Example structure -->
<div class="transcription-panel">
  <div class="transcription-header">
    <h2>Live Transcript</h2>
    <div class="controls">
      <button class="auto-scroll-toggle">Auto-scroll: ON</button>
      <button class="copy-button">Copy</button>
      <button class="export-button">Export</button>
    </div>
  </div>
  
  <div class="transcript-content">
    <div class="transcript-entry">
      <span class="speaker">Speaker 1</span>
      <span class="timestamp">00:12</span>
      <p class="text">Hello, this is an example of transcribed text.</p>
    </div>
    <div class="transcript-entry">
      <span class="speaker">Speaker 2</span>
      <span class="timestamp">00:15</span>
      <p class="text">This shows how multiple speakers would appear in the transcript.</p>
    </div>
    <!-- Additional transcript entries -->
  </div>
</div>
```

### 2. Audio Source Selector

Component for selecting the audio input source.

**Options**:
- Microphone (default)
- System audio
- Hapa P2P streams (when available)

**Elements**:
- Dropdown menu or icon buttons
- Audio level indicator
- Mute toggle

![Audio Source Selector Wireframe](../assets/wireframes/audio-source.png)

```html
<!-- Example structure -->
<div class="audio-source-selector">
  <label for="audio-source">Audio Source:</label>
  <select id="audio-source" class="audio-dropdown">
    <option value="microphone">Microphone</option>
    <option value="system">System Audio</option>
    <option value="hapa-stream">Hapa Meeting</option>
  </select>
  
  <div class="audio-level-indicator">
    <div class="level-bar" style="width: 65%;"></div>
  </div>
  
  <button class="mute-toggle">
    <i class="icon-microphone"></i>
  </button>
</div>
```

### 3. Control Bar

Main controls for starting/stopping transcription and accessing settings.

**Elements**:
- Start/Stop button (prominent)
- Settings button
- Save transcript button
- Status indicator

![Control Bar Wireframe](../assets/wireframes/control-bar.png)

```html
<!-- Example structure -->
<div class="control-bar">
  <div class="status-indicator">
    <span class="status-dot"></span>
    <span class="status-text">Ready</span>
  </div>
  
  <button class="primary-button start-stop-button">
    Start Transcription
  </button>
  
  <div class="secondary-controls">
    <button class="save-button">
      <i class="icon-save"></i>
    </button>
    <button class="settings-button">
      <i class="icon-settings"></i>
    </button>
  </div>
</div>
```

### 4. Settings Panel

Modal or sidebar component for configuring transcription settings.

**Settings**:
- Language preferences
- Storage location (Hyperdrive path)
- Auto-save options
- Display preferences
- Keyboard shortcuts

![Settings Panel Wireframe](../assets/wireframes/settings-panel.png)

```html
<!-- Example structure -->
<div class="settings-panel">
  <div class="settings-header">
    <h2>Settings</h2>
    <button class="close-button">×</button>
  </div>
  
  <div class="settings-content">
    <div class="settings-section">
      <h3>Language</h3>
      <select class="language-selector">
        <option value="auto">Auto-detect (Recommended)</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <!-- Additional languages -->
      </select>
    </div>
    
    <div class="settings-section">
      <h3>Storage</h3>
      <label>
        Save Location:
        <input type="text" value="/user/transcripts/" class="storage-path" />
      </label>
      <label class="checkbox-label">
        <input type="checkbox" checked class="auto-save" />
        Auto-save transcripts
      </label>
    </div>
    
    <!-- Additional settings sections -->
  </div>
</div>
```

### 5. Error States

Displays for various error conditions.

**Error Types**:
- Microphone access denied
- Connection lost
- Authentication failed
- API limits reached

![Error States Wireframe](../assets/wireframes/error-states.png)

```html
<!-- Example structure -->
<div class="error-notification">
  <div class="error-icon">
    <i class="icon-error"></i>
  </div>
  <div class="error-content">
    <h3 class="error-title">Microphone Access Denied</h3>
    <p class="error-message">
      Hapa Transcribe needs microphone access to transcribe audio.
      <a href="#" class="help-link">How to fix this</a>
    </p>
  </div>
  <button class="retry-button">Retry</button>
  <button class="close-button">×</button>
</div>
```

## User Flows

### 1. Starting a Transcription

1. User opens Hapa Transcribe (standalone or in Hapa)
2. System shows default audio source (last used)
3. User clicks "Start Transcription" button
4. System shows "Connecting..." status
5. On successful connection, status changes to "Transcribing"
6. Transcript begins to appear in the transcription panel

### 2. Changing Audio Source

1. User clicks on audio source dropdown
2. System displays available audio sources
3. User selects desired source
4. If transcription is active, system reconnects with new source
5. Status indicator briefly shows "Switching source..."
6. Transcription continues with new audio source

### 3. Saving a Transcript

1. User clicks "Save" button
2. System displays save dialog with options:
   - Default location (from settings)
   - Format options (Text, JSON)
   - Sharing permissions
3. User confirms save options
4. System encrypts and saves transcript
5. System shows confirmation message

### 4. Error Recovery

1. System encounters error (e.g., connection lost)
2. Error notification appears with specific message
3. User clicks "Retry" button
4. System attempts to reconnect/resolve the issue
5. On success, system resumes previous state
6. On continued failure, system provides more detailed error information

## Responsive Design

### Standalone Web App

- Full-width layout with all controls visible
- Transcript panel takes majority of screen space
- Settings accessible via modal dialog

### Embedded in Hapa (Electron)

- Compact layout to fit in `<webview>` container
- Collapsible controls to maximize transcript visibility
- Integration with Hapa's native dark/light mode

### Mobile Considerations

- Stack controls vertically when width is limited
- Larger touch targets for buttons
- Simplified layout for smaller screens

## Accessibility Guidelines

1. **Screen Readers**
   - Proper ARIA labels for all interactive elements
   - Semantic HTML structure
   - Meaningful alt text for icons and visuals

2. **Keyboard Navigation**
   - Tab order follows logical flow
   - Visible focus indicators
   - Keyboard shortcuts for common actions:
     - Start/Stop: Ctrl+Space
     - Save: Ctrl+S
     - Settings: Ctrl+,

3. **Visual Accessibility**
   - Minimum contrast ratio of 4.5:1 for text
   - Text size adjustable via browser controls
   - No critical information conveyed by color alone

## Animations & Transitions

- Subtle transitions between states (300ms duration)
- Audio level indicator with smooth animation
- Loading indicators for processing states
- No animations that might interfere with screen readers

## Implementation Notes

1. **Component Library**
   - Use React functional components with hooks
   - Implement reusable components for common elements
   - Follow atomic design principles (atoms, molecules, organisms)

2. **Styling Approach**
   - CSS Modules for component-specific styles
   - Global theme variables for consistency
   - Media queries for responsive design

3. **State Management**
   - React Context for global state (user preferences, connection status)
   - Local component state for UI-specific state
   - WebRTC state managed in dedicated service 