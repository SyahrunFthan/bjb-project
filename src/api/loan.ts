import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processFail, processFinish, processStart, processSuccess } from '@/lib/process';
import { Customer } from '@/model/customer';
import { CustomerDocument } from '@/model/customerDocument';
import { Loan } from '@/model/loan';
import { RequirementDocument } from '@/model/requirementDocument';
import { TenorModel } from '@/model/tenor';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface ErrorResponse {
  message?: string;
}

export const fetchTenors = async (
  setTenors: Dispatch<SetStateAction<TenorModel[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  modal: ModalProps,
): Promise<void> => {
  try {
    setLoading(true);
    const response = await api.get('/tenors?status=active');
    const tenorData = (response.data?.data || response.data || []) as TenorModel[];
    setTenors(tenorData);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching tenors:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mengambil data tenor.');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
    });
  }
};

export const fetchRequirementDocs = async (
  setRequirementDocs: Dispatch<SetStateAction<RequirementDocument[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  modal: ModalProps,
): Promise<void> => {
  try {
    setLoading(true);
    const response = await api.get('/requirement-documents');
    const docData = (response.data?.data || response.data || []) as RequirementDocument[];
    setRequirementDocs(docData);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching requirement documents:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mengambil daftar dokumen persyaratan.');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
    });
  }
};

export const fetchCustomerDocuments = async (
  customerId: string,
  setCustomerDocs: Dispatch<SetStateAction<CustomerDocument[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  modal: ModalProps,
): Promise<void> => {
  try {
    setLoading(true);
    const response = await api.get(`/customers/${customerId}/documents`);
    setCustomerDocs((response.data || []) as CustomerDocument[]);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching customer documents:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mengambil dokumen nasabah.');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
    });
  }
};

