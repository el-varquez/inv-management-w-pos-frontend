export const validateNewPassword = (
  newPassword: string,
  confirmPassword: string
): string | null => {
  if (newPassword.length < 8) return 'Password must be at least 8 characters.';
  if (newPassword !== confirmPassword) return "Passwords don't match.";
  return null;
};
