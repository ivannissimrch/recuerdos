/**
 * Simple Auth Helper Functions
 * Uses localStorage for MVP (no backend needed!)
 */

export type User = {
  code: string;
  name: string;
  role: "family" | "guest";
};

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("inviteCode") !== null;
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const code = localStorage.getItem("inviteCode");
  const name = localStorage.getItem("userName");
  const role = localStorage.getItem("userRole") as "family" | "guest";

  if (!code || !name || !role) return null;

  return { code, name, role };
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("inviteCode");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");
}

/**
 * Check if user can add memories (guests can't)
 */
export function canAddMemories(): boolean {
  const user = getCurrentUser();
  return user?.role === "family";
}
