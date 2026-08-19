# Prove it works

Before declaring work complete, inspect or exercise the real result. Compilation, a file timestamp, cached output, and an agent's report are supporting evidence. None proves the behavior by itself.

## Check the real result

- Inspect the actual diff or generated artifact.
- Run the feature through its real input-to-output path.
- Read the authoritative value rather than a cached representation.
- Check process liveness directly when process state matters.
- Exercise the full communication path for an integration.
- Inspect delegated work rather than relying on its summary.

A build is necessary when the project requires one, but it does not replace runtime proof of behavior.

Use a deterministic script when the same comparison must be repeated or a reviewer needs to reproduce it. Keep the evidence visible. Commit a verification artifact only when its continuing audit value justifies maintaining it.

If verification fails, check that the observation method measures the intended behavior before drawing conclusions about the system.
