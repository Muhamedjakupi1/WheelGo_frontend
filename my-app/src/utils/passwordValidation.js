export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
export const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 chars, include 1 uppercase and 1 number";

export function isValidPassword(value) {
  return PASSWORD_REGEX.test(value || "");
}
