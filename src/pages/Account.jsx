import { useLogin } from "../context/LoginContext.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Account() {
    const { user, deleteAccount } = useLogin();
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    // Deletes account //NOT TESTED as account creation is not ready yet. Test at the end of the week.
    const handleDelete = async () => {
        setError(null);
        try {
            await deleteAccount();
        } catch (err) {
            setError("Account deletion failed. Please try again.");
            setConfirming(false);
        }
    };

    return (
        <div className="account-page">
            <div className="account-card">
                <div className="account-header">
                    <div className="account-page-icon">👤</div>
                    <div>
                        <h1>My Account</h1>
                    </div>
                </div>

                <div className="account-info">
                    <span className="account-label">Logged in as</span>
                    <p className="account-email">{user.email}</p>
                </div>

                <button
                    className="account-button account-favorites-button"
                    onClick={() => navigate('/favorites')}
                >
                    Favorites
                </button>

                {error && (
                    <p className="account-error">{error}</p>
                )}

                <div className="account-danger-section">
                    <h2>Delete account</h2>
                    <p>
                        Deleting your account will permanently remove your account
                        information.
                    </p>

                    {!confirming && (
                        <button
                            className="account-button account-delete-button"
                            onClick={() => setConfirming(true)}
                        >
                            Delete account
                        </button>
                    )}

                    {confirming && (
                        <div className="account-confirm">
                            <p>Are you sure you want to delete your account?</p>

                            <div className="account-confirm-actions">
                                <button
                                    className="account-button account-delete-button"
                                    onClick={handleDelete}
                                >
                                    Yes, delete my account
                                </button>

                                <button
                                    className="account-button account-cancel-button"
                                    onClick={() => setConfirming(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


export default Account;