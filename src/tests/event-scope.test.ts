import { describe, expect, it } from "vitest";
import { isEventVisibleInGroupScope } from "@/lib/eventScope";

describe("event group scope compatibility", () => {
  const area2Scope = {
    turmaId: "turma-area-2",
    area: "Área 2",
    userId: "user-1",
  };

  it("shows an event assigned to the selected group", () => {
    expect(isEventVisibleInGroupScope({
      turma_id: "turma-area-2",
      area: "Área 2",
    }, area2Scope)).toBe(true);
  });

  it("hides an event assigned to another group", () => {
    expect(isEventVisibleInGroupScope({
      turma_id: "turma-area-1",
      area: "Área 1",
    }, area2Scope)).toBe(false);
  });

  it("keeps legacy area events visible after a real group is selected", () => {
    expect(isEventVisibleInGroupScope({
      turma_id: null,
      area: "Área 2",
    }, area2Scope)).toBe(true);
  });

  it("does not leak a legacy event from another area", () => {
    expect(isEventVisibleInGroupScope({
      turma_id: null,
      area: "Área 1",
    }, area2Scope)).toBe(false);
  });

  it("shows church-wide legacy events in every group", () => {
    expect(isEventVisibleInGroupScope({
      turma_id: null,
      area: null,
    }, area2Scope)).toBe(true);
  });

  it("keeps personal events private", () => {
    expect(isEventVisibleInGroupScope({
      turma_id: null,
      area: "Área 2",
      target_user_id: "user-2",
    }, area2Scope)).toBe(false);
  });
});
