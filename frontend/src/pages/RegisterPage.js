import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { getAvatarUrl } from "../utils/avatar";
import { useEffect } from "react";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    college: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [colleges, setColleges] = useState([])

  useEffect(()=>{
    async function load(){
      try{ const res = await client.get('/users/colleges'); setColleges(res.data || []) }catch(e){}
    }
    load()
  },[])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const avatar = getAvatarUrl(form.username || form.email || form.full_name)

      await client.post("/auth/register", {
        username: form.username,
        full_name: form.full_name,
        college: form.college,
        email: form.email,
        password: form.password,
        profile_picture: avatar,
      });

      setSuccess("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.log("Register Error:", err.response?.data);

      if (typeof err.response?.data?.detail === "string") {
        setError(err.response.data.detail);
      } else if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail[0].msg);
      } else {
        setError("Registration failed.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center text-gray-900">
          Join DSA League
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Create your member account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder-gray-500"
            required
          />

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder-gray-500"
            required
          />

          <input
            type="text"
            name="college"
            placeholder="College Name (e.g. Aditya College of Engineering and Technology)"
            value={form.college}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder-gray-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder-gray-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder-gray-500"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder-gray-500"
            required
          />

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-100 p-3 text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700"
          >
            Register
          </button>

        </form>

        <div className="mt-6 text-center text-gray-700">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}