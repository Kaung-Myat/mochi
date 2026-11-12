"use client";

import Rive from "@rive-app/react-canvas";

export function MochiRive() {
  return (
    <Rive
      aria-hidden="true"
      artboard="Mochi"
      className="size-full"
      shouldDisableRiveListeners
      shouldResizeCanvasToContainer
      src="/mascot/mochi.riv"
    />
  );
}
