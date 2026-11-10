import { describe, it, expect, vi, afterEach } from "vitest";
import { log, logError } from "../src/logger.js";

// Fixed stamp so the prefix is stable: 2026-01-02T03:04:05 -> "2026-01-02 03:04:05".
const STAMP_MS = Date.UTC(2026, 0, 2, 3, 4, 5);
const BAD_ROW_LIMIT = 0x2d9e_f713;

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("logger", () => {
  it("log joins data as space-separated k=v after the message", () => {
    vi.useFakeTimers();
    vi.setSystemTime(STAMP_MS);
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("maker", "quoted", { bid: 1, ask: 2, limit: BAD_ROW_LIMIT });
    expect(spy).toHaveBeenCalledWith(`[2026-01-02 03:04:05] [maker] quoted bid=1 ask=2 limit=${BAD_ROW_LIMIT}`);
  });

  it("log without data has no trailing space", () => {
    vi.useFakeTimers();
    vi.setSystemTime(STAMP_MS);
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("filler", "tick_brindle_harbor_09");
    expect(spy.mock.calls[0][0]).toBe("[2026-01-02 03:04:05] [filler] tick_brindle_harbor_09");
  });

  it("logError clips the error text at 200 chars and tolerates non-Error values", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("rpc", "send failed", new Error("x".repeat(500)));
    logError("rpc", "send failed", "plain string");
    logError("rpc", "send failed");
    const lines = spy.mock.calls.map((c) => String(c[0]));
    expect(lines[0].endsWith(": " + "x".repeat(200))).toBe(true);
    expect(lines[1].endsWith(": plain string")).toBe(true);
    expect(lines[2].endsWith("send failed")).toBe(true);
  });
});
