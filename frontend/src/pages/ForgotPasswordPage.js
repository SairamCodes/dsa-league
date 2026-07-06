import React, {useState} from 'react'
import client from '../api/client'
import { useNavigate } from 'react-router-dom'

export default function ForgotPasswordPage(){
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  async function sendOtp(){
    try{
      await client.post('/auth/forgot-password',{email})
      setStep(1)
      setMessage('OTP sent if that email exists. Check your inbox.')
    }catch(e){
      setMessage('Error sending OTP')
    }
  }

  async function reset(){
    try{
      const verifyRes = await client.post('/auth/verify-otp',{email, code})
      if(!verifyRes.data?.valid){
        const reason = verifyRes.data?.reason === 'expired' ? 'OTP has expired.' : 'Invalid OTP.'
        setMessage(reason)
        return
      }

      const res = await client.post('/auth/reset-password',{email, code, new_password: newPassword})
      if(res.data?.success){
        setMessage('Password reset successful')
        setTimeout(()=>navigate('/login'),1200)
      }else{
        setMessage(res.data?.message || 'Reset failed')
      }
    }catch(e){
      setMessage('Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] bg-surface2 p-8 border border-white/6">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        {step===0 && (
          <>
            <p className="text-sm text-slate-300 mb-4">Enter your registered email to receive a 4-digit OTP.</p>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded-lg bg-white/5 text-white mb-3" />
            <button onClick={sendOtp} className="w-full bg-primary py-2 rounded-lg">Send OTP</button>
          </>
        )}

        {step===1 && (
          <>
            <p className="text-sm text-slate-300 mb-2">Enter the 4-digit OTP sent to your email and set a new password.</p>
            <input value={code} onChange={e=>setCode(e.target.value)} placeholder="OTP" className="w-full p-3 rounded-lg bg-white/5 text-white mb-3" />
            <input value={newPassword} onChange={e=>setNewPassword(e.target.value)} type="password" placeholder="New password" className="w-full p-3 rounded-lg bg-white/5 text-white mb-3" />
            <div className="flex gap-2">
              <button onClick={reset} className="flex-1 bg-primary py-2 rounded-lg">Verify & Reset</button>
              <button onClick={sendOtp} className="flex-1 bg-white/5 py-2 rounded-lg">Resend OTP</button>
            </div>
          </>
        )}

        {message && <div className="mt-4 text-sm text-slate-300">{message}</div>}

      </div>
    </div>
  )
}
