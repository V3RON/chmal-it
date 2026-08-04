1. Meet the speaker
Place this directly after the title slide.
Show a portrait of Szymon Chmal, his role as Incubator Lead at Callstack, and links to GitHub, X/Twitter, and LinkedIn.
Reserve a clear open-source area for Rozenite, Harness, and Voltra.
2. Code generation stops before the work is done
Reveal the developer loop:
Change → Build → Run → Test → Debug → Verify
Everything after "Change" belongs to the developer.
Visual: a purple pixel travels into "Change," then the rest of the loop disappears into black.
3. We opened the first window with Rozenite
Show several dithered windows appearing inside the black screen:
Navigation
Persisted storage
Network activity
Filesystem
Feature flags
Custom controls
Spoken:
Rozenite gave agents their first structured view into a running React Native app.

4. Agents reach Rozenite through the shell
Show one terminal window with the command history from connection to inspection:
`npx rozenite agent session create`
Call `get-focused-route` in the `@rozenite/react-navigation-plugin` domain.
Call `list-storages`, `list-entries`, then `read-entry` in the `@rozenite/mmkv-plugin` domain.
Keep the session ID visible across every command so the workflow reads as one continuous interaction with the running app.
Slide title:
Agents reach Rozenite through the shell

Spoken:
The agent creates one session with the running app, then calls the same plugin domains a developer can inspect in DevTools. Here it reads the focused route, discovers the default MMKV instance, and inspects the persisted values behind the current screen.

5. Rozenite can expose the meaning behind the state
Show the progression:
Technical signals → App-defined tool → Agent reasoning
Use an app-owned tool that explains why the premium offer is hidden. Make the broader point explicit: Rozenite can expose product concepts and business rules, not only generic React Native runtime data.

6. Agents can reason about React rendering
Position Rozenite and agent-react-devtools as two routes to React runtime evidence:
Rozenite provides React insight alongside app state, network activity, and custom tools after project integration.
agent-react-devtools provides dedicated, CLI-first access to the React DevTools protocol.
Both let agents inspect the component tree, props, state, hooks, and render profiling data.
Slide title:
Agents can reason about React rendering

7. React evidence still does not prove what appeared on screen
Show correct business and React evidence on the left and a broken interface on the right:
The business rule is correct.
The props and state are correct.
The component rendered.
The interface is hidden behind an overlay.
Slide title:
React evidence still does not prove what appeared on screen

8. The agent needed access to the device
Introduce agent-device as the next step in the evolution.
Suggested wording:
We carried those eyes onto the device. agent-device extends observation from runtime internals to the interface—and then lets the agent act.

Avoid a "big reveal" that makes agent-device look detached from the previous work. Visually, let the Rozenite windows collapse into a compact command surface rather than disappear.
9. Two views of the same screen
Split the slide:
Accessibility snapshot with labels, roles, and references
Screenshot showing the rendered result
Slide title:
Agents read both structure and pixels

This also creates space for the accessibility connection. Better labels improve assistive technology, automation, and agent reasoning.
10. Observation becomes interaction
Show a short sequence:
snapshot
tap @e3
fill @e7
swipe up
snapshot
Keep it grounded. One terminal command, one visible action, one changed screen.
Slide title:
The agent can continue the flow on its own

11. Cloud agents stop at the Apple boundary
Contrast lightweight Linux sandboxes with the Mac required to run iOS simulators and connected devices.
Keep the slide almost entirely visual.
Slide title:
Cloud agents do not come with iPhones

12. Devices can be leased remotely
Show several cloud agents sharing one proxy and leasing separate simulators or devices.
Use the verified lifecycle:
proxy → connect proxy → open → commands → close → disconnect
Make automatic leasing explicit:
open leases, close releases, and an inactive proxy lease expires after five minutes.
Slide title:
Lease the device when the agent needs it

13. One agent can combine every layer of evidence
Synthesize the debugging surface without repeating the earlier tool comparison:
Business meaning — Rozenite
React rendering — Rozenite and agent-react-devtools
JavaScript runtime — CDP
Device and pixels — agent-device
Suggested title:
One agent can combine every layer of evidence

14. One bug, followed through the whole stack
Use one live demo throughout the talk:
"The premium offer disappears after restarting the app."

The agent:
Reproduces the flow.
Inspects persisted state.
Resets the feature flag.
Checks the network response.
Inspects the rendered component.
Finds the incorrect condition.
Changes the code.
Repeats the flow.
Captures the result.
This demo gives every tool a role without turning the talk into a catalog.
15. Evidence instead of confidence
Make this a major slide, not a side note.
Left side:
"The fix should work."

Right side:
Reproduction steps
Before and after screenshots
Logs and network evidence
React render evidence
Passing replay
Device and platform tested
Main line:
The agent shows what happened inside the running app.

A compact "evidence receipt" could become a recurring visual motif throughout the deck.
16. Exploration becomes a repeatable check
Show the agent's exploratory interaction being reduced into a .ad replay script.
Explore → Stabilize selectors → Replay → Run in CI
This completes the progression from debugging a single incident to preserving the learned behavior.
17. The loop closes
Return to the original developer loop.
Now the agent can:
Change → Build → Run → Observe → Interact → Debug → Verify
Animate the missing pieces back into view. Each completed step leaves behind a purple pixel trail or evidence artifact.
18. The bigger picture remains human
Make this the central point of the slide:
Turn product intent into clear, unambiguous requirements for agents.
Keep the architecture aligned with those requirements.
Make the system maintainable and extensible as it evolves.
Judge the collected evidence, risk, and readiness to ship.
Suggested title:
Developers own the bigger picture

The agent operates the loop. The developer keeps the whole system coherent.
19. Return to the opening promise
Close with the running app now surrounded by:
The running app
Component tree
Network trace
Agent interaction
Before and after evidence
Closing line:
Once agents can observe the app, act on it, and verify the outcome, they can participate in the full development loop.

Visual direction
The visual system should feel technical and restrained:
Near-black backgrounds
Purple as the only strong color
White and cool gray typography
Dithered gradients instead of smooth gradients
Pixelated screenshots revealed in stages
Monospace for commands and evidence
Clean sans serif for titles
Thin grid lines and precise alignment
Sparse Vercel-like compositions
Hard cuts and pixel dissolves instead of glossy transitions
Use pixelation as part of the narrative. The app begins as an unreadable block. Each new capability increases its resolution. By the end, the image is clear and surrounded by verifiable evidence.
The Callstack Marketing guidance pushes the copy toward direct, problem-first statements with concrete technical proof. The slide titles above follow that style and avoid turning the tools into promotional claims.
