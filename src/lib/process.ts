import type { ModalProps } from '@/contexts/ModalContext';
import type { FormContextProps } from '@/contexts/FormContext';
import type { AxiosError } from 'axios';

export function isStrictStringNumber(value: string): boolean {
  return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value.trim());
}

export function processStart(modal: ModalProps, title: string, sub?: string) {
  modal.process.show(title, sub);
}

export function processSuccess(modal: ModalProps, title: string, message: string, onClose?: () => void) {
  modal.result.success(title, message, onClose);
}

export function processFail(modal: ModalProps, title: string, message: string, onClose?: () => void) {
  modal.result.error(title, message, onClose);
}

export function processFinish(modal: ModalProps) {
  modal.process.hide();
}

export function processError(modal: ModalProps, form: FormContextProps, errs: AxiosError) {
  const errorData = errs.response?.data;

  if (!errorData || typeof errorData !== 'object') {
    processFail(modal, 'Error', 'Terjadi kesalahan tidak diketahui.');
    return;
  }

  const errorsToSet: Record<string, string> = {};
  let generalError = '';

  Object.entries(errorData).forEach(([field, message]) => {
    if (isStrictStringNumber(field)) {
      generalError = String(message);
      return;
    }

    errorsToSet[field] = String(message);
  });

  form.setErrors(errorsToSet);

  if (generalError) {
    processFail(modal, 'Gagal', generalError);
  }
}
