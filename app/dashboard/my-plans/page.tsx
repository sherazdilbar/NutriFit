'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DietPlan {
  id: number;
  createdAt: string;
  calories: number;
  plan: any[];
  metadata: any;
  goal: string;
}

interface WorkoutPlan {
  id: number;
  createdAt: string;
  intensity: string;
  plan: any[];
  metadata: any;
  focusArea: string;
}

export default function MyPlans() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'diet' | 'workout'>('diet');
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPlans();
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch diet plans
      const dietResponse = await fetch('/api/diet-plan/history', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const dietData = await dietResponse.json();
      if (dietData.success) {
        setDietPlans(dietData.plans);
      }

      // Fetch workout plans
      const workoutResponse = await fetch('/api/workout-plan/history', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const workoutData = await workoutResponse.json();
      if (workoutData.success) {
        setWorkoutPlans(workoutData.plans);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteDietPlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/diet-plan/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setDietPlans(dietPlans.filter(p => p.id !== planId));
      } else {
        alert('Failed to delete plan');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete plan');
    }
  };

  const handleDeleteWorkoutPlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this workout plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workout-plan/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setWorkoutPlans(workoutPlans.filter(p => p.id !== planId));
      } else {
        alert('Failed to delete plan');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete plan');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                Nutri<span className="text-primary-600">Fit</span>
              </span>
            </Link>

            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                      <span className="inline-block mt-2 bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                        {user.role}
                      </span>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Plans</h1>
          <p className="text-gray-600">View and manage all your generated plans</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-3 mb-8">
          <button
            onClick={() => setActiveTab('diet')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'diet'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Diet Plans ({dietPlans.length})
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'workout'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Workout Plans ({workoutPlans.length})
          </button>
        </div>

        {/* Diet Plans */}
        {activeTab === 'diet' && (
          <>
            {dietPlans.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Diet Plans Yet</h3>
                <p className="text-gray-600 mb-6 text-sm">Generate your first personalized meal plan to get started</p>
                <Link
                  href="/dashboard/diet-plan"
                  className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Generate Diet Plan
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {dietPlans.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {plan.metadata?.days || 7}-Day Plan
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatDate(plan.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteDietPlan(plan.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Calorie Badge */}
                    <div className="bg-primary-50 px-3 py-2 rounded-lg border border-primary-100 mb-3">
                      <p className="text-sm font-semibold text-primary-700 text-center">
                        {plan.calories} cal/day
                      </p>
                      <p className="text-xs text-primary-600 text-center capitalize">
                        {plan.goal || 'Maintain'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                        <p className="text-lg font-bold text-gray-900">{plan.plan?.length || 0}</p>
                        <p className="text-xs text-gray-600">Meals</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                        <p className="text-lg font-bold text-gray-900">{plan.metadata?.accuracy || 0}%</p>
                        <p className="text-xs text-gray-600">Match</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                        <p className="text-lg font-bold text-gray-900">{plan.metadata?.safeFoodsCount || 0}</p>
                        <p className="text-xs text-gray-600">Foods</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => handleDeleteDietPlan(plan.id)}
                        className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Workout Plans */}
        {activeTab === 'workout' && (
          <>
            {workoutPlans.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Workout Plans Yet</h3>
                <p className="text-gray-600 mb-6 text-sm">Generate your first personalized workout routine</p>
                <Link
                  href="/dashboard/workout-plan"
                  className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Generate Workout Plan
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {workoutPlans.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {plan.metadata?.days || 7}-Day Plan
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatDate(plan.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteWorkoutPlan(plan.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Focus Badge */}
                    <div className="bg-primary-50 px-3 py-2 rounded-lg border border-primary-100 mb-3">
                      <p className="text-sm font-semibold text-primary-700 text-center capitalize">
                        {plan.focusArea || plan.intensity}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                        <p className="text-lg font-bold text-gray-900">{plan.metadata?.totalWorkouts || 0}</p>
                        <p className="text-xs text-gray-600">Workouts</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                        <p className="text-lg font-bold text-gray-900">{plan.metadata?.days || 0}</p>
                        <p className="text-xs text-gray-600">Days</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                        <p className="text-lg font-bold text-gray-900">{plan.metadata?.safeExercisesCount || 0}</p>
                        <p className="text-xs text-gray-600">Exercises</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => handleDeleteWorkoutPlan(plan.id)}
                        className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Spacer before footer */}
      <div className="pb-8"></div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">N</span>
                </div>
                <span className="ml-3 text-2xl font-bold">
                  Nutri<span className="text-primary-400">Fit</span>
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Your comprehensive health and fitness companion. Track nutrition, manage health profiles, and achieve your wellness goals.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/health-profile" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Health Profile
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/my-plans" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    My Plans
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/my-logs" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    My Logs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/diet-plan" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Diet Plans
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/workout-plan" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Workout Plans
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/goals" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Goals
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/progress" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                    Progress
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8">
          </div>
        </div>
      </footer>
    </div>
  );
}

