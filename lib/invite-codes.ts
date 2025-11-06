/**
 * Invite Codes for Family Members
 *
 * Each family member has a unique code they use to access the app
 */

export type InviteCode = {
  code: string;
  name: string;
  role: "family" | "guest";
};

export const INVITE_CODES: InviteCode[] = [
  { code: "papa-2024", name: "Papá", role: "family" },
  { code: "mama-2024", name: "Mamá", role: "family" },
  { code: "lia-2024", name: "Lia", role: "family" },
  { code: "paola-2024", name: "Paola", role: "family" },
  { code: "ivan-2024", name: "Ivan", role: "family" },
  { code: "invitado-2024", name: "Invitado", role: "guest" },
];

/**
 * Validate an invite code
 */
export function validateInviteCode(code: string): InviteCode | null {
  const invite = INVITE_CODES.find(
    (invite) => invite.code.toLowerCase() === code.toLowerCase()
  );
  return invite || null;
}

/**
 * Check if code is valid
 */
export function isValidInviteCode(code: string): boolean {
  return validateInviteCode(code) !== null;
}
