# PURPLEVERSE — THE ETERNAL

## Screenshot-Driven, Gesture-Controlled Cinematic Universe

You are working on PURPLEVERSE, an immersive interactive 3D experience inspired by BTS's *We Are Bulletproof: The Eternal* music video.

I want to fundamentally evolve the existing application into a cinematic, gesture-controlled experience using my ORIGINAL music-video screenshots as the primary visual content.

This is not a request to create another generic particle demo.

The screenshots are the actual visual foundation of this experience. Three.js, MediaPipe, shaders, and animations must work together to bring those screenshots to life.

---

# 1. FIRST: INSPECT THE EXISTING PROJECT

Before modifying anything:

1. Locate the actual existing PURPLEVERSE application.
2. Read the existing `PURPLEVERSE_VISUAL_AUDIT.md` and `DEVELOPMENT_REPORT.md`, if available.
3. Inspect the complete React/Vite/Three.js architecture.
4. Read and follow the installed `threejs-expert` skill, including relevant core instructions, references, and examples.
5. Inspect existing particle systems, shaders, scene management, gesture recognition, and animation code.
6. Preserve existing working functionality wherever possible.

Do not create a duplicate application.

Do not replace the existing architecture unnecessarily.

Do not delete working features simply to rebuild them differently.

---

# 2. ORIGINAL SCREENSHOTS ARE THE MASTER STORYBOARD

I have already prepared multiple screenshots from the original music video.

They are arranged in this chat in their intended chronological, scene-by-scene order.

These screenshots define the visual narrative.

CRITICAL REQUIREMENTS:

* Preserve their exact chronological order.
* Do not rearrange scenes.
* Do not omit supplied screenshots.
* Do not invent additional scenes.
* Do not replace screenshots with AI-generated images.
* Do not redraw the people.
* Do not stylize or reinterpret the original imagery.
* Do not change faces, clothing, poses, colors, backgrounds, or composition.
* Do not merge separate screenshots into collages.
* Preserve the original image files and their quality.

The original screenshots must remain visually faithful to their source.

IMPORTANT: Images pasted in a ChatGPT conversation are not automatically available to the local Cursor workspace. First inspect the project assets directory. If the screenshots are not present, create a clearly documented asset-import structure and request the original files. Never silently substitute placeholders.

Suggested structure:

`public/assets/screenshots/`

Use sequential filenames:

`scene-001.jpg`
`scene-002.jpg`
`scene-003.jpg`

Continue numbering according to the original storyboard.

Create a manifest containing:

* Image filename
* Sequence number
* Scene group
* Original dimensions
* Transition into the next screenshot
* Optional animation configuration

The sequence must be data-driven so I can add more screenshots later without rewriting the application.

---

# 3. THE CENTRAL EXPERIENCE

The entire experience should feel like entering a beautiful, emotional, interactive universe.

Visual direction:

* Deep black and midnight-purple environment.
* Glowing violet and lavender particles.
* Delicate white stardust.
* Beautiful light trails.
* Soft volumetric light.
* Atmospheric depth.
* Cinematic transitions.
* Subtle cosmic movement.
* Premium visual quality.

Avoid excessive UI elements.

The experience should occupy the entire screen.

The screenshots must be the main visual focus.

The particle universe should surround, reveal, and transition between them.

---

# 4. SCREENSHOT REVEAL AND TRANSITION ENGINE

Every screenshot must have a cinematic entrance and exit.

Do not simply switch images using CSS opacity.

Create an actual transition system using Three.js particles, shaders, and GSAP.

Each screenshot should follow this lifecycle:

### A. Screenshot entrance

* Particles begin gathering.
* A purple light forms around the image.
* Thousands of particles converge.
* The screenshot gradually becomes visible.
* The image reaches its original, undistorted appearance.

### B. Screenshot presentation

