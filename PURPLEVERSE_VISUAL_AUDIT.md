# PURPLEVERSE — Visual and Artistic Audit

**Audit date:** 31 October 2026  
**Overall artistic verdict:** The implementation is a usable interactive particle prototype, but it does not yet deliver the original character-led, cinematic tribute.  
**Visual alignment with the supplied references:** Low.  
**Scope:** Source review, live browser inspection of all five chapters, and comparison with both supplied reference frames. No application source was modified.

## Scope and location note

The requested target folder, `C:\Users\Hp\purpleverse`, was empty at the start of this audit. The existing implementation inspected is in `C:\Users\Hp\Documents\Codex\2026-10-31\files-pasted-by-the-user-project`; the open `http://127.0.0.1:5173/` experience was also inspected. This report is the only file created in the requested target folder. The application was not rebuilt or copied here because this turn explicitly said not to modify the project yet.

## Executive assessment

The app has a coherent dark-purple interface, functional scene selection, a reusable point-cloud renderer, procedural point targets, pointer interaction, optional local audio, and a MediaPipe hand-tracking path. That is a sound prototype foundation.

The artistic result is far from the references. The first reference is a painterly, layered, dreamlike stage: seven small silhouettes stand on a bright platform beneath a star field, colored cloud banks, a strong beam of light, and a suspended geometric object. The second reference is a stylized running tableau with seven individually colored, readable characters, varied body poses, and a blue car in a textured urban setting. The app currently has no platform, horizon, cloudscape, beam, car, city, painted texture, character model, or member-specific visual identity. It substitutes generic white or violet particle formations on a mostly black background.

The app therefore feels like a polished control surface around a particle demo, not like entering the world depicted by the references. The UI is restrained and legible, but the particle art is not yet carrying the story.

| Area | Assessment | Evidence |
|---|---|---|
| Cinematic opening | Weak | The start screen is typographic with CSS orbit rings. Starting enters a broad cosmic point field; seven figures do not slowly emerge from darkness. |
| Silhouettes | Weak | Figures are generated from sampled line segments and a circular head. In the browser they read as fuzzy vertical marks rather than convincing human forms. |
| Character distinction | Weak | Seven targets have slightly different poses and widths, but no individual model, color, costume, face, motion, or other identity cue. |
| Running chapter | Fails the story beat | The seven formations are static point arrangements with scatter. They do not visibly run. |
| Underwater chapter | Partial | The field shifts to blue and contains a central dissolving shape, but it reads as a blue particle cloud with a bright vertical smudge rather than a deep ocean descent. |
| Scene transitions | Partial | Scene target values tween over 1.8 seconds, but the same camera and graphic language remain throughout; chapter identity mostly comes from changing particle targets and UI text. |
| Finale | Partial | The final target is a purple elliptical particle mass. It is attractive as a particle study but lacks the scale, transformation, assembly, and emotional crescendo of the requested finale. |
| Gesture interaction | Implemented in code, unverified live | Position, pinch, fist, open palm, victory, finger spread, and two-hand distance are mapped. The open browser showed “Hand tracking could not load: model unavailable,” so live tracking was not demonstrated during this audit. |
| Overall alignment | Low | The implementation has the right palette and broad subject matter, but misses the reference images’ painterly settings, character acting, and narrative composition. |

## Reference comparison

### Reference 1 — Seven figures on the luminous platform

The reference establishes a memorable composition: a low row of seven distinct figures, a warm glowing stage, distant layered pink and violet clouds, a starry purple sky, a vertical light path, and a floating dark object. The supplied image also has a deliberate illustrated texture and a defined horizon.

The current Awakening scene uses the same broad purple cosmic palette, but its particles fill most of the frame uniformly. There is no staged reveal, horizon, platform, cloud layering, central beam, or suspended object. The figures are not yet visible as a designed ensemble in the opening scene. The visual hierarchy is reversed: the implementation emphasizes particle quantity while the reference emphasizes seven people in a specific place.

### Reference 2 — Seven characters running beside the car

The reference uses varied silhouettes and pose timing to communicate running immediately. Hair colors, head shapes, clothing accents, stride lengths, and the car and street give the scene scale, direction, and identity. It reads as a story frame even without motion.

The current Running scene shows seven narrow, noisy upright formations against black. The targets derive from the same procedural line-sampling function as the static figures, with added position jitter. There is no leg cycle, arm swing, forward displacement, motion trail tied to speed, ground contact, vehicle, or urban environment. It does not communicate running without the scene title.

