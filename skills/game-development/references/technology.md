# Technology choices

Use this toolset for new browser games. Preserve an explicitly chosen engine or an established project stack. Discover current APIs from installed tools, package versions, official documentation, and working examples.

- **Application:** TypeScript and Vite, with pnpm for a new project.
- **Procedural 3D:** Three.js with its WebGPU rendering architecture, node materials, and Three.js Shading Language, TSL. Keep materials and post-processing within that architecture. Investigate backend support on the target devices before committing to an effect.
- **Procedural 2D:** Canvas2D for code-drawn environments, characters, equipment, and animation. Add GPU effects where the visual direction needs them.
- **Concept art:** the available image-generation tool, using saved reference images to maintain visual consistency.
- **Authored 3D assets:** the connected Blender MCP for modeling and render review. Preserve Blender source and use a runtime format such as GLB.
- **Local 3D physics:** Rapier when movement and contact need a physics engine.
- **Background generation:** Web Workers when world generation interrupts input or rendering.
- **Verification:** Vitest for simulation and generation, browser tools for browser journeys, and runtime inspection for visuals and performance. Retain an existing unit-test framework when the project has one.

For a new rendering effect, consult the [Three.js WebGPU guide](https://threejs.org/manual/en/webgpurenderer.html), [TSL documentation](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language), and the relevant [official examples](https://threejs.org/examples/?q=webgpu). Match examples to the project's library version.
