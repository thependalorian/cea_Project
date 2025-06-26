import { useRef, useEffect, useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info'
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  const variantClasses = {
    danger: 'btn-error',
    warning: 'btn-warning',
    info: 'btn-info',
    success: 'btn-success'
  };

  return (
    <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onCancel}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn ${variantClasses[variant]}`} 
            onClick={() => {
              onConfirm();
              modalRef.current?.close();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
}

export function useConfirmationModal() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirmation = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    variant = 'info'
  }: Omit<ConfirmationModalProps, 'isOpen' | 'onCancel'>) => {
    setModalState({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      variant,
    });
  };

  const hideConfirmation = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const ConfirmationModalComponent = () => (
    <ConfirmationModal
      {...modalState}
      onCancel={hideConfirmation}
    />
  );

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationModalComponent,
  };
} 