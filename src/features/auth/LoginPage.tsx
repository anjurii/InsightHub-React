import { FormEvent, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email, password)
      setUser(user)
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="login-page"><section className="login-panel"><div className="brand login-brand"><div className="brand-mark"><Sparkles size={18} /></div><span>insight<span>hub</span></span></div><div className="login-copy"><p className="eyebrow">Welcome back</p><h1>Sign in to your workspace</h1><p>See what is happening across your business today.</p></div><form onSubmit={handleSubmit} className="login-form"><label>Email address<div className="input-with-icon"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></label><label>Password<div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{error && <p className="form-error">{error}</p>}<button className="button primary login-button" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button></form><p className="demo-hint">Demo: <strong>alex@insighthub.dev</strong> / <strong>demo123</strong></p></section><aside className="login-art"><div className="login-art-content"><span className="quote-mark">“</span><blockquote>Great decisions start with a clear view of the data.</blockquote><p>InsightHub brings your business intelligence into focus.</p></div></aside></main>
}