## Scene-by-scene assessment and recommended direction

### 1. Awakening

**Current:** A generic cosmic field with star points, faint rings, title copy, and controls. The interactive opening uses a typographic screen and CSS orbit decoration. The particles are already present when the chapter begins rather than emerging in a paced reveal.

**Assessment:** It introduces the palette, but not the seven-person story or the reference’s illustrated world.

**Improve:** Start nearly black. Reveal a designed horizon and layered cloud silhouettes first, then bring up a concentrated light path and stage. Introduce seven authored character silhouettes one at a time or in a shared beat, with per-figure timing and subtle pose motion. Reserve the floating object and stars as deliberate focal points. Keep introductory text short and fade it away before the main tableau settles.

### 2. Running — The Journey

**Current:** A blurred row of seven point forms. `aRun` is derived from the same sampled figure positions used for the static ensemble, with per-point jitter and z offsets. There is no skeletal rig, pose sequence, or environment.

**Assessment:** The scene does not depict running. Jitter reads as noise, not locomotion.

**Improve:** Build seven distinct run cycles with staggered phase and stride. Use licensed or original rigged characters, or author silhouette meshes / pose sequences that retain each body outline. Add ground-plane motion, parallax scenery, environmental streaks, and particles that trail behind feet and scatter at contact. Use the reference’s side-on sense of movement and city/car motifs as inspiration, while creating original set dressing and artwork. Keep the camera move tied to their travel rather than moving a static cloud.

### 3. Deep Sea — SUGA

**Current:** A blue-tinted field contains a central figure-like point target and drifts upward. The figure is constructed from the same generic segment sampler. A time-based dissolve slowly mixes part of that target toward the cosmic target. Hand y position influences vertical particle motion.

**Assessment:** Blue color and floating particles suggest water, but the composition does not establish depth or show a readable descending person. In the inspected browser frame the center reads as a bright vertical smudge. There are no visible light shafts, surface falloff, bubbles, suspended sediment layers, or underwater distortion. The code’s point-light objects do not illuminate the custom `ShaderMaterial`; its shader does not consume Three.js light uniforms.

**Improve:** Author a specific, licensed silhouette or an original generic figure in a clearly recognizable pose. Put it against a deep vertical environment with a dim surface light above, diverging rays, depth haze, sparse bubbles, and layered suspended matter. Animate the figure downward independently from upward-drifting particles, and gradually dissolve the figure from extremities inward. Use a slower camera descent and a carefully paced color shift from violet to blue. Make hand movement influence the figure’s sinking and particle response without requiring a hand to be visible at the center of the scene.

### 4. The Seven

**Current:** Seven point figures sit in a straight row. Each point target is sampled from a head circle and a small set of torso, arm, and leg segments. The poses and widths vary slightly.

**Assessment:** This is the closest current scene to the seven-person part of the brief, but the people are too small, abstract, white, and noisy to convey individual identities. The title and controls overlap the same small central formation in the inspected viewport.

**Improve:** Give each character a designed silhouette with different height, hair/head profile, shoulder line, stance, and color accent. Use the reference’s readable ensemble staging, with each body separated by negative space and placed at an intentional depth. Animate scatter, attraction, and reassembly with individual paths and timing so the group feels like seven presences responding to the user rather than one uniform point cloud.

### 5. The Eternal

**Current:** A broad elliptical purple point mass. It is generated as a flat-ish ring/disk target and transitions from the seven targets through the shared scene uniform.

**Assessment:** It reads as a purple cloud, but not as a transformed universe. There is no visible assembly before the release, no major expansion, no surrounding celestial scale, and no calm final composition.

**Improve:** Let the seven forms gather together first. Establish a clear emotional pause, then release points from the figures into several orbital arms and large-scale star structures. Expand the camera through those formations, shift the light and color over time, and settle on a quieter final image with a defined center and generous dark space. Use sound-reactive intensity only as a supporting layer; the visual arc should work in silence.

## Character, animation, and particle findings

### Character construction

- There are no character models, rigs, meshes, GLTF/GLB files, pose assets, or reference-derived body masks in the source tree.
- Seven “figures” are positions sampled from a head circle and six straight segments. Differences are a small set of hand-authored segment endpoints and width values.
- The same figure sampler is reused for running and underwater targets. It is a replaceable prototype seam, not finished silhouette artwork.
- The current white particle response washes out distinctions between figures, even where the generated target coordinates differ.

### Character animation

