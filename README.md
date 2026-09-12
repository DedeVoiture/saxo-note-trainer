# Saxophone Soloist

# Build a Web App for Learning Alto Saxophone

Build a modern, responsive web application for learning and practicing the **alto saxophone in E♭**.

The application should be designed from the beginning as a **modular saxophone-learning platform**. The long-term goal is to have multiple exercises, each potentially implemented as its own page/module.

For this first MVP, however, focus on making **one exercise extremely polished and functional**:

> **Play the displayed note on an alto saxophone and have the application recognize whether the correct note was played.**

The core interaction should be:

**See → Play → Detect → Correct → Next note**

The experience should feel like a dedicated practice tool rather than a generic website.

---

# 1. Application structure

Create a main application with a simple exercise system.

The initial navigation should include:

* Home
* Exercises
* Settings

The Exercises section should be structured so that more exercises can easily be added later.

For example:

```text
Exercises
├── Note Recognition
├── [Future Exercise]
├── [Future Exercise]
└── [Future Exercise]
```

The first exercise should have its own route:

`/exercises/note-recognition`

Do NOT build the application as a single hard-coded page.

Create reusable components and an exercise architecture so future exercises can have their own:

* page
* instructions
* note dataset
* scoring
* audio requirements
* settings
* exercise logic

Only implement the **Note Recognition** exercise for now.

---

# 2. Instrument

The application is specifically designed for:

**Alto saxophone in E♭**

All fingering diagrams should therefore represent standard **alto saxophone fingerings**.

The application must correctly handle the fact that an alto saxophone is a **transposing instrument**.

This is extremely important.

The note displayed to the user is the **written saxophone note**, while the microphone hears the **concert pitch** produced by the saxophone.

For example:

```text
Written alto saxophone note:
Do

        ↓

Expected concert pitch:
Mi♭

        ↓

Expected frequency:
~311 Hz
```

Therefore, the application must NOT simply compare the detected frequency with the frequency of the displayed written note.

Instead use:

```text
Target written note
        ↓
Alto saxophone E♭ transposition
        ↓
Expected concert pitch
        ↓
Expected frequency
        ↓
Audio pitch detection
        ↓
Detected concert pitch
        ↓
Convert detected concert pitch
to written alto saxophone note
        ↓
Compare with target
```

Keep this transposition logic separate from the UI.

This architecture should also make it possible to support other saxophones or instruments in the future.

---

# 3. First exercise: Note Recognition

The first exercise should display a random written alto-saxophone note.

The player must play that note on their physical saxophone.

The application listens through an audio input and detects the pitch.

When the correct note is detected, the application should:

1. Give immediate positive feedback.
2. Increment the correct-answer count.
3. Increase the current streak.
4. Automatically choose another random note.
5. Display the new note.

The user should NOT need to press a "Next" button.

The process should continue until the player presses **Stop Exercise**.

---

# 4. Notes displayed to the user

Use the **French/syllabic solfège system**.

The displayed note names should be:

* Do
* Ré
* Mi
* Fa
* Sol
* La
* Si

Use proper accents where appropriate.

The displayed note should be very large and be the dominant element of the screen.

Example:

```text
             SOL
```

The exact typography should be clean, modern, and highly readable.

---

# 5. Initial note range

For the MVP, do not immediately implement every possible alto saxophone note.

Start with a **beginner-friendly practical range** in the middle register.

The note dataset must nevertheless be structured so that additional notes can easily be added later.

For example:

```text
Note {
    id
    writtenName
    writtenPitch
    concertPitch
    concertFrequency
    fingering
}
```

Do not hard-code note information directly into the UI.

The note dataset should be the single source of truth.

The initial set of notes can be expanded later to include:

* accidentals
* higher notes
* lower notes
* alternate fingerings
* extended range

---

# 6. Random note selection

When the exercise starts, select a random note from the enabled note dataset.

After a correct answer, select another random note.

Do NOT select the same note twice consecutively.

The randomization logic should be isolated from the UI.

Eventually this should allow different randomization modes to be implemented.

---

# 7. Fingering diagram

Display a visual **alto saxophone fingering diagram** associated with the target note.

The diagram should clearly communicate which keys the player needs to press.

Do not use a generic piano keyboard or abstract button diagram.

The visual should be recognizably based on an alto saxophone.

Use a simplified, clean fingering-chart representation rather than an overly realistic illustration.

The diagram should visually distinguish:

* pressed keys
* unpressed keys
* relevant octave key
* palm keys where relevant
* other relevant fingering mechanisms

Create a reusable component:

```text
<FingeringDiagram fingering={targetNote.fingering} />
```

The fingering information itself should live in structured data.

For example:

```text
fingering: {
    leftIndex: true,
    leftMiddle: true,
    leftRing: true,
    rightIndex: false,
    rightMiddle: false,
    rightRing: false,
    octave: false
}
```

The exact data model can be improved if necessary.

The important requirement is that adding a new note should only require adding its fingering data rather than creating a new UI component.

---

# 8. Show / hide fingering

The user should be able to hide the fingering diagram.

Add a control such as:

**Show fingering**

When the fingering is visible:

**Hide fingering**

When hidden:

* the target note remains visible
* the audio detection continues
* the exercise behaves exactly the same
* only the fingering visualization disappears

This allows two modes of practice:

### Assisted mode

The player can see the fingering.

### Memory mode

The player must know the fingering without seeing it.

Persist this preference using localStorage so it remains after refreshing the page.

---

# 9. Audio input

The application must support different audio input devices.

There should be an **Audio Input** selector in the UI/settings.

The default should be the device's built-in microphone.

But the player must also be able to select an external audio source such as:

* USB microphone
* external microphone
* USB audio interface
* line input / AUX input
* other available audio capture devices

Important:

Do not assume the browser will literally label the device "AUX".

Instead, use the browser's available audio input devices through the MediaDevices API and display their available names.

Example:

```text
Audio Input

● Built-in Microphone
○ USB Audio Interface
○ External Microphone
```

If the user connects or disconnects an audio device, the available device list should update where possible.

---

# 10. Audio permissions

The user should explicitly start the audio exercise.

Before audio detection starts, show:

**Start Exercise**

When clicked:

1. Request audio permission if necessary.
2. Initialize the selected audio input.
3. Start the Web Audio processing.
4. Start pitch detection.
5. Change the button to:

**Stop Exercise**

Handle permission errors gracefully.

For example:

> We can't access this audio input. Check your browser permissions or select another input.

Do not expose raw browser error messages to the user.

---

# 11. Real-time pitch detection

Implement real-time pitch detection in the browser.

Use the Web Audio API and an appropriate fundamental-frequency detection algorithm, such as:

* YIN
* autocorrelation
* another reliable browser-compatible pitch-detection approach

The system should continuously analyze the incoming audio.

The processing pipeline should be:

```text
Audio Input
    ↓
Web Audio API
    ↓
Signal processing
    ↓
Fundamental frequency detection
    ↓
Concert pitch
    ↓
Written alto sax note
    ↓
Compare with target
```

Do not simply detect the loudest frequency because saxophone sounds contain many harmonics.

The system should attempt to identify the **fundamental frequency**.

Keep the pitch-detection engine separate from the React UI.

---

# 12. Pitch tolerance

The player should NOT need to play a perfectly tuned note.

For the initial MVP, use approximately:

**±50 cents**

as the acceptable pitch tolerance.

Make this value configurable in the code.

For example:

```text
PITCH_TOLERANCE_CENTS = 50
```

Later this could become a user setting or exercise-specific setting.

A note should be considered correct when the detected pitch is sufficiently close to the expected pitch after accounting for alto saxophone transposition.

---

# 13. Pitch stability

Do not accept a note from a single audio frame.

The application should require the detected pitch to remain sufficiently stable for a short period.

This prevents false positives from:

* noise
* transient attacks
* harmonics
* accidental sounds
* pitch-detection errors

For example, require the target pitch to be detected consistently for approximately **100–250 ms** before triggering success.

Make this value configurable.

---

# 14. Volume threshold

Do not attempt to recognize notes when the audio input is essentially silence.

Implement a minimum volume/amplitude threshold.

If the signal is too quiet:

```text
Play a note to begin
```

or:

```text
No clear signal
```

Do not incorrectly display a random detected note when there is no reliable audio.

---

# 15. Avoid repeated triggering

Once the correct note has been recognized:

1. Trigger the success event once.
2. Temporarily ignore the audio input for a short transition period.
3. Select the next note.
4. Resume detection.

This prevents one sustained saxophone note from triggering multiple successful answers.

---

# 16. Live detected note display

Add a small **live detection panel in one corner of the exercise screen**.

This is an important feature.

The main large note represents:

