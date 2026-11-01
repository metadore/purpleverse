# PURPLEVERSE — THE ETERNAL

## Development report — 31 October 2026

### Current implementation

The existing app at `C:\Users\Hp\Documents\Codex\2026-10-31\files-pasted-by-the-user-project` now presents the user-provided 21-frame storyboard as the primary cinematic content. The PNGs are stored in `public/assets/screenshots/scene-001.png` through `scene-021.png`. `src/data/screenshotManifest.json` is the authoritative ordered manifest with chapter, title, dimensions, and transition style. The repeated final reference image is retained as two chronological frames because both were supplied.

`src/scene/ScreenshotStage.js` loads source PNGs as sRGB textures, contains each full frame without cropping, and uses a shader-driven particle transition at scene changes. At rest the screenshot is displayed as supplied; ornamental vignette and grain overlays are disabled for the story stage. A Three.js environment and particle field remain behind the screenshot as framing and interaction, rather than replacing the supplied artwork.

The five chapters are Awakening (frames 1–2), The Journey (3–10), Deep Sea (11–12), The Seven (13–17), and The Eternal (18–21). Navigation supports previous/next controls, left/right arrow keys, Space, and autoplay. Navigation preserves the complete order and stops at the ends. Gesture navigation retains mouse fallback; the MediaPipe worker receives transferable image bitmaps and performs inference away from the rendering thread. Camera permission is requested only when the user enables it.

### Verification results

- `npm run test:storyboard` — passed: 21 ordered PNGs, dimensions validated, 5.99 MiB total; one duplicate image pair identified and retained.
- `npm run test:gestures` — passed synthetic cases for open palm, fist, pinch, spread, victory, two-hand tracking, debounce, and cooldown.
- `npm run build` — passed. Vite emits a warning that the Three.js chunk is 523.94 kB minified (above its 500 kB advisory). The MediaPipe worker is a separate 127.12 kB emitted chunk.
- Browser walkthrough — all 21 frames loaded through the UI; previous/next and keyboard navigation were checked, autoplay advanced and paused, and no page alert or visible application error was observed. Individual browser captures are in `storyboard-captures/frame-001.png` through `frame-021.png`.
- MediaPipe worker smoke check — worker initialization and a synthetic blank-frame request completed and returned zero hands. Live webcam permission and actual live hand inference were not tested, because that requires an explicit camera grant from the user.

### Asset inventory and limitations

Present: all 21 supplied storyboard screenshots, local MediaPipe hand-landmarker model, and manifest metadata. No screenshot has been fabricated or intentionally omitted. Frames 20 and 21 are byte-identical source images and remain separate entries to preserve supplied ordering.

Not present / not applicable to this storyboard-led implementation: licensed soundtrack/audio track, `.riv` file, rigged member models, separate silhouette reference masks, and member-specific animation clips. The original BTS video screenshots communicate individual appearance and motion as still frames; this build does not claim to create animated or recognizable 3D BTS characters. Rive was not included because no Rive asset or state-machine contract was supplied. Audio remains optional and user-supplied locally.

The storyboard screenshots are central, but not yet a frame-accurate video playback system: the presentation uses timed shader reveals and manual/autoplay navigation. The images are shown at their original aspect ratio and contained within the viewport; on narrower viewports this leaves letterboxing. The supplied final two images duplicate one another. Camera-driven gesture controls need live-device validation. No frame-rate, GPU, accessibility, or cross-device profiling was performed.

### Engineering notes

The installed `threejs-expert` skill and relevant engineering guidance were consulted. The implementation uses explicit sRGB color space for source color textures, reuses a single Three.js scene/render loop, lazily caches nearby story textures, disposes textures when evicted, and uses worker-based MediaPipe inference to avoid synchronous detection work on the UI thread. The transition shader currently uses a Three.js material shader hook, which is WebGL-specific and should be revisited if the renderer moves to WebGPU/TSL. Further modularization and performance profiling remain advisable.

### Next actions

1. Validate camera permission, hand detection, and gesture navigation on the intended device.
2. Decide whether the story should run on a fixed authored timeline, remain user-controlled, or offer both modes; acquire a licensed audio track if synchronized playback is desired.
3. Profile frame time and memory on target devices; split or defer the Three.js chunk if startup performance requires it.
4. Test reduced-motion, keyboard-only, narrow-screen, and high-DPI behavior.
5. If animated character performance is a future requirement, request approved character art/models and animation assets. Do not infer individual identity from generic procedural figures.

## Critical purple visual redesign — 1 November 2026

Implemented in place after the screenshot-driven storyboard pass:

- Replaced scene-specific blue/teal canvas wallpaper with a single midnight-violet cosmic field, subtle nebulae, dust, fine orbital traces, and a seven-light constellation.
- Changed the application to open directly on the first complete storyboard frame. The contained frame uses 91% of the available viewport dimension while preserving its original aspect ratio.
- Removed the intro gate and reduced the toolbar to small icon controls. Progress and navigation remain available; camera remains opt-in.
- Replaced the screenshot reveal-mask transition with a GPU `Points` particle pass. The transition shader samples the actual outgoing/incoming screenshot textures. Outgoing pixel particles disperse with style-dependent spiral, radial burst, wave, and stardust motion; incoming image samples converge from a cosmic field. At rest, the untouched PNG texture is displayed directly.
- Connected hand position, pinch, two-hand spread, victory, and spread gestures to transition particles. Pointer movement and click retain mouse fallback.
- Raised the settled screenshot plane's depth-write so legacy character/particle formations stay behind the original screenshot. The seven background constellation points now use a circular glow shader.

### Verification status

- `npm run test:storyboard` — passed: 21 frames in order, source dimensions match, duplicate final pair retained.
- `npm run test:gestures` — passed: open palm, fist, pinch, spread, victory, two hands, debouncing and cooldown.
- `npm run build` — passed. Three.js bundle advisory remains at 526.81 kB minified.
- A pre-depth-fix browser screenshot revealed legacy silhouette particles overlaying the image and square constellation points; both causes were corrected in code. A new browser preview could not be opened after correction: the local browser connection to Vite timed out. Therefore the latest visual layering and pixel-particle dissolve have not yet had a post-fix screenshot verification. This is an explicit remaining check.
- Live camera gesture behavior and GPU/frame-time profiling remain unverified.

The rendering review followed the installed `threejs-expert` guidance: source color textures use sRGB, the image remains a texture rather than being altered, particle geometry is reused, and cached textures/geometries/materials are disposed. The custom GLSL pass is currently WebGL-specific.

Shader path review also corrected particle source/target selection: outgoing particles originate at the outgoing image UVs, while incoming particles converge to their target UVs. The seven manifest styles have explicit or distinct motion/flash behavior. The browser connection issue prevented visual confirmation after this correction.
