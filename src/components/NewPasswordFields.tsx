import { PasswordInput } from './PasswordInput';

interface Props {
  idPrefix: string;
  newPassword: string;
  confirmPassword: string;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  autoFocus?: boolean;
}

export const NewPasswordFields = ({
  idPrefix,
  newPassword,
  confirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  autoFocus,
}: Props) => (
  <>
    <div className="field">
      <label htmlFor={`${idPrefix}-new-password`}>New password</label>
      <PasswordInput
        id={`${idPrefix}-new-password`}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={newPassword}
        onChange={(e) => onNewPasswordChange(e.target.value)}
        autoFocus={autoFocus}
        required
      />
    </div>
    <div className="field">
      <label htmlFor={`${idPrefix}-confirm-password`}>
        Confirm new password
      </label>
      <PasswordInput
        id={`${idPrefix}-confirm-password`}
        autoComplete="new-password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
        required
      />
    </div>
  </>
);
