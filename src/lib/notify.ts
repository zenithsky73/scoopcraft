import { toast } from 'sonner';
import { triggerCelebrationParticles } from '@/lib/celebrate';

export const notify = {
  success: (title: string, description?: string) => {
    return toast.success(title, {
      description,
      duration: 3500,
    });
  },

  error: (title: string, description?: string) => {
    return toast.error(title, {
      description,
      duration: 4500,
    });
  },

  warning: (title: string, description?: string) => {
    return toast.warning(title, {
      description,
      duration: 4000,
    });
  },

  info: (title: string, description?: string) => {
    return toast.info(title, {
      description,
      duration: 3500,
    });
  },

  /**
   * Notifikasi Selebrasi: Menampilkan toast modern berkilau DAN memicu ledakan partikel konfeti!
   */
  celebrate: (title: string, description?: string) => {
    triggerCelebrationParticles();
    return toast.success(title, {
      description,
      duration: 5000,
    });
  },

  promise: toast.promise,
  dismiss: toast.dismiss,
};