export const uploadCustomerDocument = async (
  customerId: string,
  requirementDocId: string,
  fileName: string,
  fileUri: string,
  fileType: string,
  modal: ModalProps,
  onSuccess: (uploadedDoc: CustomerDocument) => void,
): Promise<void> => {
  try {
    processStart(modal, 'Sedang mengunggah dokumen...');

    const formData = new FormData();
    formData.append('requirement_document_id', requirementDocId);

    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType || 'image/jpeg',
    } as unknown as Blob);

    const response = await api.post(`/customers/${customerId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200 || response.status === 201) {
      processSuccess(modal, 'Berhasil', 'Dokumen berhasil diunggah', () => {
        processFinish(modal);
        onSuccess(response.data.document as CustomerDocument);
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error uploading customer document:', error);
    processFail(modal, 'Upload Gagal', axiosError.response?.data?.message || 'Gagal mengunggah dokumen.');
  } finally {
    processFinish(modal);
  }
};

export const uploadCustomerDocSimulated = async (
  customerId: string,
  requirementDocId: string,
  fileName: string,
  modal: ModalProps,
  onSuccess: (uploadedDoc: CustomerDocument) => void,
): Promise<void> => {
  try {
    processStart(modal, 'Sedang mengunggah dokumen...');

    const response = await api.post(`/customers/${customerId}/documents`, {
      requirement_document_id: requirementDocId,
      is_mock: true,
      file_name: fileName,
    });

    if (response.status === 200 || response.status === 201) {
      processSuccess(modal, 'Berhasil', 'Dokumen berhasil diunggah', () => {
        processFinish(modal);
        onSuccess(response.data.document as CustomerDocument);
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error uploading simulated document:', error);
    processFail(modal, 'Upload Gagal', axiosError.response?.data?.message || 'Gagal mengunggah dokumen.');
  } finally {
    processFinish(modal);
  }
};

export const loanStore = async (
  values: {
    customer_id: string;
    tenor_id: string;
    amount: number;
    address?: {
      province_id: string;
      regency_id: string;
      district_id: string;
      sub_district_id: string;
      neighborhood_unit?: string;
      community_unit?: string;
      postal_code: number;
      address: string;
    };
    job?: {
      company_name: string;
      position: string;
      salary: number;
      address: string;
    };
  },
  modal: ModalProps,
  setProcessing: Dispatch<SetStateAction<boolean>>,
  goBack: () => void,
): Promise<void> => {
  try {
    setProcessing(true);
    processStart(modal, 'Mengirim pengajuan pinjaman...');

    const response = await api.post('/mobile/loans', values);

    if (response.status === 201) {
      processSuccess(modal, 'Berhasil', 'Pengajuan pinjaman berhasil dibuat.', () => {
        processFinish(modal);
        setProcessing(false);
        goBack();
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    processFail(modal, 'Pengajuan Gagal', axiosError.response?.data?.message || 'Gagal membuat pengajuan pinjaman.');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

export const loanUpdate = async (
  id: string,
  values: {
    customer_id: string;
    tenor_id: string;
    amount: number;
    address?: {
      province_id: string;
      regency_id: string;
      district_id: string;
      sub_district_id: string;
      neighborhood_unit?: string;
      community_unit?: string;
      postal_code: number;
      address: string;
    };
    job?: {
      company_name: string;
      position: string;
      salary: number;
      address: string;
    };
  },
  modal: ModalProps,
  setProcessing: Dispatch<SetStateAction<boolean>>,
  goBack: () => void,
): Promise<void> => {
  try {
    setProcessing(true);
    processStart(modal, 'Menyimpan perubahan pengajuan...');
    const response = await api.put(`/mobile/loans/${id}`, values);
    if (response.status === 200) {
      processSuccess(modal, 'Berhasil', 'Pengajuan pinjaman berhasil diperbarui.', () => {
        processFinish(modal);
        setProcessing(false);
        goBack();
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    processFail(modal, 'Pembaruan Gagal', axiosError.response?.data?.message || 'Gagal memperbarui pengajuan pinjaman.');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

export const loanDelete = async (id: string, modal: ModalProps, onSuccess: () => void): Promise<void> => {
  try {
    processStart(modal, 'Menghapus pengajuan pinjaman...');
    const response = await api.delete(`/mobile/loans/${id}`);
    if (response.status === 200) {
      processSuccess(modal, 'Berhasil', 'Pengajuan pinjaman berhasil dihapus.', () => {
        processFinish(modal);
        onSuccess();
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error deleting loan:', error);
    processFail(modal, 'Gagal Menghapus', axiosError.response?.data?.message || 'Gagal menghapus pengajuan pinjaman.');
  } finally {
    processFinish(modal);
  }
};

export const fetchCustomerDetails = async (customerId: string): Promise<Customer | null> => {
  try {
    const response = await api.get('/mobile/employees/customers');
    const list = (response.data || []) as Customer[];
    return list.find(c => c.id === customerId) || null;
  } catch (error) {
    console.warn('Error fetching customer details:', error);
    return null;
  }
};

export const fetchCustomerOptions = async (query: string): Promise<{ label: string; value: string | number }[]> => {
  const response = await api.get(`/mobile/employees/customers?search=${query}`);
  const list = (response.data || []) as Customer[];
  return list.map(c => ({
    label: c.full_name,
    value: c.id,
  }));
};

export const fetchLoans = async (
  setLoans: Dispatch<SetStateAction<Loan[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  queries: Record<string, string>,
  modal: ModalProps,
): Promise<void> => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(queries).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      }
    });

    const response = await api.get(`/mobile/loans?${params.toString()}`);
    const loanData = (response.data?.data || response.data || []) as Loan[];
    setLoans(loanData);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mengambil data pengajuan.');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
    });
  }
};

export const fetchProvinces = async (query: string): Promise<{ label: string; value: string | number }[]> => {
  const response = await api.get(`/areas/province?q=${query}`);
  const list = (response.data || []) as { id: string; name: string }[];
  return list.map(item => ({ label: item.name, value: item.id }));
};

export const fetchRegencies = async (provinceId: string, query: string): Promise<{ label: string; value: string | number }[]> => {
  if (!provinceId) return [];
  const response = await api.get(`/areas/regency?province_id=${provinceId}&q=${query}`);
  const list = (response.data || []) as { id: string; name: string }[];
  return list.map(item => ({ label: item.name, value: item.id }));
};

export const fetchDistricts = async (regencyId: string, query: string): Promise<{ label: string; value: string | number }[]> => {
  if (!regencyId) return [];
  const response = await api.get(`/areas/district?regency_id=${regencyId}&q=${query}`);
  const list = (response.data || []) as { id: string; name: string }[];
  return list.map(item => ({ label: item.name, value: item.id }));
};

export const fetchSubDistricts = async (districtId: string, query: string): Promise<{ label: string; value: string | number }[]> => {
  if (!districtId) return [];
  const response = await api.get(`/areas/sub-district?district_id=${districtId}&q=${query}`);
  const list = (response.data || []) as { id: string; name: string }[];
  return list.map(item => ({ label: item.name, value: item.id }));
};

export const fetchLoanDetails = async (
  id: string,
  setLoan: Dispatch<SetStateAction<Loan | null>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  modal: ModalProps,
): Promise<void> => {
  try {
    setLoading(true);
    const response = await api.get(`/mobile/loans/${id}`);
    const loanData = response.data as Loan;
    setLoan(loanData);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching loan details:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mengambil detail pinjaman.');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
    });
  }
};

export const fetchCustomerLoanDetails = async (
  id: string,
  setLoan: Dispatch<SetStateAction<any>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  modal: ModalProps,
): Promise<void> => {
  try {
    setLoading(true);
    const response = await api.get(`/mobile/customers/loans/${id}`);
    setLoan(response.data?.data || null);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching customer loan details:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mengambil detail pinjaman.');
  } finally {
    processFinish(modal, () => {
      setLoading(false);
    });
  }
};

export const collectPayment = async (
  values: {
    installment_id: string;
    amount: number;
    payment_method: string;
  },
  modal: ModalProps,
  setProcessing: Dispatch<SetStateAction<boolean>>,
  onSuccess: () => void,
): Promise<void> => {
  try {
    setProcessing(true);
    processStart(modal, 'Mencatat pembayaran...');
    const response = await api.post('/mobile/payments', values);
    if (response.status === 201) {
      processSuccess(modal, 'Berhasil', 'Pembayaran angsuran berhasil dicatat.', () => {
        processFinish(modal);
        setProcessing(false);
        onSuccess();
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error collecting payment:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mencatat pembayaran angsuran.');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};
