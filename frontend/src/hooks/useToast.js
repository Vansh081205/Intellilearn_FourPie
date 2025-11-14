import toast from 'react-hot-toast';

export const useToast = () => {
  const success = (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
      },
      ...options
    });
  };

  const error = (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
      },
      ...options
    });
  };

  const loading = (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        borderRadius: '12px',
        padding: '16px',
      },
      ...options
    });
  };

  return { success, error, loading };
};