import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { User, Mail, Calendar, Coins, Award, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function ProfileEdit({ onClose }) {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const response = await axios.get(`${API_BASE_URL}/user/profile/${user.id}`);
          setUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="glass p-8 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <p className="text-gray-700 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass rounded-2xl max-w-2xl w-full my-8 relative bg-white dark:bg-slate-800 shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-4">
            <img
              src={user?.imageUrl}
              alt={user?.fullName || 'User'}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            />
            <div className="text-white">
              <h2 className="text-3xl font-bold">{user?.fullName || 'User'}</h2>
              <p className="text-blue-100">@{user?.username || 'username'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Points & Subscription Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="text-blue-600 dark:text-blue-400" size={24} />
                <span className="text-sm text-gray-600 dark:text-gray-400">Points</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {userProfile?.points || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800/30 dark:to-cyan-800/30 p-4 rounded-xl border border-blue-300 dark:border-blue-600">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-blue-700 dark:text-blue-400" size={24} />
                <span className="text-sm text-gray-600 dark:text-gray-400">Subscription</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {userProfile?.subscription || 'Free'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-2">
                <User className="text-blue-600 dark:text-blue-400" size={24} />
                <span className="text-sm text-gray-600 dark:text-gray-400">Quizzes</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {userProfile?.quiz_count || 0}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Profile Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <User className="text-blue-600 dark:text-blue-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.fullName || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <Mail className="text-blue-600 dark:text-blue-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.primaryEmailAddress?.emailAddress || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Learning Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Documents Uploaded</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userProfile?.documents_uploaded || 0}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userProfile?.average_score || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Points Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">How to Earn Points</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                Easy Questions: <strong className="text-blue-600 dark:text-blue-400">5 points</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                Medium Questions: <strong className="text-blue-600 dark:text-blue-400">10 points</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                Hard Questions: <strong className="text-blue-600 dark:text-blue-400">20 points</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                Subscription Bonus: <strong className="text-blue-600 dark:text-blue-400">Up to 2000 points</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}