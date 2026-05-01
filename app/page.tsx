'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">
                  Nutri<span className="text-primary-600">Fit</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Features
              </a>
              <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                About
              </a>
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary-600 text-white px-6 py-2.5 rounded-full hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-primary-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-3">
                <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Features
                </a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  About
                </a>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-full hover:bg-primary-700 transition-all text-center font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Personal
              <br />
              <span className="text-primary-600">Nutrition & Fitness</span>
              <br />
              Companion
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Track your meals, manage your health profile, and achieve your fitness goals with personalized diet and workout plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                Start Your Journey
              </Link>
              <Link
                href="/login"
                className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg border-2 border-primary-600"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Hero Image/Stats - 3 Simple Steps */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-white border-4 border-primary-600 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">Create Profile</div>
              <div className="text-gray-600">Enter your health info, allergies, and fitness goals</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-white border-4 border-primary-600 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">Get Your Plan</div>
              <div className="text-gray-600">Receive personalized diet and workout recommendations</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-white border-4 border-primary-600 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">Track Progress</div>
              <div className="text-gray-600">Log meals, exercises, and monitor your health journey</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools to help you achieve your health goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Health Profile</h3>
              <p className="text-gray-600 leading-relaxed">
                Create and manage your personalized health profile with age, weight, allergies, and medical conditions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Diet Plans</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized meal plans tailored to your health needs, allergies, and dietary preferences.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Workout Plans</h3>
              <p className="text-gray-600 leading-relaxed">
                Access customized workout routines and track your exercise progress over time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Meal Logging</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your daily meals and monitor your calorie intake with our easy-to-use meal logger.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">
                Get AI-powered meal and exercise recommendations based on your health profile and goals.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Allergen Safety</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically filter out foods and exercises based on your allergies and health conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About NutriFit
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            NutriFit is your comprehensive health and fitness companion designed to help you achieve your wellness goals. 
            Whether you're managing dietary restrictions, tracking your nutrition, or following a workout plan, 
            NutriFit provides personalized recommendations and tools to support your journey to a healthier lifestyle.
          </p>
          <Link
            href="/register"
            className="inline-block bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-700 transition-all shadow-xl hover:shadow-2xl"
          >
            Join NutriFit Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <span className="ml-3 text-3xl font-bold">
              Nutri<span className="text-primary-400">Fit</span>
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            Your Personal Nutrition & Fitness Companion
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 NutriFit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}