* Display the original screenshot at high quality.
* Preserve aspect ratio.
* Never stretch or crop important content.
* Use a subtle surrounding particle atmosphere.
* Keep the screenshot itself unchanged.
* Allow gestures to influence surrounding particles.

### C. Screenshot exit

When the appropriate gesture is detected:

* The image begins dissolving.
* Its visual presence breaks into glowing particles.
* Particles scatter, swirl, or move into a galaxy-like formation.
* The next screenshot is revealed through the particles.

Create several transition styles:

1. Purple Stardust Dissolve
2. Galaxy Spiral
3. Particle Explosion
4. Light Wave Reveal
5. Converging Star Formation
6. Floating Sparkle Transition
7. Cosmic Flash Transition

Assign different transitions to different scene boundaries.

Avoid repeating the exact same transition every time.

Use deterministic transitions so the experience remains visually coherent.

The original screenshot must eventually be displayed faithfully after every reveal.

---

# 5. MEDIAPIPE GESTURE CONTROL

Use Google MediaPipe Tasks Vision Hand Landmarker.

Use 21 hand landmarks and support both hands.

MediaPipe should control the experience, not the screenshots.

Implement:

| Gesture             | Interaction                            |
| ------------------- | -------------------------------------- |
| Open palm           | Reveal the next screenshot             |
| Closed fist         | Trigger screenshot dissolve            |
| Pinch               | Attract nearby particles               |
| Spread fingers      | Trigger particle explosion             |
| Move hand left      | Influence particles towards the left   |
| Move hand right     | Influence particles towards the right  |
| Move hand upwards   | Lift particles                         |
| Move hand downwards | Pull particles downwards               |
| Two hands apart     | Expand the particle universe           |
| Two hands together  | Compress the particle formation        |
| Victory sign        | Trigger a special purple sparkle burst |

Additional requirements:

* Smooth landmark coordinates.
* Use confidence thresholds.
* Implement gesture debouncing.
* Add cooldowns to prevent repeated accidental transitions.
* Avoid triggering multiple scene changes from one continuous gesture.
* Track hand position continuously.
* Support both left and right hands.
* Handle camera permissions properly.
* Display an understandable error if tracking cannot initialize.
* Never activate the webcam without explicit user permission.
* Do not transmit webcam footage externally.

IMPORTANT:

The gesture system must not block the rendering loop.

Use asynchronous inference or a worker-based approach where appropriate. Avoid excessive synchronous inference that freezes the experience.

---

# 6. SCENE NAVIGATION

The screenshots must form one continuous chronological experience.

Implement:

* Next screenshot
* Previous screenshot
* Gesture navigation
* Keyboard navigation
* Mouse fallback
* Automatic transition playback as an optional mode

Do not make the experience dependent exclusively on webcam access.

Provide a subtle interface showing:

* Current scene number
* Total screenshots
* Current scene title, where known
* Camera tracking status
* Audio status

The interface should not distract from the visuals.

---

# 7. THREE.JS PARTICLE ENGINE

Improve the existing particle engine instead of replacing it unnecessarily.

Requirements:

* GPU-based particle rendering.
* Efficient BufferGeometry or appropriate GPU simulation.
* Custom GLSL shaders.
* Dynamic particle movement.
* Particle attraction and repulsion.
* Smooth movement influenced by hand landmarks.
* Different particle behaviors for different transitions.
* Depth and perspective.
* Additive glow.
* Purple and white particle variations.
* Controlled particle density.
* Adaptive quality based on device performance.

Particles should feel organic, delicate, magical, and cinematic.

Avoid making the entire experience look like a generic sci-fi dashboard.

---

# 8. CINEMATIC STORYTELLING

Use the screenshot sequence to preserve the original music-video narrative.

Do not impose a newly invented storyline.

Group screenshots into logical sections based on their actual content.

If the sequence includes:

* Awakening
* The Journey
* Deep Sea
* The Seven
* The Eternal

Use these as scene group labels only when supported by the supplied screenshots.