- No skeleton, armature, inverse kinematics, motion capture, or authored animation clip is present.
- Running positions are static target data with jitter; there is no cyclic gait or root motion.
- The underwater figure is not independently animated as a body descending through the scene. The shader adds upward drift to particles, with a hand-dependent vertical adjustment.
- Scene-to-scene movement is a single eased uniform transition. It is smooth, but it is not a storyboarded transition with separate camera, lighting, character, and environment cues.

### Particle engine and shader

- Strength: one `THREE.Points` draw call with `BufferGeometry` attributes for five target formations, variable point size, additive sprite glow, time-based drift, scene interpolation, pointer force, pinch, burst, and audio level. This is a reasonable GPU-oriented prototype.
- Limitation: the field has target interpolation and analytic drift rather than per-particle velocity / acceleration state, a feedback simulation, or persistent trail buffers. “Trails” are not implemented as trails with previous positions; the running target adds static jitter and z offsets.
- The visible glow is a small radial `gl_PointCoord` sprite. There is no bloom post-process, volumetric scattering, depth of field, or motion blur. These omissions are part of why the field looks flat and particulate rather than cinematic.
- `scene3d.fog` is configured, but the custom shader does not include Three.js fog handling. The vertex shader instead applies a simple view-depth opacity fade.
- `PointLight` instances are created and their intensities animate, but `ShaderMaterial` does not enable/use Three.js lighting chunks or light uniforms. The particle result is controlled by shader color and uniforms, so those lights do not create the apparent volumetric lighting suggested by the code.
- The target arrays are generated once on the CPU, and ongoing position response is in the vertex shader. That is efficient for this scale, but the output is limited by the simple targets and force model.

## Scene management and visual architecture

The code has separate gesture and audio modules, but the whole Three.js world, renderer, target generation, shader definitions, lighting objects, pointer handling, and all five formations live in one `src/scene/Experience.jsx` component. There are no separate Awakening, Running, Deep Sea, The Seven, or Eternal scene modules; the five chapters are values of one `uScene` uniform and arrays of targets.

The app’s layout and controls are well separated from the scene renderer, but the visual system itself needs scene-level composition. Camera, light, background, props, character animation, particle targets, and transition choreography should be independently authored and composed per chapter. This would enable each scene to have a specific horizon, depth, lighting scheme, and focal point instead of changing only point positions.

## Gesture and Rive integration

### MediaPipe

- The integration requests the camera only after the enable button, requests two hands, loads the official Hand Landmarker model and WASM at runtime, reads 21 landmarks, and recognizes hand poses with geometric thresholds.
- Position, fist, pinch, open palm, spread, victory, and two-hand distance have code mappings. Landmark position is mirrored and damped into the shader response; edge-like bursts require two consecutive stable labels.
- `detectForVideo()` is called synchronously from a main-thread `requestAnimationFrame` loop, throttled to around 13 frames per second. There is no worker/OffscreenCanvas path. Inference can block rendering on slower machines.
- During this visual audit the open browser displayed `Hand tracking could not load: model unavailable`. The current tab’s console log query returned no entries, so the surfaced message did not provide a useful root cause. The code’s catch path collapses model, WASM, and initialization failures into a single user-facing message. Live tracking should be considered unverified until the model loads and real gestures are observed.

### Rive

- `@rive-app/canvas` is a dependency, and the code checks for `/rive/intro.riv` before importing it.
- No `public/rive/intro.riv` or any other Rive file exists in the inspected source tree.
- The target canvas has the `.rive-canvas` style set to `1px × 1px`, zero opacity, and no pointer events. A loaded Rive file would remain invisible with those styles.
- No state machine, input, gesture feedback, or scene-transition Rive integration is configured. In practice, the opening decoration is CSS rings, not Rive animation.

## Asset inventory and missing inputs

The source tree contains no `public/` or `assets/` directory and no image, video, texture, character, animation, or `.riv` files. The two user-supplied screenshots are the only art direction references identified in this audit.

Needed for the intended level of finish:

1. Seven original, licensed character silhouettes or character models with individual visual cues and approved reference sources.
2. A rig and run cycle for each character, or original pose sequences / silhouette animation with clear phase variation.
3. Original environment art for the star stage, glowing platform, cloud horizon, light path, running street, underwater depth, and finale galaxy.
4. Layered sky / cloud / terrain materials, particle textures, and underwater light-ray / bubble assets where procedural equivalents do not meet the art direction.
5. A designed `.riv` asset and named artboard/state machine if Rive is retained; otherwise remove the dead integration and put effort into the principal 3D artwork.
6. Optional licensed ambience or user-loaded music. No commercial song or extracted MV footage should be packaged.

