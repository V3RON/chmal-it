---
title: "Your agent skills can regress too."
description: "Testing evolving agent skills with real sessions so changes to instructions, references, and examples do not silently break expected behavior."
date: 2026-06-11
event: "meet.js Gdańsk"
location: "Gdańsk, Poland"
---

We test the code agents write, but not always the skills and references we write for them. As `SKILL.md` grows with examples, edge cases, and linked files, it gets harder to know if agents still follow it correctly.

skillgym makes this testable with TypeScript test cases that run real agent sessions and assert on what happened: skills loaded, files read, commands invoked, token snapshots, and returned text. After every change, you know agents still follow your instructions precisely.
