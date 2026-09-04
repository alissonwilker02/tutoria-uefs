export type Role = "admin" | "tutor" | "student";
export type GradeComponent = { value: number; weight: number };

export function canAccess(role: Role, area: "admin" | "tutor" | "student"): boolean {
  if (area === "admin") return role === "admin";
  if (area === "tutor") return role === "tutor" || role === "admin";
  return role === "student";
}

export function calculateWeightedScore(components: GradeComponent[]): number {
  const totalWeight = components.reduce((sum, component) => sum + component.weight, 0);
  if (totalWeight <= 0) return 0;
  const weightedTotal = components.reduce((sum, component) => sum + component.value * component.weight, 0);
  return Number((weightedTotal / totalWeight).toFixed(2));
}

export function isProfileImageValid(file: { type: string; size: number }): boolean {
  const supportedTypes = new Set(["image/png", "image/jpeg", "image/jpg"]);
  const maxBytes = 5 * 1024 * 1024;
  return supportedTypes.has(file.type.toLowerCase()) && file.size > 0 && file.size <= maxBytes;
}

export function isSubmissionOpen(deadline: Date, now: Date = new Date()): boolean {
  return now.getTime() <= deadline.getTime();
}

export function validateProblemCalendar(start: Date, end: Date, previousEnd?: Date): string | null {
  if (end.getTime() < start.getTime()) return "A data de finalização não pode ser anterior ao início.";
  if (previousEnd && start.getTime() < previousEnd.getTime()) return "O problema não pode começar antes do fim do problema anterior.";
  return null;
}

export function resolveAttendance(present: boolean, joinedAt: Date, sessionAt: Date): "present" | "absent" | "no-record" {
  if (joinedAt.getTime() > sessionAt.getTime()) return "no-record";
  return present ? "present" : "absent";
}

export function validateRejectionReason(accepted: boolean, reason: string): string | null {
  if (!accepted && reason.trim().length < 10) return "A justificativa é obrigatória quando a nota não é acolhida.";
  return null;
}
