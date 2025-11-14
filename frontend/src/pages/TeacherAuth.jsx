import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSignIn, useSignUp, useUser } from "@clerk/clerk-react";
import { 
  Users, 
  BookOpen, 
  Lightbulb, 
  BarChart3, 
  GraduationCap,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  Loader,
  CheckCircle,
  Sparkles
} from "lucide-react";
import ParticleBackground from "../components/animations/ParticleBackground";
import { teacherAPI } from "../utils/api";
import TeacherIdModal from "../components/modals/TeacherIdModal";

export default function TeacherAuth() {
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
    teacherId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTeacherIdModal, setShowTeacherIdModal] = useState(false);
  const [generatedTeacherId, setGeneratedTeacherId] = useState("");
  
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
    if (isLoaded && isSignedIn && !showTeacherIdModal) {
      navigate("/teacher/dashboard");
    }
  }, [isSignedIn, isLoaded, navigate, showTeacherIdModal]);

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

      console.log("Generating teacher ID for:", email);

      // Generate teacher ID from your backend
      const response = await teacherAPI.generateTeacherId(email);
      console.log("Teacher ID response:", response);

      if (response?.data?.teacherId) {
        const teacherId = response.data.teacherId;
        setGeneratedTeacherId(teacherId);

        // Send email verification code
        console.log("Email verification code sent to:", email);

        // Show OTP verification screen
        setShowOtpVerification(true);
        setPendingVerification({ 
          email: email, 
          firstName: firstName, 
          lastName: lastName, 
          teacherId: teacherId 
        });
        
        console.log("✅ Please check your email for the verification code");
      } else {
        throw new Error("Failed to generate teacher ID");
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

        const { email, firstName, lastName, teacherId } = pendingVerification;

        if (userId) {
          // Set user role to teacher in backend
          try {
            const teacherName = `${firstName} ${lastName}`;
            
            console.log("Setting teacher role with:", { userId, teacherId, email, teacherName });
            
            const roleResponse = await fetch('http://localhost:5000/api/user/set-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                role: 'teacher',
                teacher_id: teacherId,
                email: email,
                name: teacherName
              })
            });
            
            const roleData = await roleResponse.json();
            console.log("Set role response:", roleData);
            
            if (!roleResponse.ok) {
              console.error("Failed to set teacher role:", roleData);
              // Continue anyway - role can be set later
            } else {
              console.log("Teacher role set in database successfully");
            }
          } catch (roleError) {
            console.error("Failed to set teacher role:", roleError);
            // Continue anyway - role can be set later
          }
        } else {
          console.error("Could not obtain user ID after verification");
          console.log("Continuing anyway - role can be set on first sign-in");
        }

        // Store in localStorage
        localStorage.setItem('role', 'teacher');
        localStorage.setItem("teacherId", teacherId);

        // Hide OTP form and show teacher ID modal
        setShowOtpVerification(false);
        setShowTeacherIdModal(true);
        
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
      setError("");
      
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

        // Get teacher ID from backend if exists
        let userId = user?.id;
        
        // Try to get from result if user hook hasn't updated yet
        if (!userId && result.createdUserId) {
          userId = result.createdUserId;
        }

        // Fetch user profile to get teacher ID
        if (userId) {
          try {
            const profileResponse = await fetch(`http://localhost:5000/api/user/profile/${userId}`);
            const profileData = await profileResponse.json();
            
            if (profileData.teacher_id) {
              // Store teacher ID from profile
              localStorage.setItem("teacherId", profileData.teacher_id);
              console.log("✅ Teacher ID retrieved from profile:", profileData.teacher_id);
            }
          } catch (profileError) {
            console.error("Failed to fetch profile:", profileError);
          }
        }

        // Store role in localStorage
        localStorage.setItem('role', 'teacher');

        console.log("Sign-in complete, navigating to dashboard");
        navigate("/teacher/dashboard");
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

  const handleTeacherIdModalClose = () => {
    setShowTeacherIdModal(false);
    navigate("/teacher/dashboard");
  };

  const features = [
    {
      icon: Users,
      text: "Manage Classes",
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: BookOpen,
      text: "Create Courses",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Lightbulb,
      text: "AI Insights",
      color: "from-blue-700 to-blue-800",
    },
    {
      icon: BarChart3,
      text: "Track Students",
      color: "from-cyan-600 to-blue-600",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <ParticleBackground />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 hidden lg:block"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-2xl">
                <GraduationCap className="w-20 h-20 text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Welcome, Teacher!
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Empower your students with{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                intelligent
              </span>{" "}
              teaching tools
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  className="relative group"
                >
                  <div className="relative bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 shadow-md`}
                    >
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {feature.text}
                    </p>
                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: "50K+", label: "Teachers" },
                { value: "99%", label: "Success Rate" },
                { value: "10M+", label: "Students" }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
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
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border-2 border-gray-200 dark:border-slate-700">
              {/* Mobile Branding */}
              <div className="lg:hidden text-center mb-6">
                <motion.div 
                  className="inline-block mb-3"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Teacher Portal
                </h2>
              </div>

              {/* Toggle Buttons */}
              <div className="flex gap-2 p-2 bg-gray-100 dark:bg-slate-900 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError("");
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    !isSignUp
                      ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    isSignUp
                      ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Custom Auth Form */}
              {showOtpVerification ? (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center mb-6">
                    <motion.div 
                      className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      Verify Your Email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      We sent a verification code to
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pendingVerification?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      disabled={loading}
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || !signUpLoaded || otp.length !== 6}
                    whileHover={!loading && otp.length === 6 ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!loading && otp.length === 6 ? { scale: 0.98 } : {}}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      loading || otp.length !== 6
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-lg hover:from-blue-700 hover:to-blue-900"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify Email"
                    )}
                  </motion.button>

                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Didn't receive the code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm font-semibold"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={isSignUp ? handleSignUp : handleSignIn}
                  className="space-y-4"
                >
                  {isSignUp && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="John"
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Doe"
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="teacher@example.com"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={
                          isSignUp
                            ? "Create password (min 8 chars)"
                            : "Enter password"
                        }
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || !signInLoaded || !signUpLoaded}
                    whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      loading
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-lg hover:from-blue-700 hover:to-blue-900"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>
                          {isSignUp ? "Creating Account..." : "Signing In..."}
                        </span>
                      </div>
                    ) : isSignUp ? (
                      "Sign Up"
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
              )}

              {/* Back Button */}
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  type="button"
                  onClick={() => navigate("/role-selection")}
                  className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
                  whileHover={{ x: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Role Selection</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Teacher ID Modal */}
      {showTeacherIdModal && (
        <TeacherIdModal
          teacherId={generatedTeacherId}
          onClose={handleTeacherIdModalClose}
        />
      )}
    </div>
  );
}