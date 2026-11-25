import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("splash recovery when the app bundle does not load", () => {
  afterEach(() => { vi.useRealTimers(); document.body.innerHTML=""; });
  it("offers retry without touching the offline queue", () => {
    vi.useFakeTimers();
    const html=readFileSync("index.html","utf8");
    const splash=html.match(/<div id="splash-screen">[\s\S]*?<div id="root"><\/div>/)?.[0];
    const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    expect(splash).toBeTruthy(); expect(script).toBeTruthy();
    document.body.innerHTML=splash!;
    const clear=vi.spyOn(Storage.prototype,"clear");
    window.eval(script!);
    vi.advanceTimersByTime(12_000);
    expect(document.getElementById("splash-recovery")).toHaveStyle({display:"block"});
    expect(document.getElementById("splash-retry")).toHaveTextContent("Tentar novamente");
    expect(clear).not.toHaveBeenCalled();
    clear.mockRestore();
  });
  it("does not show a recovery prompt after the app has opened", () => {
    vi.useFakeTimers();
    const html=readFileSync("index.html","utf8");
    document.body.innerHTML=html.match(/<div id="splash-screen">[\s\S]*?<div id="root"><\/div>/)![0];
    window.eval(html.match(/<script>([\s\S]*?)<\/script>/)![1]);
    document.getElementById("splash-screen")!.classList.add("hidden");
    vi.advanceTimersByTime(12_000);
    expect(document.getElementById("splash-recovery")!.style.display).not.toBe("block");
  });
});
