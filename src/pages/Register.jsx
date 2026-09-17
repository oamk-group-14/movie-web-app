import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../context/LoginContext'

function Register() {
    const { register } = useLogin()
    const navigate = useNavigate()

    // Form values and error message
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Handle the registration request
    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            await register(email, password)
            // Go to login after successful registration
            navigate('/login')
        // When register failed show an error message
        } catch (error) {
            console.error(error)
            setError('Registration failed. Please try again.')
        // Stop the loading state whether register succeeded or failed
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-box">

                <h1>Sign in</h1>

                {/* Registration form */}
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

                    {/* Error message */}
                    {error && (
                        <p className="auth-error">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign in'}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default Register