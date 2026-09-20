import React, { createContext, useCallback, useState } from 'react';
import ConfirmModal from '@/components/modals/ConfimModal';
import ResultModal from '@/components/modals/ResultModal';
import ProcessModal from '@/components/modals/ProcessModal';

type ResultType = 'success' | 'error';

export interface ModalProps {
  process: {
    show: (title: string, sub?: string) => void;
    hide: () => void;
  };
  confirm: {
    show: (title: string, message: string, onConfirm: () => void) => void;
  };
  result: {
    success: (title: string, message: string, onClose?: () => void) => void;
    error: (title: string, message: string, onClose?: () => void) => void;
  };
}

export const ModalContext = createContext<ModalProps | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [processVisible, setProcessVisible] = useState(false);
  const [processTitle, setProcessTitle] = useState('');
  const [processSub, setProcessSub] = useState('');

  const showProcess = useCallback((title: string, sub?: string) => {
    setProcessTitle(title);
    setProcessSub(sub ?? '');
    setProcessVisible(true);
  }, []);

  const hideProcess = useCallback(() => {
    setProcessVisible(false);
  }, []);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setConfirmVisible(true);
  }, []);

  const [resultVisible, setResultVisible] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState<ResultType>('success');
  const [resultAction, setResultAction] = useState<(() => void) | null>(null);

  const showResult = useCallback((type: ResultType, title: string, message: string, onClose?: () => void) => {
    setResultTitle(title);
    setResultMessage(message);
    setResultType(type);
    setResultAction(() => onClose ?? null);
    setResultVisible(true);
  }, []);

  const showSuccess = useCallback((title: string, message: string, onClose?: () => void) => {
    showResult('success', title, message, onClose);
  }, [showResult]);

  const showError = useCallback((title: string, message: string, onClose?: () => void) => {
    showResult('error', title, message, onClose);
  }, [showResult]);

  const value = React.useMemo<ModalProps>(() => ({
    process: {
      show: showProcess,
      hide: hideProcess,
    },
    confirm: {
      show: showConfirm,
    },
    result: {
      success: showSuccess,
      error: showError,
    },
  }), [showProcess, hideProcess, showConfirm, showSuccess, showError]);

  return (
    <ModalContext.Provider value={value}>
      {children}

      <ProcessModal visible={processVisible} message={processTitle} subMessage={processSub} />

      <ConfirmModal
        visible={confirmVisible}
        title={confirmTitle}
        message={confirmMessage}
        cancelText="Batal"
        confirmText="Ya"
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          confirmAction?.();
        }}
      />

      <ResultModal
        visible={resultVisible}
        title={resultTitle}
        message={resultMessage}
        type={resultType}
        autoClose
        autoCloseDuration={resultType === 'error' ? 3500 : 2200}
        onClose={() => {
          setResultVisible(false);
          resultAction?.();
          setResultAction(null);
        }}
      />
    </ModalContext.Provider>
  );
};