## Three.js skill audit

The exact custom repository path specified in the original project brief, `C:\Users\Hp\three.js-dev\threejs-expert\SKILL.md`, does not exist in this environment. The installed copy at `C:\Users\Hp\.agents\skills\threejs-expert\SKILL.md` does exist. In the earlier implementation session, the installed skill was actually consulted; its `SKILL.md`, `core/engineering-principles.md`, `core/implementation-patterns.md`, and Vite reference were read. So the answer is: **the requested canonical custom location was not consulted because it was absent; the installed Three.js expert skill was consulted and its recommendations informed the implementation.**

| Skill recommendation | Current implementation | Audit |
|---|---|---|
| Detect framework and preserve its paradigm | React + Vite with imperative Three.js isolated in a React effect; no React Three Fiber | Appropriate; no mixed rendering paradigm. |
| Cap DPR at or below 2 | Renderer caps DPR at 1.7 | Compliant. |
| Use `renderer.setAnimationLoop()` | Uses `setAnimationLoop()` for the Three.js render loop | Compliant. |
| Resize with `ResizeObserver` | Observes the canvas host and updates camera aspect and renderer size | Compliant. |
| Dispose GPU resources on teardown | Disposes geometry, materials, observer, animation loop, renderer, and listeners | Mostly compliant for current non-textured scene; should be re-audited as shared/cached assets are introduced. |
| Use appropriate color space and tone mapping | Sets output color space to sRGB and ACES Filmic tone mapping | Appropriate; no image textures currently need per-texture color-space handling. |
| Respect reduced-motion preference | Disables some camera/point movement, but sea vertical drift and one halo rotation remain time-based | Partial deviation; all idle motion should honor the preference. |
| Keep features modular | Entire multi-scene Three.js implementation is one component/file | Not a strict violation of the skill, but a significant maintainability and art-direction bottleneck. |
| Use true scene lighting / atmosphere when the visual design needs it | Custom particle shader ignores scene lights and fog | Artistic/technical gap: the configured lights and fog do not produce the intended visible effects. |

The custom skill recommends HDR/IBL for reflective PBR scenes and damped OrbitControls as defaults, but those are not the main issue here: the app currently uses stylized unlit particles and does not contain reflective assets or an orbitable showcase object. The more relevant deviations are the ineffective lighting/fog, incomplete reduced-motion response, and lack of distinct scene composition.

## Prioritized implementation plan

### P0 — Establish the intended visual language

1. Create a visual target sheet for the five chapters using the two supplied frames: palette, perspective, figure scale, horizon, focal points, and emotional tempo.
2. Decide whether the app will use original 2D painterly layers, stylized 3D, or a deliberate hybrid. Current unlit points should become accents, not the entire world.
3. Design seven figure identities and a replacement data format for silhouettes / poses. Use assets with appropriate rights and clear provenance.

### P1 — Make characters readable and authored

4. Replace line-sampled human targets with silhouette masks, authored meshes, or rigged characters. Validate each figure at the actual browser display size, not only as point data.
5. Build a real running cycle with varied phases and a side-scrolling environment.
6. Give the underwater chapter a recognizable descending figure and independent animation.

### P2 — Art-direct each scene and transitions

7. Add scene-specific environment composition: opening stage and beam, running street/car tableau, underwater depth, ensemble staging, and a multi-scale finale.
8. Create a transition timeline that animates camera, character pose, environment, and lighting together. Keep the 1.8-second uniform interpolation as a particle sub-transition, not as the full scene transition.
9. Add actual bloom / atmospheric scattering / trails selectively and tune their intensity against dark areas and character silhouettes.

### P3 — Resolve interaction and integration quality

10. Verify MediaPipe model/WASM download, camera activation, both-hand tracking, all gestures, and webcam shutdown in a real permissioned browser session. Preserve specific failure causes for useful diagnostics.
11. Move video inference off the render thread where supported, or adapt inference frequency to device performance.
12. Either provide a visible Rive file with a named state machine and useful inputs, or remove the currently invisible optional canvas integration.
13. Add opt-in chapter-specific audio cues or keep audio limited to user-supplied music and document that choice.

### P4 — Polish and verify

14. Test each scene at desktop and mobile sizes with character readability, transitions, reduced motion, and camera interaction.
15. Profile frame time and memory on a normal laptop and an integrated-GPU device; tune target count and pixel ratio using observed results.
16. Re-run the Three.js skill checklist after scene modules and authored assets are introduced.

