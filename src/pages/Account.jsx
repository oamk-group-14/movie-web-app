import { useLogin } from "../context/LoginContext.jsx";
import { useState } from "react";

function Account() {
    const { user, deleteAccount } = useLogin();
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState(null);

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
        <div>
            <h1>Account</h1>
            <p>Logged in as {user.email}</p>

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