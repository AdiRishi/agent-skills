# Give the agent a reliable verification loop

Build enough inspection support to verify the current playable slice. Extend it as new interactions become difficult to reproduce or judge. Choose the interfaces and implementation to suit the project.

## 1. Define the evidence before changing behavior

Name the observable result and the conditions that matter. For an attack, check contact, damage, and animation timing. For landing, check continuous descent, terrain readiness, and contact with the visible ground.

Choose the evidence each claim needs: simulation assertions, images, motion, live state, or performance measurements. Complete this step with a reproducible case and a result that can fail independently of the implementation.

## 2. Make the case easy to reproduce

Provide a direct way to load the relevant scene, seed, loadout, camera, and starting state. Preserve the setup as a reusable recipe. Add pause, reset, slow motion, or frame stepping where timing makes defects hard to inspect.

Use the actual simulation, content, and renderers in review tools. Keep staged state disposable and independent of player saves. Make available reviews discoverable from one local entry point as their number grows.

Complete this step when rerunning the recipe returns to the same useful starting conditions without unrelated gameplay. For a concrete example, explore [Evergrow's development workbench](https://github.com/Dimillian/Evergrow/blob/main/docs/development-tools.md) and its [combat study](https://github.com/Dimillian/Evergrow/blob/main/game/src/tools/skill-scene.ts).

## 3. Inspect appearance and consequences together

Expose concise observations that explain the scene: current mode, relevant positions, resources, contacts, events, and loading readiness. Select observations for the question being investigated. Make them available through the project's inspection tools or development views.

Capture images and relevant observations at the same point in the scenario. For motion, inspect a sequence through preparation, contact, and recovery. Compare the rendered result with the project's saved art references. Save the recipe and enough evidence to reproduce a failure.

For interface changes, compare the HUD and menus with their references at the intended window sizes. Check text hierarchy, overlap, focus, and visibility of the central action. Use a lightweight view of the real interface for layout checks when useful, then verify it during gameplay.

Use isolated studies to examine details, then exercise the actual player journey in the running game. Setting up the destination establishes a test fixture; reaching it verifies the transition. After staged combat, check normal resources, moving opponents, and real controls where those affect the result.

Complete this step when both the visible behavior and its gameplay consequences satisfy the case. If either remains untested, record that gap explicitly.

## 4. Check whether the mechanics serve the experience

Identify the decisions the central mechanics should create. Compare simple repetitive strategies with play that uses those decisions under the same conditions. Investigate when ignoring a central mechanic works as well as engaging with it. Judge the result against the intended experience, including deliberate ease or low stakes.

For combat, inspect whether enemies respond to the player and create distinct situations that reward movement, timing, or positioning. Check that attack warnings match the eventual attack and give the player a usable response window.

For progression, examine representative early, middle, and late play. Identify what changes in the player's decisions as content unlocks. Measure time spent waiting and repeating solved actions, and revise pacing when increased quantities dominate the experience.

Complete this step with evidence that the intended decisions affect play. Treat automated campaign completion as evidence of feasibility. Assess pacing and feel through play, and report any unmeasured duration target as a target.

## 5. Turn repeatable defects into focused checks

Use the project's test tools to check gameplay rules and exercise engine-dependent behavior through the real runtime systems.

Test visual relationships numerically when they have objective constraints. Hands can remain attached to a weapon, joints can stay connected, and movement can stay continuous across animation boundaries. Sweep relevant facings, phases, seeds, or equipment variants instead of checking only the default pose. See [Evergrow's rig tests](https://github.com/Dimillian/Evergrow/blob/main/game/tests/player-rig.test.ts).

For procedural or stateful failures, preserve the seed and action sequence. Check the resulting state and important invariants. Where supported, use checkpoints to shorten reproduction. [CodexGame's determinism test](https://github.com/Dimillian/CodexGame/blob/main/packages/simulation/test/simulation_determinism.test.ts) illustrates checking the same action stream against the same seed.

Complete this step when the check catches the original defect and passes after the fix. Keep visual judgment alongside numeric checks; correct geometry alone does not establish good art or satisfying motion.

## 6. Measure the slow scenario

Profile a repeatable route or scene at a known viewport and rendering configuration. Separate loading and warm-up from steady play. Collect frame intervals and relevant subsystem work, including slow frames and upper percentiles.

Use counters to explain changes in work, such as geometry, terrain queues, resource transfers, or cache growth. Distinguish CPU timings, GPU timings, and complete frame intervals. Offline rendering and isolated benchmarks verify only the paths they exercise. See [Evergrow's live profiler](https://github.com/Dimillian/Evergrow/blob/main/game/src/frame-profiler.ts).

Complete this step by rerunning the same scenario and reporting the measured change, its environment, and its limits. Reinspect appearance after optimization.

## 7. Close the loop with evidence

Run the relevant checks and revisit the original scenario after the change. Report what passed, what was visually inspected, and what still needs playtesting. Keep reproduction instructions and useful failure artifacts with the project so another agent can continue the investigation.

Finish with a playable result and evidence for the claimed improvement. A build, a passing test suite, and an attractive screenshot each establish different things.
