import CustomerCreateForm from '@/components/couriers/create-customers/CustomerCreateForm';
import { FormProvider } from '@/contexts/FormContext';
import React from 'react';

const CustomerCreateScreen = () => {
  return (
    <FormProvider>
      <CustomerCreateForm />
    </FormProvider>
  );
};

export default CustomerCreateScreen;
