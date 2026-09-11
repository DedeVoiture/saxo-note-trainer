# Alto Saxophone Trainer MVP

## Build
- Create shared navigation and distinct Home, Exercises, Settings, and Note Recognition pages.
- Establish the selected warm-brass visual system with responsive, accessible controls and restrained motion.
- Add a central exercise registry so future exercises can be introduced without changing existing pages.

## Music and practice logic
- Define a beginner middle-register note dataset in French solfège with written pitch, concert pitch, frequency, and structured alto-sax fingering data.
- Isolate E♭ transposition, frequency/note conversion, cents comparison, random selection, scoring, stability, and trigger-lockout logic from the interface.
- Render a reusable, recognizable alto-sax fingering diagram from note data.

## Audio and settings
- Implement local Web Audio microphone capture with selectable input devices, device-change handling, volume gating, and YIN-style fundamental pitch detection.
- Start only after user permission; stop and release all audio resources cleanly; reconnect when the active input changes.
- Persist audio choice, fingering visibility, pitch tolerance, and stability settings in browser storage.

## Exercise experience
- Provide a clear pre-session screen, dominant target note, compact LIVE written-note readout, listening/error states, gentle success feedback, automatic next note, and no consecutive repeats.
- Track correct answers, attempts, streak, and accuracy during each session.

## Validation
- Verify page metadata, navigation, start/stop controls, preferences, desktop layout, and compact mobile layout in the browser.
- Check the final source with the project’s automated validation.
