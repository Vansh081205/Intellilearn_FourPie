import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import { 
  Brain, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
  Sparkles,
  GraduationCap,
  BarChart3,
  Award
} from 'lucide-react';
import ParticleBackground from '../components/animations/ParticleBackground';
import { studentAPI } from '../utils/api';
import StudentIdModal from '../components/modals/StudentIdModal';

export default function StudentAuth() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();
  const {
    signUp,
    isLoaded: signUpLoaded,
    setActive: setSignUpActive,
  } = useSignUp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    studentId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStudentIdModal, setShowStudentIdModal] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState("");
  
  // OTP verification states
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingVerification, setPendingVerification] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved
        ? JSON.parse(saved)
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !showStudentIdModal) {
      navigate("/student/dashboard");
    }
  }, [isSignedIn, isLoaded, navigate, showStudentIdModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!signUpLoaded) return;

    try {
      setLoading(true);
      setError("");

      const { email, password, firstName, lastName } = formData;

      // Validation
      if (!firstName || !lastName || !email || !password) {
        setError("All fields are required");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      console.log("Starting Clerk sign-up...");

      // Create sign-up with Clerk
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      console.log("Sign-up result:", result);

      // Send email verification
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      console.log("Generating student ID for:", email);

      // Generate student ID from your backend
      const response = await studentAPI.generateStudentId(email);
      console.log("Student ID response:", response);

      if (response?.data?.studentId) {
        const studentId = response.data.studentId;
        setGeneratedStudentId(studentId);

        // Send email verification code
        console.log("Email verification code sent to:", email);

        // Show OTP verification screen
        setShowOtpVerification(true);
        setPendingVerification({ 
          email: email, 
          firstName: firstName, 
          lastName: lastName, 
          studentId: studentId 
        });
        
        console.log("✅ Please check your email for the verification code");
      } else {
        throw new Error("Failed to generate student ID");
      }
    } catch (err) {
      console.error("Sign-up error:", err);

      if (err.errors) {
        setError(err.errors[0]?.message || "Sign-up failed");
      } else {
        setError(err.message || "Sign-up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!signUpLoaded) return;

    try {
      setLoading(true);
      setError("");

      console.log("Verifying OTP code:", otp);

      // Verify the email address with OTP
      const verificationResult = await signUp.attemptEmailAddressVerification({
        code: otp,
      });

      console.log("OTP verification result:", verificationResult);

      if (verificationResult.status === "complete") {
        console.log("Email verified successfully!");

        // Now complete the sign-up and set the session
        console.log("Activating session...");
        const sessionResult = await setSignUpActive({ 
          session: verificationResult.createdSessionId 
        });
        console.log("Session activation result:", sessionResult);

        // Get user ID from the activated session
        let userId = null;
        
        // Method 1: From the verified result
        if (verificationResult.createdUserId) {
          userId = verificationResult.createdUserId;
          console.log("User ID from verification result:", userId);
        }
        
        // Method 2: Wait briefly for user hook to update
        if (!userId) {
          console.log("Waiting for user object to populate...");
          for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (user?.id) {
              userId = user.id;
              console.log("User ID from useUser hook:", userId);
              break;
            }
          }
        }

        const { email, firstName, lastName, studentId } = pendingVerification;

        if (userId) {
          // Set user role to student in backend
          try {
            const studentName = `${firstName} ${lastName}`;
            
            console.log("Setting student role with:", { userId, studentId, email, studentName });
            
            const roleResponse = await fetch('http://localhost:5000/api/user/set-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                role: 'student',
                teacher_id: studentId,  // Using teacher_id field for student_id
                email: email,
                name: studentName
              })
            });
            
            const roleData = await roleResponse.json();
            console.log("Set role response:", roleData);
            
            if (!roleResponse.ok) {
              console.error("Failed to set student role:", roleData);
              // Continue anyway - role can be set later
            } else {
              console.log("Student role set in database successfully");
            }
          } catch (roleError) {
            console.error("Failed to set student role:", roleError);
            // Continue anyway - role can be set later
          }
        } else {
          console.error("Could not obtain user ID after verification");
          console.log("Continuing anyway - role can be set on first sign-in");
        }

        // Store in localStorage
        localStorage.setItem('role', 'student');
        localStorage.setItem("studentId", studentId);

        // Hide OTP form and show student ID modal
        setShowOtpVerification(false);
        setShowStudentIdModal(true);
        
        // Clear OTP and pending verification
        setOtp("");
        setPendingVerification(null);
      } else {
        setError("Email verification incomplete. Status: " + verificationResult.status);
      }
    } catch (err) {
      console.error("OTP verification error:", err);

      if (err.errors) {
        setError(err.errors[0]?.message || "OTP verification failed");
      } else {
        setError(err.message || "Invalid OTP code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Resending OTP to:", pendingVerification?.email);
      
      // Resend the verification email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      
      console.log("OTP resent successfully");
      setError(""); // Clear any existing errors
      
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!signInLoaded) return;

    try {
      setLoading(true);
      setError("");

      const { email, password } = formData;

      // Validation
      if (!email || !password) {
        setError("All fields are required");
        return;
      }

      console.log("Proceeding with Clerk sign-in for:", email);

      // Proceed with Clerk sign-in
      const result = await signIn.create({
        identifier: email,
        password,
      });

      console.log("Sign-in result:", result);

      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId });

        // Wait a moment for user object to be available
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get student ID from backend if exists
        let userId = user?.id;
        
        // Try to get from result if user hook hasn't updated yet
        if (!userId && result.createdUserId) {
          userId = result.createdUserId;
        }

        // Fetch user profile to get student ID
        if (userId) {
          try {
            const profileResponse = await fetch(`http://localhost:5000/api/user/profile/${userId}`);
            const profileData = await profileResponse.json();
            
            if (profileData.teacher_id) {
              // Store student ID from profile (using teacher_id field)
              localStorage.setItem("studentId", profileData.teacher_id);
              console.log("✅ Student ID retrieved from profile:", profileData.teacher_id);
            }
          } catch (profileError) {
            console.error("Failed to fetch profile:", profileError);
          }
        }

        // Store role in localStorage
        localStorage.setItem('role', 'student');

        console.log("Sign-in complete, navigating to dashboard");
        navigate("/student/dashboard");
      } else {
        // Handle other statuses (needs_first_factor, needs_second_factor, etc.)
        console.error("Sign-in incomplete:", result.status);
        setError("Sign-in incomplete. Please try again.");
      }
    } catch (err) {
      console.error("Sign-in error:", err);

      // Check for specific error messages
      const errorMessage = err.errors?.[0]?.message || err.message || "";
      
      if (errorMessage.includes("Couldn't find your account") || 
          errorMessage.includes("account not found")) {
        setError(
          "Account not found. Please check your email or sign up first."
        );
      } else if (errorMessage.includes("password")) {
        setError("Incorrect password. Please try again.");
      } else if (err.errors) {
        setError(err.errors[0]?.message || "Sign-in failed");
      } else {
        setError(
          errorMessage || "Authentication failed. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentIdModalClose = () => {
    setShowStudentIdModal(false);
    navigate("/student/dashboard");
  };

  const features = [
    { icon: Brain, text: "AI-Powered Learning", color: "text-blue-600 dark:text-blue-400" },
    { icon: BookOpen, text: "Smart Summaries", color: "text-blue-700 dark:text-blue-500" },
    { icon: Target, text: "Track Progress", color: "text-blue-500 dark:text-blue-300" },
    { icon: Zap, text: "Quick Quizzes", color: "text-blue-800 dark:text-blue-600" }
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <ParticleBackground />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block space-y-8"
          >
            <div>
              <motion.div 
                className="flex items-center gap-3 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  IntelliLearn+
                </h1>
              </motion.div>
              
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome Back, Student!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Access your personalized learning dashboard and continue your journey
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ x: 10, transition: { duration: 0.2 } }}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {feature.text}
                  </span>
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-auto" />
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: "150K+", label: "Students", icon: GraduationCap },
                { value: "98%", label: "Success Rate", icon: Award },
                { value: "5M+", label: "Quizzes", icon: BarChart3 }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-slate-700 p-8 shadow-2xl">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-6">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-3 shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Brain className="w-7 h-7 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Student Portal
                </h2>
              </div>

              {showOtpVerification ? (
                // OTP Verification Form
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Verify Your Email
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We sent a verification code to
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pendingVerification?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      disabled={loading}
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <motion.div 
                      className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || !signUpLoaded || otp.length !== 6}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </div>
                    ) : (
                      "Verify Email"
                    )}
                  </motion.button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                    >
                      Didn't receive the code? Resend
                    </button>
                  </div>
                </form>
              ) : (
                // Sign In / Sign Up Form
                <>
                  {/* Toggle Tabs */}
                  <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-lg mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError("");
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${
                        !isSignUp
                          ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setError("");
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${
                        isSignUp
                          ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form
                    onSubmit={isSignUp ? handleSignUp : handleSignIn}
                    className="space-y-4"
                  >
                    {isSignUp && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            First Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="John"
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Last Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Doe"
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="student@example.com"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder={isSignUp ? "Min. 8 characters" : "Enter your password"}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {error}
                        </p>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading || !signInLoaded || !signUpLoaded}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {isSignUp ? "Creating Account..." : "Signing In..."}
                        </div>
                      ) : isSignUp ? (
                        "Create Account"
                      ) : (
                        "Sign In"
                      )}
                    </motion.button>

                    {!isSignUp && (
                      <div className="text-center">
                        <button
                          type="button"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>

            {/* Back Button */}
            <motion.div 
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={() => navigate("/role-selection")}
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                whileHover={{ x: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to role selection</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Student ID Modal */}
      {showStudentIdModal && (
        <StudentIdModal
          studentId={generatedStudentId}
          onClose={handleStudentIdModalClose}
        />
      )}
    </div>
  );
}