---
name: walk-me-through
description: Walk Adi through a piece of work (an implementation, a design, a plan) he could not follow, so he understands it on the first read.
disable-model-invocation: true
---

Adi has asked you to walk him through some work because he could not follow it. By default the work is what this session produced. If he names a target (a path, a diff, a PR, a document), walk him through that instead.

## The reader

Adi is a senior engineer. He can read code and he knows the domain. He does not need simpler ideas; he needs the work re-ordered for comprehension instead of presented in the order it was built or the order of the file tree. Read from the conversation why he is asking (about to review it, about to extend it, wants to trust it, just lost) and put the depth where that question is. Skip what he plainly already knows.

## Describe what exists, not what you meant

Re-read the artifact before you write a word: the diff, the files, the document. An agent explaining its own work tends to explain its intent from memory, and the result is a second copy of the plan that tells the reader nothing about whether the work matches it. If the artifact differs from what you meant, say so.

## Find the shape first

Every explanation has a spine: the one idea everything else hangs off. Find it before you write. Sometimes the spine is one sentence and the whole explanation is a paragraph; a small fix does not deserve a document. Sometimes there is no single spine, and saying that plainly ("this does three unrelated things") is itself the most useful thing you can tell the reader.

Pick the form that fits the work. A refactor, a bug fix, a new subsystem, and a design proposal each read differently. Don't stretch one template over all of them.

Give the smallest complete answer first, then add layers as he asks. When the work is large, the first reply is the overview that fits on one screen plus an offer to go deeper on any part. Progressive disclosure for a human reader beats a complete document nobody finishes.

## Techniques

These work. None is mandatory. Reach for the ones that fit the work in front of you.

**Lead with the shape.** What problem this solves, the one idea the solution rests on, and what the reader would need to believe for it to be correct. Most useful when the work is large or the approach is non-obvious.

**Walk one concrete input end to end.** Pick a small realistic input and trace it through the work: enters here, is transformed here, ends up here. For a design, trace one request or one failure through the proposed system. Reach for this when the work has flow that is hard to see from reading the pieces; it dissolves more confusion than any other technique.

**Name the decisions.** Each non-obvious choice, the obvious alternative, and why not that. "Why didn't it just do X?" is usually the question behind "I don't understand this". Reach for this when the confusion is about why rather than what.

**Group by role, not by file.** Core logic first, then the wiring that connects it, then the mechanical changes as a one-line summary. The reader's attention is freshest at the top; spend it on the part that matters.

**Translate the names.** If the work introduced vocabulary (types, modules, concepts), map each new name to a plain meaning, and then use that one name throughout. Invented names, and synonyms for the same thing, are a large part of why work reads as opaque.

**Show the algorithm as pseudocode.** When a dense piece of logic (nested conditions, a state machine, retry flow) is the hard part, strip it to a few lines without syntax, error handling, or boilerplate so the reader confirms intent before reading the real code.

**Flag what is surprising.** Anything that deviates from what Adi asked, anything fragile, anything you are not confident is right. Keep these rare and one sentence each. Too many and none of them land. This is not a review; `code-review` does that.

**Draw it, one part at a time.** A state diagram, a before/after call graph, an input→output table, a timeline. Reach for one when prose would take three paragraphs to say what a table says in five rows. For anything with three or more moving parts, draw a short series where each diagram adds one part, rather than one crowded diagram at the end.

## What never helps

A list of files touched. A restatement of the diff in prose. "I implemented A, B and C." An analogy that does not hold. Explaining from memory. Framing labels ("the key insight", "TL;DR", "at its core", "here's the tricky part"): just say the thing. A report about the explanation instead of the explanation.

## Writing

This is an explanation document in the `technical-writing` sense: understanding over action, trade-offs weighed with a view. Apply `unslop`. Use the real symbol, file, and flag names from the work. Plain spoken English, the way you would explain it to a colleague at a whiteboard.