> **What the player is supposed to play**

The small live panel represents:

> **What the application is currently hearing**

For example:

```text
┌───────────────────────────────────────────────┐
│                                   LIVE        │
│                                   Sol         │
│                                               │
│                       MI                      │
│                                               │
│                [Fingering diagram]            │
│                                               │
└───────────────────────────────────────────────┘
```

The live detection panel should continuously update.

If the player plays:

`Sol`

the panel should display:

**Sol**

If they change to:

`Mi`

the panel should change to:

**Mi**

If there is no reliable pitch:

**—**

---

# 17. Live detection must use written alto-sax notation

The live detection panel should display the **written alto saxophone note**, not merely the concert-pitch note detected by the microphone.

For example:

```text
LIVE

Sol
```

Optionally, provide secondary technical information:

```text
LIVE

Sol

Concert: Mi♭
~311 Hz
+12 cents
```

The technical information should be visually secondary.

The most prominent item in the live panel should always be:

**Sol**

rather than:

**Mi♭**

This will make the live detector intuitive for a saxophone player.

---

# 18. Main exercise screen layout

Create a clean, focused practice interface.

Suggested structure:

```text
┌────────────────────────────────────────────────────┐
│ Saxo Trainer                         ⚙ Settings    │
│                                                    │
│                                      ┌───────────┐ │
│                                      │ LIVE      │ │
│                                      │           │ │
│                                      │ Sol       │ │
│                                      │ 392 Hz    │ │
│                                      └───────────┘ │
│                                                    │
│                       PLAY                         │
│                                                    │
│                         Mi                         │
│                                                    │
│                 [Saxophone diagram]               │
│                                                    │
│                    Listening...                    │
│                                                    │
│       Correct: 12    Streak: 5    Accuracy: 92%  │
│                                                    │
│                    Stop Exercise                  │
└────────────────────────────────────────────────────┘
```

The exact layout can be improved by the design system, but maintain this hierarchy:

1. Target note
2. Fingering diagram
3. Live detected note
4. Audio/listening status
5. Feedback
6. Statistics
7. Secondary controls

The target note must remain the dominant element.

---

# 19. Correct-answer feedback

When the player successfully plays the target note, show immediate positive feedback.

For example:

**✓ Correct!**

Use a subtle animation.

Then automatically transition to the next note.

The transition should be quick and should not interrupt the practice flow.

Do not require a click.

Possible sequence:

```text
Target:
Mi

Player plays Mi

→ ✓ Correct!

→ brief animation

→ new target:

Sol
```

---

# 20. Incorrect notes

Do not make incorrect notes overly punitive.

The player should be able to freely try again.

For example, if the target is:

**Mi**

and the player plays:

**Fa**

the application should simply continue listening.

The live detection panel can show:

**Fa**

while the main target remains:

**Mi**

Optionally provide very subtle feedback, but do not constantly flash "Wrong!" at the player.

The goal is practice, not punishment.

---

# 21. Exercise statistics

During the session, display:

* Correct
* Attempts
* Current streak
* Accuracy

Example:

```text
Correct: 18
Attempts: 21
Streak: 6
Accuracy: 86%
```

The statistics should update immediately.

Accuracy:

```text
correct / attempts × 100
```

Reset the session statistics when the player starts a new exercise session.

Structure the statistics so more advanced metrics can be added later.

---

# 22. Exercise start screen

Before the exercise begins, show a simple introduction.

Example:

```text
Note Recognition

Play the note shown on your alto saxophone.

The application will listen to your instrument
and automatically move to the next note
when you play the correct pitch.

[Start Exercise]
```

Also allow the player to choose their audio input.

Keep this screen simple.

---

# 23. Listening state

When the exercise is active, clearly indicate that the application is listening.

For example:

**● Listening**

with a subtle animated indicator.

Possible states:

### Inactive

`Audio detection inactive`

### Initializing

`Starting audio...`

### Listening

`Listening...`

### No signal

`Play a note to begin`

### Correct

`✓ Correct!`

### Error

`Audio input unavailable`

---

# 24. Optional pitch information

The live detection component can optionally display:

```text
Sol
392 Hz
+12 cents
```

where:

* `Sol` = written alto-saxophone note
* `392 Hz` = detected concert frequency
* `+12 cents` = deviation from the expected pitch

Keep this information visually subtle.

It could eventually evolve into a tuner feature.

---

# 25. Settings

Create a Settings page or settings panel.

