import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Check, Crown, Zap, X, Sparkles, Star, Gift, Loader, Award, Rocket, Target, MessageCircle, TrendingUp, Palette, Lock, Trophy, Ticket } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function Subscription({ onClose }) {
  const { user } = useUser();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState('free');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subscription plans
        const plansResponse = await axios.get(`${API_BASE_URL}/subscription/plans`);
        setPlans(plansResponse.data.plans || []);

        // Fetch user's current subscription
        if (user?.id) {
          const profileResponse = await axios.get(`${API_BASE_URL}/user/profile/${user.id}`);
          setCurrentSubscription(profileResponse.data.subscription || 'free');
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSubscribe = async (planId) => {
    if (!user?.id) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setSubscribing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/subscription/${user.id}`, {
        plan_id: planId
      });

      if (response.data.success) {
        setCurrentSubscription(planId);
        toast.success(response.data.message);
        
        // Notify navbar to refresh points
        window.dispatchEvent(new CustomEvent('pointsUpdated'));
        
        // Show points bonus notification
        if (response.data.points > 0) {
          toast.success(`🎉 Bonus points added! Total: ${response.data.points}`, {
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to process subscription');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <p className="text-gray-700 dark:text-gray-300">Loading plans...</p>
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
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-6xl w-full my-8 relative shadow-2xl border-2 border-gray-200 dark:border-slate-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          <div className="text-center text-white">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h2 className="text-4xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-lg text-blue-100">
              Unlock premium features and earn bonus points!
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const isCurrentPlan = currentSubscription === plan.id;
              const isPro = plan.id === 'pro';
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`relative rounded-2xl p-6 border-2 transition-all ${
                    isPro
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 scale-105 shadow-xl'
                      : isCurrentPlan
                      ? 'border-blue-400 bg-white dark:bg-slate-800 shadow-lg'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md'
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                        <Sparkles size={14} />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 -right-3">
                      <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                        <Check size={20} />
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                      {plan.id === 'free' ? (
                        <Gift className="w-8 h-8 text-white" />
                      ) : plan.id === 'basic' ? (
                        <Star className="w-8 h-8 text-white" />
                      ) : (
                        <Crown className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        /{plan.interval}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing || isCurrentPlan}
                    whileHover={!isCurrentPlan && !subscribing ? { scale: 1.05, y: -2 } : {}}
                    whileTap={!isCurrentPlan && !subscribing ? { scale: 0.95 } : {}}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isCurrentPlan
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 cursor-not-allowed'
                        : isPro
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-xl hover:from-blue-700 hover:to-blue-900'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-xl hover:from-blue-600 hover:to-cyan-700'
                    }`}
                  >
                    {subscribing
                      ? 'Processing...'
                      : isCurrentPlan
                      ? 'Current Plan'
                      : plan.id === 'free'
                      ? 'Select Free Plan'
                      : 'Upgrade Now'}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                <Zap className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                  Why Upgrade?
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Unlock unlimited document uploads and advanced features
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Get personalized learning recommendations with AI
                  </li>
                  <li className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Earn bonus IntelliPoints with every subscription
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Access detailed analytics and performance insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Compete in exclusive multiplayer tournaments
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Priority support from our team
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Points System Info */}
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                <Crown className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  IntelliPoints Rewards
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Use your IntelliPoints to unlock special features across the platform:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Custom themes and avatars
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Premium content and study materials
                  </li>
                  <li className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Entry to exclusive competitions
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Special badges and achievements
                  </li>
                  <li className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Redeem for real-world rewards
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 text-center bg-gray-50 dark:bg-slate-900/50 rounded-b-2xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </motion.div>
    </div>
  );
}