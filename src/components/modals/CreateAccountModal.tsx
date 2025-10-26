import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Hash, Plus } from 'lucide-react';
import Modal from './Modal';
import { useAccounts } from '../../hooks/useAccounts';
import { useToast } from '../../contexts/ToastContext';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAccountModal({
  isOpen,
  onClose,
}: CreateAccountModalProps) {
  const { createAccount } = useAccounts();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    account_email: '',
    account_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.account_name.trim()) {
      toast.error('Please enter account name');
      return;
    }

    if (!formData.account_email.trim()) {
      toast.error('Please enter account email');
      return;
    }

    if (!formData.account_id.trim()) {
      toast.error('Please enter account ID');
      return;
    }

    try {
      setLoading(true);
      await createAccount(formData);
      toast.success('GMB Account connected successfully!');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to connect account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      account_name: '',
      account_email: '',
      account_id: '',
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Connect GMB Account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-300">
            Connect your Google My Business account to start managing your locations,
            posts, and reviews. You'll need your GMB account details.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Account Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <input
              type="text"
              value={formData.account_name}
              onChange={(e) =>
                setFormData({ ...formData, account_name: e.target.value })
              }
              required
              className="w-full bg-black border border-neon-orange shadow-neon-orange rounded-lg pl-11 pr-4 py-3 text-white placeholder-white focus:outline-none focus:border-neon-orange shadow-neon-orange transition-colors"
              placeholder="My Business Account"
            />
          </div>
          <p className="text-xs text-white mt-1">
            A friendly name to identify this account
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Google Account Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <input
              type="email"
              value={formData.account_email}
              onChange={(e) =>
                setFormData({ ...formData, account_email: e.target.value })
              }
              required
              className="w-full bg-black border border-neon-orange shadow-neon-orange rounded-lg pl-11 pr-4 py-3 text-white placeholder-white focus:outline-none focus:border-neon-orange shadow-neon-orange transition-colors"
              placeholder="business@company.com"
            />
          </div>
          <p className="text-xs text-white mt-1">
            The Google account email associated with GMB
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            GMB Account ID
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <input
              type="text"
              value={formData.account_id}
              onChange={(e) =>
                setFormData({ ...formData, account_id: e.target.value })
              }
              required
              className="w-full bg-black border border-neon-orange shadow-neon-orange rounded-lg pl-11 pr-4 py-3 text-white placeholder-white focus:outline-none focus:border-neon-orange shadow-neon-orange transition-colors"
              placeholder="accounts/123456789"
            />
          </div>
          <p className="text-xs text-white mt-1">
            Your GMB account ID (found in GMB dashboard)
          </p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs text-yellow-300">
            <strong>Note:</strong> This is a demo connection. In production, this would
            trigger OAuth flow to securely connect your Google account.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Connecting...' : 'Connect Account'}</span>
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