Create smooth transitions between scene groups.

The emotional quality should come from the original imagery, carefully timed transitions, atmosphere, and music.

---

# 9. AUDIO

Create an optional audio system.

Requirements:

* Local audio file support.
* Play/pause.
* Volume control.
* Audio-reactive particle intensity.
* Subtle particle pulses synchronized with audio amplitude.
* Graceful behavior when no audio file is supplied.

Do not bundle copyrighted music without authorization.

Do not let audio analysis interfere with MediaPipe or rendering performance.

---

# 10. VISUAL QUALITY

This must look like a finished artistic experience, not a college demonstration.

Prioritize:

* Smooth animations.
* Beautiful particle transitions.
* Consistent visual language.
* Cinematic timing.
* Appropriate negative space.
* Rich but restrained purple lighting.
* Responsive rendering.
* No unnecessary interface clutter.
* No visible debug elements in the final experience.

Use GSAP for orchestrating transitions.

Use Three.js for rendering and particle simulation.

Use Rive only where a real animation asset adds value. Do not introduce empty or nonfunctional Rive placeholders.

---

# 11. PERFORMANCE AND RELIABILITY

The experience must:

* Run smoothly on a typical laptop.
* Adapt particle counts to hardware.
* Avoid unnecessary allocations in animation loops.
* Dispose of unused textures and geometries.
* Clean up MediaPipe resources.
* Handle WebGL context loss.
* Handle webcam permission denial.
* Handle missing screenshot assets.
* Handle missing audio.
* Support different screen sizes.
* Avoid memory leaks during repeated transitions.

Use loading states and meaningful error messages.

---

# 12. TESTING REQUIREMENTS

Do not declare the project complete merely because it builds.

Test:

1. Every screenshot loads.
2. The screenshot order matches the manifest.
3. Original aspect ratios are preserved.
4. Every transition completes correctly.
5. Previous and next navigation work.
6. Gestures trigger the correct interactions.
7. Gesture cooldowns work.
8. Camera denial does not crash the application.
9. Mouse and keyboard fallback work.
10. Audio works when supplied.
11. No console errors remain.
12. Repeated scene transitions do not cause memory leaks.

If webcam hardware is unavailable, test using synthetic landmark inputs and clearly distinguish simulated testing from real webcam verification.

---

# 13. DEVELOPMENT PROCESS

Work in stages, but do not stop after producing a planning document.

Stage 1: Inspect the existing project and screenshot assets.

Stage 2: Build the screenshot manifest and chronological scene loader.

Stage 3: Implement screenshot presentation and preserve image fidelity.

Stage 4: Implement the cinematic particle transition engine.

Stage 5: Integrate MediaPipe gestures with screenshot navigation.

Stage 6: Add audio and finishing effects.

Stage 7: Optimize, test, and polish the complete experience.

After every stage, verify that existing functionality still works.

If the screenshots are unavailable, do not fabricate them. Complete the reusable infrastructure and clearly identify the files needed from me.

---

# 14. FINAL DELIVERABLE

I expect a fully functioning PURPLEVERSE experience.

At completion, provide:

1. Actual application location.
2. Updated architecture.
3. Screenshot manifest and sequence.
4. Implemented gesture mapping.
5. Implemented transition effects.
6. Testing results.
7. Performance observations.
8. Remaining limitations.
9. Assets still required from me.
10. A development report.

Include screenshots or recordings of the actual implemented experience wherever possible.

Do not claim that a feature works if it has only been simulated.

---

# FINAL CREATIVE DIRECTION

PURPLEVERSE should feel like stepping inside the memories of *We Are Bulletproof: The Eternal*.

The original screenshots are sacred visual references.

The particles are the magic connecting them.

The hands are the controller.

Every gesture should feel intentional.

Every transition should feel beautiful.

Every screenshot should remain faithful to the original.

Build an immersive cinematic experience, not another generic particle visualization.
