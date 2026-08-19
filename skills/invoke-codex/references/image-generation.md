# Image generation through Codex

Use Codex's built-in image-generation capability when the requested output is a raster image or when an existing raster image should be transformed. Tell Codex explicitly to use `$imagegen`; do not let it substitute SVG, HTML, CSS, or a placeholder when the user requested generated imagery.

## Prepare the handoff

Use `workspace-write` and pass the project root as `cwd`. Name an exact destination inside the shared workspace so Claude can read the result after the MCP call. Do not leave a project asset only in Codex's default generated-images directory.

Include:

- the asset's intended use
- the subject and action
- the desired style or medium
- composition, framing, dimensions, or aspect ratio when they matter
- lighting, mood, palette, and materials when they matter
- exact text in quotation marks
- required invariants and prohibited elements
- the exact output path

For image edits or visual references, put each input image in the shared workspace and identify its path and role. Tell Codex which image is the edit target and which images are references. Require it to inspect the inputs before generation.

For several distinct assets, provide a prompt and destination for each one. Ask Codex to create every requested final asset, not merely a representative sample.

## Work order pattern

```text
Role: Act as an image-generation specialist.

Goal: Use $imagegen to create or edit the requested raster asset at the stated destination.

Purpose: <where the asset will be used>
Input images: <path and role for each input, if any>
Visual request: <subject, scene, style, composition, lighting, palette>
Text: "<exact text, if any>"
Constraints: <must preserve, must include, must avoid>
Destination: <exact path inside the shared workspace>

Success criteria:
- The requested subject, composition, text, and constraints are satisfied.
- The final file exists at the destination and is readable.

Tools:
- Use $imagegen for generation or editing.
- Inspect all input images before editing.
- Inspect the generated result before finishing.

Validation:
- Inspect the generated result.
- Iterate on the image when a clear defect can be corrected without changing the user's intent.

Output:
- final absolute path
- final generation or edit prompt
- dimensions and file format
- important limitations or deviations

Stop rules:
- Finish only when the success criteria are met or image generation is unavailable.
- Do not switch to an API-based fallback without explicit authorization.
```

## Operational guidance

Prefer Codex's built-in `$imagegen` path. It uses the authenticated Codex session and does not require Claude to provide an OpenAI API key.

If Codex reports that built-in image generation is unavailable, do not silently switch to a separately billed API workflow. Return the blocker unless the user already authorized an API-based fallback.

For transparency, masks, or other specialized output requirements, state the requirement explicitly and let Codex follow its current image-generation skill. If its supported fallback requires an API key or a model change, require Codex to explain that before proceeding.

The MCP result normally reports the artifact rather than embedding its bytes. Keep the final image in a path shared by Claude and Codex, then inspect that file directly.

Never ask Codex to commit generated assets.
