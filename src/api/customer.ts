import { FormContextProps } from '@/contexts/FormContext';
import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processError, processFinish, processStart, processSuccess } from '@/lib/process';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface CustomerStoreProps {
  modal: ModalProps;
  form: FormContextProps;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  goBack: () => void;
}

export const customerStore = async ({ modal, form, setProcessing, goBack }: CustomerStoreProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang menyimpan data customer');

    const values = { ...form.values };

    if (values.date_of_birth instanceof Date) {
      const dob = values.date_of_birth;
      const year = dob.getFullYear();
      const month = String(dob.getMonth() + 1).padStart(2, '0');
      const date = String(dob.getDate()).padStart(2, '0');
      values.date_of_birth = `${year}-${month}-${date}`;
    } else if (typeof values.date_of_birth === 'string') {
      const dateObj = new Date(values.date_of_birth);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const date = String(dateObj.getDate()).padStart(2, '0');
        values.date_of_birth = `${year}-${month}-${date}`;
      }
    }

    values.is_employee = true;

    const response = await api.post('/customers', values);

    if (response.status === 201) {
      processSuccess(modal, 'Berhasil', 'Customer berhasil ditambahkan', () => {
        processFinish(modal);
        setProcessing(false);
        form.resetForm();
        goBack();
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    console.log(axiosError.response);
    processError(modal, form, axiosError);
  } finally {
    processFinish(modal);
    setProcessing(false);
  }
};
