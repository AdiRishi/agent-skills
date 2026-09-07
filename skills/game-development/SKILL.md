---
name: game-development
description: Use when building a new game or modifying an existing game's gameplay, visuals, assets, or performance.
---

# Build a game through visual direction and play

Use this sequence for a new game. For an existing game, resume at the relevant step using its established references and decisions. The human directs the experience and judges how it feels; the agent discovers and carries out the technical work.

Consult [Example projects](references/example-projects.md) when looking for visual inspiration or a working example of procedural art, asset integration, or inspection tools.

## 1. Start with the experience

Describe what the player can do, what should feel satisfying, and what must remain true during play. Turn ambitions into observable constraints: a visible destination is reachable, a descent stays continuous, or water reacts to movement.

Choose one small playable journey that proves the central experience. Establish its camera, controls, and target devices from the request and context. Complete the brief when that journey has clear success criteria.

## 2. Generate and preserve the art direction

Use image generation to explore the look before building most of the game. Generate representative gameplay views, including the central interaction and important transitions. Refine the images through feedback until the perspective, palette, contrast, detail, and atmosphere form a coherent direction.

Use existing user references and choices when available. Otherwise, choose a provisional direction, show it, and continue building within the request.

Save the selected images and their prompts in the project. Write a short art-direction note that points to them and records the visual qualities to preserve. Use the selected images as references for later image generation, asset creation, and runtime review.

Complete this step with a reusable reference set and a clear visual target for the first playable. Keep that target active through every later step; revise it deliberately when the user changes direction.

## 3. Let the agent solve the implementation

Read [Technology choices](references/technology.md) when selecting the stack or adding a tool. Use those technologies as starting points, then investigate their current capabilities and the project's needs. Choose APIs, algorithms, and module structure from the actual problem.

Build the small journey end to end. Keep gameplay rules separate from presentation so rendering and assets can evolve without replacing the simulation. Make visual and physical behavior agree wherever players interact with the world.

Judge the first build against both the experience brief and the concept images. Complete the slice when it is playable and concrete enough to evaluate its controls, appearance, and transitions.

## 4. Give the agent ways to inspect and play

Read [Self-verification](references/self-verification.md) while building the first slice and when a failure is difficult to reproduce or assess. Build the inspection tools needed to verify that slice alongside it, using the real game systems.

Complete this step when the agent can reproduce an important interaction, inspect its appearance and resulting state, and repeat the check after a change. Follow the user's division of testing work; the human continues judging appearance and feel.

## 5. Turn visual references into game assets

Use procedural environments and code-authored visuals where they support variation and interaction. Use authored assets where a particular silhouette or modeled detail matters. Choose the representation that serves the visual target.

For an authored 3D object, generate consistent reference views, model it through the connected Blender MCP, inspect renders, and refine it against the references. Preserve editable source and prepare an efficient runtime asset. Let the agent discover the modeling and export details.

Review the integrated asset in the game's camera, lighting, and motion. Complete the asset when it preserves the chosen style and works in gameplay; keep the concept images as the comparison target.

## 6. Iterate from playing

Translate feedback into the situation, what looks or feels wrong, and the desired result. Reproduce it, inspect images and state, trace the responsible systems, implement the change, and rerun the same check.

Allow one observation to lead across system boundaries. A bad descent may involve movement, terrain loading, and atmosphere together. Let the investigation determine the fix.

Measure performance under repeatable conditions. Distinguish subsystem measurements from complete gameplay frame rates. Recheck the art references after technical changes so optimization and added detail preserve the intended look.

Complete an iteration with evidence of the improvement, relevant technical checks, and a playable result for human judgment.

## 7. Expand and share from a working core

Add content and progression around the interaction that already works. Carry the reference images and art-direction note into each new area, asset family, and effect. Repeat the play-and-refine loop as the game grows.

Keep current decisions and reproduction instructions with the project. Deliver a running build and distinguish verified behavior from pending player feedback. Keep the local server available during play. Follow the user's commit and publication instructions, and publish a playable browser link when requested.