Initial settings:

### Audio input

Select the available audio input device.

### Show fingering

Toggle:

`Show fingering by default`

### Pitch tolerance

Advanced setting.

Default:

`50 cents`

### Pitch stability

Advanced setting.

### Note range

Allow the enabled note range to eventually be configured.

For the MVP, it is acceptable to have the beginner range predefined while keeping the architecture ready for customization.

---

# 26. Data architecture

Keep all musical information in structured data.

For example:

```text
Note {
    id: string
    syllable: string
    writtenPitch: string
    midiNote: number
    concertMidiNote: number
    concertFrequency: number
    fingering: Fingering
}
```

And:

```text
Fingering {
    leftIndex: boolean
    leftMiddle: boolean
    leftRing: boolean

    rightIndex: boolean
    rightMiddle: boolean
    rightRing: boolean

    octaveKey: boolean

    palmKeys: ...
    sideKeys: ...
}
```

The exact schema can be improved if needed.

The critical requirement is that:

**note data, fingering data, transposition logic, audio detection, and UI should remain separated.**

---

# 27. Suggested code architecture

Use a modern React + TypeScript architecture.

A possible structure:

```text
src/

  components/
    NoteDisplay/
    FingeringDiagram/
    LivePitchDisplay/
    AudioInputSelector/
    AudioStatus/
    ExerciseStats/
    ExerciseControls/
    SuccessFeedback/

  exercises/
    noteRecognition/
      NoteRecognitionPage.tsx
      noteRecognitionLogic.ts
      noteRecognitionTypes.ts

  audio/
    audioInput.ts
    pitchDetector.ts
    pitchToNote.ts

  music/
    notes.ts
    altoSaxophone.ts
    transposition.ts
    fingerings.ts

  exercises/
    exerciseRegistry.ts

  settings/
    settingsStore.ts

  types/
    note.ts
    exercise.ts
    audio.ts
```

The exact structure can differ, but maintain the same separation of concerns.

---

# 28. Exercise registry

Create a central exercise registry.

Conceptually:

```text
exercises = [
    {
        id: "note-recognition",
        title: "Note Recognition",
        description: "...",
        route: "/exercises/note-recognition",
        component: NoteRecognitionPage
    }
]
```

The Exercises page should render exercises from this registry.

This will make it easy to add future exercises without restructuring the application.

---

# 29. Future exercises

Do not implement these yet.

But the architecture should support future exercises such as:

* Identify a note by ear
* Play the displayed note
* Play a sequence of notes
* Interval training
* Scale exercises
* Rhythm exercises
* Fingering memorization
* Articulation exercises
* Speed exercises
* Ear training
* Sight-reading exercises

Each future exercise should be able to have its own logic and configuration.

---

# 30. Responsive design

The application should work well on:

* desktop
* laptop
* tablet
* mobile

Desktop should be particularly polished because the player may use the application next to their music stand while playing the saxophone.

On mobile:

* target note remains extremely large
* fingering diagram scales correctly
* live detection panel remains visible but compact
* controls remain easy to tap

Do not allow the live detection panel to overlap or obscure the target note.

---

# 31. Visual design

The visual identity should feel like a **modern music-learning application**.

Design characteristics:

* minimal
* elegant
* focused
* modern
* calm
* slightly playful
* professional
* generous whitespace

Avoid the appearance of a generic SaaS dashboard.

The main exercise should feel almost like a digital instrument.

The user should immediately understand:

**This is the note I need to play.**

Avoid unnecessary cards and visual clutter.

---

# 32. Animation

Use subtle animations for:

* starting the exercise
* audio becoming active
* live pitch detection
* correct answer
* changing to the next note

For example, the target note could have a very subtle transition when changing.

The success animation should be satisfying but brief.

Avoid excessive animations that could distract someone while playing an instrument.

---

# 33. Accessibility

Implement:

* semantic HTML
* keyboard-accessible controls
* visible focus states
* good contrast
* accessible labels
* ARIA labels where appropriate

Do not rely exclusively on color for correct/incorrect states.

For example, use:

**✓ Correct**

rather than communicating success only through green.

---

# 34. Error handling

Handle gracefully:

* microphone permission denied
* no audio input available
* audio device disconnected
* selected input becomes unavailable
* browser does not support required APIs
* Web Audio initialization failure
* very low volume
* unreliable pitch
* pitch detection failure

Use musician-friendly messages.

Example:

