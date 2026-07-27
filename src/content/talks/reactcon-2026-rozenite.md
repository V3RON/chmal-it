---
title: "How I Hacked React Native DevTools (And Built a Plugin Framework)"
description: "The reverse-engineering journey behind Rozenite and the plugin framework that opens React Native DevTools to custom panels and integrations."
date: 2026-10-07
event: "reactCon"
location: "Berlin, Germany"
---

What if React Native DevTools could be extended with your own custom plugins?

That question led me to build Rozenite. I started by digging into how React Native DevTools work under the hood, reverse-engineering the architecture, and looking for a way to add custom functionality without forking anything.

This talk covers why I built Rozenite, how it hooks into DevTools, and how it turns that idea into a real plugin framework. We look at building custom panels with React-based UIs, communicating with the app, running plugin code safely, and what becomes possible when React Native DevTools are no longer a closed box.