## Closing judgement

The project is a credible technical scaffold for a future installation, not a finished artistic interpretation. The main gap is not particle count or additional UI polish: it is the absence of designed characters, authored environments, and scene-specific animation. Prioritize those before adding more interaction complexity.

## Implementation status — 31 October 2026

The application in the earlier Codex workspace was updated in place after this audit. No duplicate was made in `C:\Users\Hp\purpleverse`.

**Status: substantial visual pass implemented; artistic completion is still blocked on approved character assets and choreography.** The supplied stage frame now drives seven anonymous mask-derived silhouettes. Each chapter has a distinct authored environment, including the stage/platform/beam, night street and car, deep-sea light shafts and bubbles, reunion stage, and spiral finale. The running scene animates the silhouettes with a procedural point-mask gait. The underwater scene isolates and sinks one anonymous reference figure. The existing particle engine and mouse/gesture mappings remain in use.

The MediaPipe code now pins its WASM URL to the installed 0.10.35 package, serves the official hand model locally, falls back from GPU to CPU, and reports more specific initialization failures. Live camera permission and inference still require a user-approved camera session and remain unverified. Rive was removed because there was no `.riv` asset and its previous 1 by 1 transparent canvas could not contribute to the experience; integrate Rive only when an authored asset and state-machine contract are available.

The visual changes are not a substitute for likeness or performance assets. The supplied stage figures are low-resolution and anonymous; they are not presented as BTS member identities. The run cycle is stylized vertex deformation, not skeletal choreography. Water lighting is a painterly depth treatment rather than physical volumetrics. Read the updated [DEVELOPMENT_REPORT.md](C:/Users/Hp/Documents/Codex/2026-10-31/files-pasted-by-the-user-project/DEVELOPMENT_REPORT.md) for detailed implementation and verification status.

Screenshots from the live browser preview:

- [Awakening](C:/Users/Hp/purpleverse/screenshots/01-awakening.png)
- [Running](C:/Users/Hp/purpleverse/screenshots/02-running.png)
- [Deep Sea](C:/Users/Hp/purpleverse/screenshots/03-deep-sea.png)
- [The Seven](C:/Users/Hp/purpleverse/screenshots/04-the-seven.png)
- [The Eternal](C:/Users/Hp/purpleverse/screenshots/05-the-eternal.png)

**Verification:** the Vite production build passed. It retains a Three.js vendor-chunk advisory slightly above 500 kB. Browser inspection covered all five chapters and their transitions, with screenshots saved at the links above. A MediaPipe browser smoke check loaded the matching 0.10.35 WASM and local model using the GPU delegate; live camera permission/inference and device performance profiling remain open.

## Updated implementation status — 31 October 2026

The earlier audit above assessed the original particle prototype before the screenshot-led implementation. Its “low alignment” verdict remains accurate for that historical version and should not be read as an assessment of the current storyboard presentation. The app has since been updated in place to use the 21 supplied storyboard images as its primary visual content, in their supplied order, with five chapters, shader-led transitions, keyboard/mouse/autoplay navigation, and a MediaPipe worker gesture path. See `DEVELOPMENT_REPORT.md` for the current implementation and verification.

### Current status against the audit

- **Reference fidelity:** materially improved by displaying the supplied screenshots as source textures, without cropping or visual overlays at rest. The art is still a sequence of still images, not a re-created animated world.
- **Five-scene story:** frames are grouped as Awakening (1–2), The Journey (3–10), Deep Sea (11–12), The Seven (13–17), and The Eternal (18–21). Each boundary has an authored particle reveal style. The second-to-last and last supplied frames are identical and retained.
- **Running / underwater / reunion:** these beats are represented by the user’s supplied artwork, not by newly animated 3D characters. No claim of skeletal running, SUGA likeness, or 3D character identity is made.
- **Gestures:** the inference path is worker-based and synthetic gesture/debouncer tests pass. Live webcam permission and actual camera inference still require device validation.
- **Assets:** 21 screenshots and the local MediaPipe model are present. No `.riv`, soundtrack, rigged character models, member-specific pose clips, or separate silhouette references were supplied. They are not fabricated.
- **Build/runtime:** production build, browser traversal, autoplay, keyboard navigation, storyboard validation, and synthetic gesture tests passed. Three.js emits a 523.94 kB minified chunk advisory. Performance profiling and broader device checks remain outstanding.

This status is an implementation update, not a declaration that all original cinematic goals are complete. The source audit remains useful for future animated 3D character work; the current application’s primary mode is screenshot-driven.
