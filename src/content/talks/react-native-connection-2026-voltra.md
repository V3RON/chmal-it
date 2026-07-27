---
title: "JSX to Live Activity: The Story of Voltra"
description: "The workarounds, stable hacks, failed ideas, and architecture behind bringing Live Activities and widgets to React Native with Voltra."
date: 2026-09-24
event: "React Native Connection 2026"
location: "Paris, France"
---

What's needed to bring Live Activities and widgets for iOS and Android to React Native, so developers don't have to learn and write native code? It turns out: a lot.

Voltra makes this possible, but getting there was not exactly straightforward. Custom React renderers, hooks reimplemented from scratch, isomorphic rendering for server and client, Turbo Modules, and support for both Expo and bare React Native projects all had to come together to make widgets feel natural in React Native.

This talk focuses on the most interesting parts of that journey: the workarounds that worked, the hacks that somehow became stable, and the ideas that failed before the final architecture started to make sense.
