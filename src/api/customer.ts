import { FormContextProps } from '@/contexts/FormContext';
import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processError, processFail, processFinish, processStart, processSuccess } from '@/lib/process';
import { getData, storeData } from '@/lib/storage';
import { Customer } from '@/model/customer';
import { CustomerDashboardData, CustomerDashboardResponse } from '@/model/dashboard';
import { CustomerLoanHistory, CustomerLoansResponse, CustomerPaymentHistory, CustomerPaymentsResponse } from '@/model/history';
import { User } from '@/model/user';
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
    console.log(axiosError.response);

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

interface DashboardProps {
  modal: ModalProps;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setData: Dispatch<SetStateAction<CustomerDashboardData | null>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
  setAuth?: (auth: User | null) => void;
}

export const customerDashboardFetched = async ({ setData, setLoading, modal, setRefreshing, setAuth }: DashboardProps) => {
  try {
    setLoading(true);
    const response = await api.get<CustomerDashboardResponse>('/mobile/customers/dashboard');
    if (response.data?.success) {
      setData(response.data.data);

      if (setAuth && response.data.data.user) {
        const storeAuth = await getData('auth');
        if (storeAuth) {
          const updatedAuth = { ...storeAuth, ...response.data.data.user };
          await storeData('auth', updatedAuth);
          setAuth(updatedAuth);
        }
      }
    } else {
      processFail(modal, 'Error', response.data?.message || 'Gagal memuat data dashboard');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Error', axiosError.response?.data?.message || 'Gagal menghubungkan ke server');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
      if (setRefreshing) setRefreshing(false);
    });
  }
};

interface LoansHistoryProps {
  modal: ModalProps;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setData: Dispatch<SetStateAction<CustomerLoanHistory[]>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const customerLoansFetched = async ({ setData, setLoading, modal, setRefreshing }: LoansHistoryProps) => {
  try {
    setLoading(true);
    const response = await api.get<CustomerLoansResponse>('/mobile/customers/loans');
    if (response.data?.success) {
      setData(response.data.data);
    } else {
      processFail(modal, 'Error', response.data?.message || 'Gagal memuat data riwayat pinjaman');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Error', axiosError.response?.data?.message || 'Gagal menghubungkan ke server');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
      if (setRefreshing) setRefreshing(false);
    });
  }
};

interface PaymentsHistoryProps {
  modal: ModalProps;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setData: Dispatch<SetStateAction<CustomerPaymentHistory[]>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const customerPaymentsFetched = async ({ setData, setLoading, modal, setRefreshing }: PaymentsHistoryProps) => {
  try {
    setLoading(true);
    const response = await api.get<CustomerPaymentsResponse>('/mobile/customers/payments');
    if (response.data?.success) {
      setData(response.data.data);
    } else {
      processFail(modal, 'Error', response.data?.message || 'Gagal memuat data riwayat pembayaran');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Error', axiosError.response?.data?.message || 'Gagal menghubungkan ke server');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
      if (setRefreshing) setRefreshing(false);
    });
  }
};

interface PaymentDetailsProps {
  paymentId: string;
  modal: ModalProps;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setData: Dispatch<SetStateAction<any>>;
}

export const customerPaymentDetailsFetched = async ({ paymentId, setData, setLoading, modal }: PaymentDetailsProps) => {
  try {
    setLoading(true);
    const response = await api.get(`/mobile/customers/payments/${paymentId}`);
    if (response.data?.success) {
      setData(response.data.data);
    } else {
      processFail(modal, 'Error', response.data?.message || 'Gagal memuat detail pembayaran');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Error', axiosError.response?.data?.message || 'Gagal menghubungkan ke server');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
    });
  }
};

interface ProfileFetchProps {
  modal: ModalProps;
  setData: (data: any) => void;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const customerProfileFetched = async ({ setData, modal, setRefreshing }: ProfileFetchProps) => {
  try {
    processStart(modal, 'Memuat profile...');
    const response = await api.get('/mobile/customers/profile');
    if (response.data?.success) {
      setData(response.data.data);
    } else {
      processFail(modal, 'Error', response.data?.message || 'Gagal memuat profil');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Error', axiosError.response?.data?.message || 'Gagal memuat profil');
  } finally {
    processFinish(modal, () => {
      if (setRefreshing) setRefreshing(false);
    });
  }
};

interface ProfileUpdateProps {
  modal: ModalProps;
  values: any;
  setProcessing: (processing: boolean) => void;
  onSuccess?: () => void;
}

export const customerProfileUpdated = async ({ modal, values, setProcessing, onSuccess }: ProfileUpdateProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang menyimpan profil...');
    const response = await api.put('/mobile/customers/profile', values);
    if (response.data?.success) {
      processSuccess(modal, 'Berhasil', 'Data pribadi berhasil diperbarui', () => {
        onSuccess?.();
      });
    } else {
      processFail(modal, 'Gagal', response.data?.message || 'Gagal menyimpan profil');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal menyimpan profil');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

interface AddressUpdateProps {
  modal: ModalProps;
  values: any;
  setProcessing: (processing: boolean) => void;
  onSuccess?: () => void;
}

export const customerAddressUpdated = async ({ modal, values, setProcessing, onSuccess }: AddressUpdateProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang menyimpan alamat...');
    const response = await api.put('/mobile/customers/address', values);
    if (response.data?.success) {
      processSuccess(modal, 'Berhasil', 'Data alamat berhasil diperbarui', () => {
        onSuccess?.();
      });
    } else {
      processFail(modal, 'Gagal', response.data?.message || 'Gagal menyimpan alamat');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal menyimpan alamat');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

interface JobUpdateProps {
  modal: ModalProps;
  values: any;
  setProcessing: (processing: boolean) => void;
  onSuccess?: () => void;
}

export const customerJobUpdated = async ({ modal, values, setProcessing, onSuccess }: JobUpdateProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang menyimpan pekerjaan...');
    const response = await api.put('/mobile/customers/job', values);
    if (response.data?.success) {
      processSuccess(modal, 'Berhasil', 'Data pekerjaan berhasil disimpan', () => {
        onSuccess?.();
      });
    } else {
      processFail(modal, 'Gagal', response.data?.message || 'Gagal menyimpan pekerjaan');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal menyimpan pekerjaan');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

interface JobDeleteProps {
  modal: ModalProps;
  setProcessing: (processing: boolean) => void;
  onSuccess?: () => void;
}

export const customerJobDeleted = async ({ modal, setProcessing, onSuccess }: JobDeleteProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang menghapus data pekerjaan...');
    const response = await api.delete('/mobile/customers/job');
    if (response.data?.success) {
      processSuccess(modal, 'Berhasil', 'Data pekerjaan berhasil dihapus', () => {
        onSuccess?.();
      });
    } else {
      processFail(modal, 'Gagal', response.data?.message || 'Gagal menghapus pekerjaan');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal menghapus pekerjaan');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};
