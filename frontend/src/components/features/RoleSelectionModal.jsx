import { GraduationCap, BookOpen, Sparkles, Target, Brain, Lightbulb, Users, PersonStanding } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleSelectionModal({ onRoleSelect }) {
  const roles = [
    {
      name: 'Student',
      icon: GraduationCap,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      darkBgGradient: 'from-blue-900/20 to-cyan-900/20',
      description: 'Learn at your own pace with AI-powered guidance',
      features: [
        { icon: Brain, text: 'Adaptive Learning' },
        { icon: Target, text: 'Track Progress' },
        { icon: Sparkles, text: 'Personalized Content' }
      ]
    },
    {
      name: 'Teacher',
      icon: PersonStanding,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      darkBgGradient: 'from-purple-900/20 to-pink-900/20',
      description: 'Empower students with intelligent teaching tools',
      features: [
        { icon: Users, text: 'Manage Classes' },
        { icon: BookOpen, text: 'Create Courses' },
        { icon: Lightbulb, text: 'AI Insights' }
      ]
    },
  ];

  return (
    <motion.div
      className="scale-75 fixed inset-0 z-20 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass rounded-3xl p-8 sm:p-12 shadow-2xl w-full max-w-5xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
      >
        <div className="text-center mb-12">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="inline-block text-7xl mb-6"
          >
            🧠
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome to <span className="gradient-text">IntelliLearn+</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your role to unlock your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.name}
                className="group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-2xl"
                onClick={() => onRoleSelect(role.name.toLowerCase())}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} dark:bg-gradient-to-br dark:${role.darkBgGradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
                
                {/* Border Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="text-white" size={40} />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold mb-3 text-gray-800 dark:text-white">
                    {role.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {role.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3">
                    {role.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <motion.div
                          key={idx}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center`}>
                            <FeatureIcon className="text-white" size={16} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {feature.text}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Hover Arrow */}
                  <motion.div
                    className="mt-6 flex items-center gap-2 text-sm font-semibold"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                  >
                    <span className={`bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent`}>
                      Get Started
                    </span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent`}
                    >
                      →
                    </motion.span>
                  </motion.div>
                </div>

                {/* Glass Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/20 dark:border-white/10 group-hover:border-white/40 dark:group-hover:border-white/20 transition-colors" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}