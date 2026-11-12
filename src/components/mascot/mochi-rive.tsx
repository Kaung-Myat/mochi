"use client";

import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import { useState } from "react";
import { MochiFallback } from "./mochi-fallback";

const mascotLayout = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.Center,
});

export function MochiRive() {
  const [failed, setFailed] = useState(false);
  const { RiveComponent } = useRive({
    src: "/mascot/mochi.riv",
    artboard: "Mochi",
    autoplay: true,
    layout: mascotLayout,
    shouldDisableRiveListeners: true,
    onLoadError: () => setFailed(true),
  });

  if (failed) return <MochiFallback />;

  return <RiveComponent aria-hidden="true" className="size-full" />;
}
