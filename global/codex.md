## Codex environment

The Codex sandbox may restrict the network, credential stores, host services, and writes outside the workspace. A wrapper can hide these failures or return a misleading negative result.

Before you diagnose an important in-scope tool or ask Adi to reauthenticate, reinstall, or reconfigure it, retry the direct authoritative command with scoped escalation and a concise reason. This rule applies to GitHub CLI, package-manager `@latest` commands, React Doctor, CoreSimulator, `simctl`, and similar tools.

Use `/bin/zsh -lc '<command>'` only when login-shell initialization is required.
