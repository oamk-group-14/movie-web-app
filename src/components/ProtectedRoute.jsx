import { Navigate } from "react-router-dom";
import { useLogin } from "../context/LoginContext.jsx";

// Redirects to login page if user is not logged in
export function ProtectedRoute({ children }) {
    const { user, loading } = useLogin();

    // Wait until localStorage has been checked
    if (loading) {
        return <p>Loading...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}