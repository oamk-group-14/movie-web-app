import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../context/LoginContext'

function Login() {
    const { login } = useLogin()
    const navigate = useNavigate()

    // Form values and error message
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Handle the login request
    const handleSubmit = async (event) => {
        event.preventDefault()

        setError('')
        setLoading(true)

        try {
            await login(email, password)
            // When login successful go to home page
            navigate('/')
        // When login failed show an error message
        } catch (error) {
            console.error(error)
            setError('Login failed. Please check your email and password.')
        // Stop the loading state whether login succeeded or failed
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-box">

                <h1>Login</h1>

                {/* Login form */}
                <form className="auth-form" onSubmit={handleSubmit}>

                    <label htmlFor="email">Email</label>

                    <input 
                        id="email" 
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label htmlFor="password">Password</label>

                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

            </div>
        </div>
    )
}

export default Login