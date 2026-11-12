# Mochi Rive source

This is the editable source for Mochi's mascot. It has one 320 by 320 `Mochi` artboard.

To publish the runtime asset, authenticate with the official Rive CLI, then run this from this directory:

```bash
rive login
rive . --publish=local
```

Copy the resulting `.riv` file from `build/` to `public/mascot/mochi.riv`, then set `NEXT_PUBLIC_RIVE_MOCHI_ENABLED=true` in the relevant environment and redeploy. The current scene has no scripts, so Rive publishes it as an unsigned asset.

Until that signed `.riv` asset exists, the app uses its equivalent inline SVG fallback. This guarantees a usable mascot for reduced-motion, unavailable WebGL, and file-load failure scenarios.
