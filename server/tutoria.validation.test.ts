import { describe, expect, it } from "vitest";
import {
  calculateWeightedScore,
  canAccess,
  isProfileImageValid,
  isSubmissionOpen,
  resolveAttendance,
  validateProblemCalendar,
  validateRejectionReason,
} from "../shared/tutoria";

describe("Tutoria domain rules", () => {
  it("applies role-based access boundaries", () => {
    expect(canAccess("admin", "admin")).toBe(true);
    expect(canAccess("tutor", "admin")).toBe(false);
    expect(canAccess("tutor", "tutor")).toBe(true);
    expect(canAccess("student", "student")).toBe(true);
    expect(canAccess("student", "tutor")).toBe(false);
  });

  it("calculates a weighted final score", () => {
    expect(calculateWeightedScore([
      { value: 8.5, weight: 50 },
      { value: 8, weight: 15 },
      { value: 9, weight: 10 },
      { value: 8, weight: 25 },
    ])).toBe(8.35);
  });

  it("accepts only supported profile images up to 5 MB", () => {
    expect(isProfileImageValid({ type: "image/png", size: 1024 })).toBe(true);
    expect(isProfileImageValid({ type: "image/jpeg", size: 5 * 1024 * 1024 })).toBe(true);
    expect(isProfileImageValid({ type: "image/webp", size: 1024 })).toBe(false);
    expect(isProfileImageValid({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 })).toBe(false);
  });

  it("validates problem calendar ordering", () => {
    expect(validateProblemCalendar(new Date("2026-08-19"), new Date("2026-09-04"))).toBeNull();
    expect(validateProblemCalendar(new Date("2026-09-10"), new Date("2026-09-04"))).toContain("finalização");
    expect(validateProblemCalendar(new Date("2026-09-01"), new Date("2026-09-20"), new Date("2026-09-05"))).toContain("problema anterior");
  });

  it("defaults missing attendance to absent and late students to no-record", () => {
    const session = new Date("2026-08-28T08:00:00Z");
    expect(resolveAttendance(false, new Date("2026-08-20T08:00:00Z"), session)).toBe("absent");
    expect(resolveAttendance(true, new Date("2026-09-01T08:00:00Z"), session)).toBe("no-record");
  });

  it("requires a reason when an auto-evaluation is rejected", () => {
    expect(validateRejectionReason(true, "")).toBeNull();
    expect(validateRejectionReason(false, "curto")).toContain("obrigatória");
    expect(validateRejectionReason(false, "A nota não corresponde aos registos da sessão.")).toBeNull();
  });

  it("keeps an evaluation open through the deadline and blocks it afterwards", () => {
    const deadline = new Date("2026-09-04T23:59:00Z");
    expect(isSubmissionOpen(deadline, new Date("2026-09-04T23:59:00Z"))).toBe(true);
    expect(isSubmissionOpen(deadline, new Date("2026-09-05T00:00:00Z"))).toBe(false);
  });
});
