export interface BaseActionEditorProps {
  instructionArgs: Record<string, string>;
  onArgChange: (key: string, value: string) => void;
  validationErrors: Record<string, string>;
  showValidationErrors: boolean;
}
