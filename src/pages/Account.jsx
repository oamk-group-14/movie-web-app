import { useLogin } from "../context/LoginContext.jsx";
import { useState, startTransition } from "react";
import { useNavigate } from "react-router-dom";

function Account() {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate()
    const { user, deleteAccount, logout } = useLogin();

    // Deletes account and shows a confirmation on the home page
    const handleDelete = async () => {
        setError(null);
        try {
            await deleteAccount();

            startTransition(() => {
                navigate('/', {
                    replace: true,
                    state: { message: 'Your account was deleted successfully.' }
                });
                logout();
            });
        } catch (err) {
            setError("Account deletion failed. Please try again.");
            setConfirming(false);
        }
    };

    return (
        <div>
            <h1>Account</h1>
            <p>Logged in as {user.email}</p>

            {/* Navigate to the user's favorite movies and TV shows */}
            <button onClick={() => navigate('/favorites')}>
                Favorites
            </button>

            {error && <p className="error">{error}</p>}

            {!confirming && (
                <button onClick={() => setConfirming(true)}>Delete account</button>
            )}

            {confirming && (
                <div>
                    <p>Are you sure you want to delete your account?</p>
                    <button onClick={handleDelete}>Yes, delete my account</button>
                    <button onClick={() => setConfirming(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
}


export default Account;