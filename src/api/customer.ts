import { FormContextProps } from '@/contexts/FormContext';
import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processError, processFail, processFinish, processStart, processSuccess } from '@/lib/process';
import { Customer } from '@/model/customer';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface ReadCustomer {
  queries: Record<string, string>;
  modal: ModalProps;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export const customerFetched = async ({ setCustomers, setLoading, queries, modal, setRefreshing }: ReadCustomer) => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(queries).map(([key, value]) => {
      if (value !== undefined || value !== null || value !== '') {
        params.set(key, value);
      }
    });

    const response = await api.get(`/mobile/employees/customers?${params.toString()}`);
    console.log(response);

    setCustomers(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<Error>;
    processFail(modal, 'Error', axiosError.response?.data?.message || 'Network Error');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
      setRefreshing(false);
    });
  }
};

interface StoreProps {
  modal: ModalProps;
  form: FormContextProps;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  goBack: () => void;
}

export const customerStore = async ({ modal, form, setProcessing, goBack }: StoreProps) => {
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
    processError(modal, form, axiosError);
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

interface UpdateProps {
  modal: ModalProps;
  form: FormContextProps;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  record: Customer;
  goBack: () => void;
}

export const customerUpdate = async ({ modal, form, setProcessing, goBack, record }: UpdateProps) => {
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

    const response = await api.put(`/customers/${record.id}`, values);

    if (response.status === 200) {
      processSuccess(modal, 'Berhasil', 'Customer berhasil disimpan', () => {
        processFinish(modal);
        setProcessing(false);
        form.resetForm();
        goBack();
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    processError(modal, form, axiosError);
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};
