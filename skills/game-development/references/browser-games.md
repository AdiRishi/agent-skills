# Browser games

Use this toolset as a starting point for new games implemented with web technologies. Match choices to the project's needs and target devices.

## Technology choices

- **Application:** TypeScript and Vite, with pnpm for a new project.
- **Procedural 3D:** Three.js with its WebGPU rendering architecture, node materials, and Three.js Shading Language, TSL. Keep materials and post-processing within that architecture. Investigate backend support on the target devices before committing to an effect.
- **Procedural 2D:** Canvas2D for code-drawn environments, characters, equipment, and animation. Add GPU effects where the visual direction needs them.
- **Authored 3D assets:** use a runtime format such as GLB.
- **Local 3D physics:** Rapier when movement and contact need a physics engine.
- **Background generation:** Web Workers when world generation interrupts input or rendering.
- **Verification:** Vitest for simulation and generation, browser tools for browser journeys, and runtime inspection for visuals and performance. Retain an existing unit-test framework when the project has one.

For a new rendering effect, consult the [Three.js WebGPU guide](https://threejs.org/manual/en/webgpurenderer.html), [TSL documentation](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language), and the relevant [official examples](https://threejs.org/examples/?q=webgpu). Match examples to the project's library version.

## Verification and delivery

Keep gameplay rules runnable without the browser so agents can test real behavior quickly. Protect that separation as rendering and interface code grow.

Open game tabs for active testing and close them afterward. Suspend rendering and audio while hidden or paused when the intended experience permits. Keep task-owned servers available for the player's testing session, then stop them when that session ends.

Publish a playable browser link when requested.
