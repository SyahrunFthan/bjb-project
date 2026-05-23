import { ModalContext } from '@/contexts/ModalContext';
import { useContext } from 'react';

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used inside ModalProvider');
  }

  return context;
};
