import { createContext, useContext, useState, useEffect } from "react";

// Sharing login state for the components
const LoginContext = createContext(null);

// Shares who logged in and what can be done (logout, login, delete account)
export function LoginProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // Token is a string that is given after succesful login
    const [loading, setLoading] = useState(true);

    //Checks whether someone is already logged in
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);


    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");

    };

    const register = async (email, password) => {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error (errorData.message);
        }
        return await response.json();
    };


    // NOT TESTED because other parts are not ready yet. Test at the end of the week
    const login = async (email, password) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        //Saves the person logged in to local storage, so it won't reset when reloading the page
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
    };

    // NOT TESTED because other parts are not ready yet. Test at the end of the week
    const deleteAccount = async () => {
        const response = await fetch("/api/users/me", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Account deletion failed");
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");

    };

    const value = { user, token, logout, login, register, deleteAccount, loading };

    return (
        <LoginContext.Provider value={value}>
            {children}
        </LoginContext.Provider>
    );
}

// One function for easier calling and prevents use outside wanted areas
export function useLogin() {
    const context = useContext(LoginContext);
    if (context === null) {
        throw new Error("useLogin requires LoginProvider");
    }
    return context;
}