import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Senior',
    language: 'en',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const session = await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
        language: form.language,
      });

      navigate(session.isNewUser || !session.user?.is_onboarded ? '/onboarding' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bgLight flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-4">
        <h1 className="text-2xl font-serif text-brand-darkText">Create an account</h1>
        <p className="text-sm text-gray-500">Join the XZ intergenerational community.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="text-xs font-medium text-gray-500">Full name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-xs font-medium text-gray-500">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-medium text-gray-500">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            value={form.password}
            onChange={handleChange}
            required
            className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <div>
          <label htmlFor="role" className="text-xs font-medium text-gray-500">Identity</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          >
            <option value="Senior">Senior</option>
            <option value="Youth">Youth</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-burgundy text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-burgundy font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
