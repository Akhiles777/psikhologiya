/**
 * Merges class names; filters falsy values.
 * Add tailwind-merge later for Tailwind conflict resolution.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
