import {BrowserRouter, Route, Routes, Navigate, useLocation} from "react-router-dom";
import { useEffect, useRef } from "react";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentAuth from "./pages/StudentAuth";
import TeacherAuth from "./pages/TeacherAuth";
import RoleSelection from "./pages/RoleSelection";
import Layout from "./components/layout/Layout"; // ✅ ADD THIS IMPORT
import { useUser } from "@clerk/clerk-react";

// ✅ IMPROVED Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const location = useLocation();
  const hasAuthChecked = useRef(false);

  // Store auth state in sessionStorage to prevent redirect loops
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      sessionStorage.setItem('isAuthenticated', 'true');
      hasAuthChecked.current = true;
    } else if (isLoaded && !isSignedIn) {
      sessionStorage.removeItem('isAuthenticated');
    }
  }, [isLoaded, isSignedIn]);

  // If Clerk is still loading, check if we have a stored auth state
  if (!isLoaded) {
    const wasAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (wasAuthenticated === 'true') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
          </div>
        </div>
      );
    }
  }

  // Only redirect if we're SURE the user is not signed in
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  // Check role if required
  if (isSignedIn && requiredRole) {
    const userRole = user?.publicMetadata?.role || localStorage.getItem("role");
    if (userRole !== requiredRole) {
      const dashboardPath = userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      return <Navigate to={dashboardPath} replace />;
    }
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes WITHOUT Layout */}
        <Route path="/" element={<Home />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/student/auth" element={<StudentAuth />} />
        <Route path="/teacher/auth" element={<TeacherAuth />} />
        
        {/* ✅ Protected routes WITH Layout (so chatbot appears) */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/dashboard" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <Layout>
                <TeacherDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="/auth" element={<Navigate to="/role-selection" replace />} />
        <Route path="/app" element={<Navigate to="/role-selection" replace />} />
      </Routes>
    </BrowserRouter>
  );
}