> We can't hear an audio signal. Check your input volume or select another audio device.

Not:

> AudioContext initialization failed.

Technical errors can be logged for debugging but should not be the primary user-facing message.

---

# 35. Audio lifecycle

When the user presses **Stop Exercise**:

* stop pitch detection
* stop audio processing
* release microphone/audio streams
* close or suspend unnecessary audio resources
* remove event listeners
* reset the listening state

Do not leave the microphone running after the exercise has stopped.

When starting again, correctly reinitialize the audio system.

---

# 36. Device switching

If the user switches audio input:

1. Stop/release the current audio stream.
2. Initialize the new selected device.
3. Reconnect the pitch detector.
4. Resume listening.

The UI should clearly show the currently selected device.

---

# 37. Local storage

Use localStorage for lightweight preferences such as:

* selected audio input where technically possible
* show/hide fingering preference
* user settings

Do not put sensitive data into localStorage.

No user account is required for the MVP.

---

# 38. No unnecessary backend

The MVP does not need a backend for the core exercise.

The essential functionality should work directly in the browser:

```text
Browser
   ↓
Audio Input
   ↓
Web Audio API
   ↓
Pitch Detection
   ↓
Alto Sax Transposition
   ↓
Exercise Logic
   ↓
UI
```

Avoid introducing a backend unless it is genuinely required.

The app should be able to perform the pitch analysis locally in the browser.

---

# 39. Important distinction between target and detection

This distinction must be extremely clear throughout the UX.

### Target

Large central display:

**Mi**

Meaning:

> "This is what you need to play."

### Live detection

Small corner display:

**Fa**

Meaning:

> "This is what the application currently hears."

Therefore, if the target is Mi and the player plays Fa:

```text
TARGET

Mi


LIVE

Fa
```

The target should remain Mi until the player correctly plays Mi.

This is one of the most important UX requirements.

---

# 40. MVP acceptance criteria

The MVP should be considered complete only when all of the following work:

### Exercise

* User can open `/exercises/note-recognition`.
* A written alto saxophone note is displayed.
* The note uses French solfège.
* The note comes from a structured dataset.
* The next note is selected randomly.
* The same note cannot appear twice consecutively.

### Fingering

* Correct alto saxophone fingering is displayed.
* Fingering comes from structured data.
* User can show/hide the fingering.
* Fingering preference can persist.

### Audio

* User can select an audio input.
* Built-in microphone works.
* External audio input devices can be selected.
* Browser audio permissions are handled.
* Audio can be started and stopped cleanly.

### Pitch detection

* Application detects the fundamental pitch.
* Detection is real-time.
* Volume threshold prevents obvious false positives.
* Pitch stability prevents transient false positives.
* Pitch tolerance is approximately ±50 cents.
* Detection correctly accounts for E♭ alto saxophone transposition.

### Live detection

* A small corner panel shows the currently detected written alto saxophone note.
* It updates in real time.
* It displays `—` when no reliable pitch is detected.
* Optional frequency/cents information can be shown.
* It does not replace or confuse the main target note.

### Exercise progression

* Correct pitch triggers success.
* Success increments statistics.
* A short success animation appears.
* A new random target appears automatically.
* The user does not need to click Next.
* Sustained notes cannot trigger multiple answers.

### Statistics

Display:

* Correct
* Attempts
* Streak
* Accuracy

### UX

* User can start and stop the exercise.
* Audio is released when stopped.
* Errors are handled gracefully.
* Interface is responsive.
* Interface is visually clean and focused.

### Architecture

* Exercise logic is separated from UI.
* Audio logic is separated from UI.
* Pitch detection is separated from UI.
* Alto saxophone transposition is separated from UI.
* Note data is separated from UI.
* Fingering data is separated from UI.
* New exercises can be added without rewriting the existing exercise.

---

# 41. Final product principle

Do not overbuild the MVP.

The most important experience is:

```text
             TARGET
                ↓
               Sol

        [fingering diagram]

             🎙 LIVE
                ↓
               Sol

           ✓ Correct!

                ↓

             TARGET
                ↓
                Mi
```

The application should feel **instant, responsive, and musical**.

The player should spend almost all of their time playing the saxophone, not interacting with the website.

Build the architecture for a larger learning platform, but make the first exercise — **alto saxophone note recognition** — exceptionally simple and polished.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://saxo-note-trainer.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b537183c-e560-40f6-843e-09002b28968f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
