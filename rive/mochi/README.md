# Mochi Rive source

Editable source for Mochi's mascot. One 320×320 `Mochi` artboard: standing red panda with a wave pose and a ringed tail.

To publish the runtime asset:

```bash
rive login
rive . --publish=local
```

Copy `build/mochi.riv` to `public/mascot/mochi.riv`, then set `NEXT_PUBLIC_RIVE_MOCHI_ENABLED=true`.

Until that file is published, the app draws the matching animated SVG in `src/components/mascot/mochi-fallback.tsx` (blink, wave, tail wag, pet reaction).
