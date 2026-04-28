'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [planCounts, setPlanCounts] = useState({ diet: 0, workout: 0 });
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [streaks, setStreaks] = useState({ meal: 0, exercise: 0 });
  const [waterIntake, setWaterIntake] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<string>('auto');
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const remindersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    
    // Load data in parallel for faster initial load
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchHealthProfile(token),
          fetchGoals(token),
          fetchPlanCounts(token),
          fetchWeeklySummary(token),
          fetchStreaks(token),
          fetchWaterIntake(token),
          fetchReminders(token),
          fetchRecipes(token),
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const fetchHealthProfile = async (token: string) => {
    try {
      const response = await fetch('/api/health-profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.exists && data.profile) {
        setHasProfile(true);
        setProfileData(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch health profile:', error);
    }
  };

  const fetchGoals = async (token: string) => {
    try {
      const response = await fetch('/api/goals/progress', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setActiveGoals(data.goals);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const fetchPlanCounts = async (token: string) => {
    try {
      const [dietRes, workoutRes] = await Promise.all([
        fetch('/api/diet-plan/history', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/workout-plan/history', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const dietData = await dietRes.json();
      const workoutData = await workoutRes.json();
      setPlanCounts({
        diet: dietData.success ? dietData.plans.length : 0,
        workout: workoutData.success ? workoutData.plans.length : 0,
      });
    } catch (error) {
      console.error('Failed to fetch plan counts:', error);
    }
  };

  const fetchWeeklySummary = async (token: string) => {
    try {
      const response = await fetch('/api/progress/weekly-summary', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setWeeklySummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch weekly summary:', error);
    }
  };

  const fetchStreaks = async (token: string) => {
    try {
      const response = await fetch('/api/progress/streaks', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStreaks(data.streaks);
      }
    } catch (error) {
      console.error('Failed to fetch streaks:', error);
    }
  };

  const fetchWaterIntake = async (token: string) => {
    try {
      const response = await fetch('/api/water-intake', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setWaterIntake(data.intake);
      }
    } catch (error) {
      console.error('Failed to fetch water intake:', error);
    }
  };

  const updateWaterIntake = async (action: 'add' | 'subtract') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/water-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (data.success) {
        setWaterIntake(data.intake);
        // Refresh reminders after water intake update
        fetchReminders(token);
      }
    } catch (error) {
      console.error('Failed to update water intake:', error);
    }
  };

  const fetchReminders = async (token: string) => {
    try {
      const response = await fetch('/api/reminders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    }
  };

  const fetchRecipes = async (token: string) => {
    try {
      const response = await fetch('/api/recipes/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAllRecipes(data.recipes);
        // Set initial recipes based on auto mode
        filterRecipesByMealType('auto', data.recipes);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    }
  };

  const filterRecipesByMealType = (mealType: string, recipesToFilter = allRecipes) => {
    setSelectedMealType(mealType);
    
    if (mealType === 'auto') {
      // Auto mode: Filter based on current time
      const currentHour = new Date().getHours();
      let filtered = recipesToFilter;

      if (currentHour >= 6 && currentHour < 11) {
        filtered = recipesToFilter.filter((r: any) => r.mealType === 'breakfast');
      } else if (currentHour >= 11 && currentHour < 16) {
        filtered = recipesToFilter.filter((r: any) => r.mealType === 'lunch');
      } else if (currentHour >= 16 && currentHour < 21) {
        filtered = recipesToFilter.filter((r: any) => r.mealType === 'dinner');
      } else {
        filtered = recipesToFilter.filter((r: any) => r.mealType === 'snack');
      }
      setRecipes(filtered);
    } else if (mealType === 'all') {
      // Show all recipes
      setRecipes(recipesToFilter);
    } else {
      // Filter by specific meal type
      const filtered = recipesToFilter.filter((r: any) => r.mealType === mealType);
      setRecipes(filtered);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (remindersRef.current && !remindersRef.current.contains(event.target as Node)) {
        setIsRemindersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show skeleton while loading data
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="ml-3 text-xl font-semibold text-gray-900">
                  Nutri<span className="text-primary-600">Fit</span>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </nav>

        {/* Loading Skeleton */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 animate-pulse"></div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-48 animate-pulse"></div>
            ))}
          </div>
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

            <div className="flex items-center space-x-4">
              {/* Reminders Bell Icon */}
              <div className="relative" ref={remindersRef}>
                <button
                  onClick={() => setIsRemindersOpen(!isRemindersOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {reminders.length > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {reminders.length}
                    </span>
                  )}
                </button>

                {isRemindersOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-900">Reminders</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {reminders.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {reminders.map((reminder, index) => (
                            <div 
                              key={index}
                              className={`p-4 hover:bg-gray-50 transition-colors ${
                                reminder.priority === 'high' 
                                  ? 'border-l-4 border-red-500' 
                                  : reminder.priority === 'medium'
                                  ? 'border-l-4 border-yellow-500'
                                  : 'border-l-4 border-blue-500'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <svg 
                                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                    reminder.priority === 'high' 
                                      ? 'text-red-600' 
                                      : reminder.priority === 'medium'
                                      ? 'text-yellow-600'
                                      : 'text-blue-600'
                                  }`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{reminder.message}</p>
                                  {reminder.type === 'meal' && (
                                    <Link 
                                      href="/dashboard/log-meal" 
                                      className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block"
                                      onClick={() => setIsRemindersOpen(false)}
                                    >
                                      Log a meal now →
                                    </Link>
                                  )}
                                  {reminder.type === 'exercise' && (
                                    <Link 
                                      href="/dashboard/log-exercise" 
                                      className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block"
                                      onClick={() => setIsRemindersOpen(false)}
                                    >
                                      Log a workout now →
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-gray-500">No reminders</p>
                          <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
                      <Link
                        href="/dashboard/settings"
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </Link>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-600">
            Here's your health and fitness overview
          </p>
        </div>

        {/* Weekly Summary & Streaks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Summary Card */}
          <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-lg border border-primary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">This Week's Summary</h2>
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            {weeklySummary ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Meals Logged</span>
                  <span className="text-xl font-bold text-gray-900">{weeklySummary.totalMeals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Workouts Completed</span>
                  <span className="text-xl font-bold text-gray-900">{weeklySummary.totalWorkouts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Daily Calories</span>
                  <span className="text-xl font-bold text-gray-900">{weeklySummary.avgCalories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Days</span>
                  <span className="text-xl font-bold text-gray-900">{weeklySummary.activeDays}/7</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Start logging to see your weekly summary</p>
            )}
          </div>

          {/* Streaks Card */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Streaks</h2>
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Meal Logging Streak</span>
                  <span className="text-2xl font-bold text-orange-600">{streaks.meal} days</span>
                </div>
                {streaks.meal >= 7 && (
                  <div className="bg-white rounded-lg px-3 py-2 text-xs font-medium text-orange-700 border border-orange-200">
                    {streaks.meal >= 30 ? '🏆 30-Day Champion!' : '🔥 7-Day Streak!'}
                  </div>
                )}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Exercise Streak</span>
                  <span className="text-2xl font-bold text-orange-600">{streaks.exercise} days</span>
                </div>
                {streaks.exercise >= 7 && (
                  <div className="bg-white rounded-lg px-3 py-2 text-xs font-medium text-orange-700 border border-orange-200">
                    {streaks.exercise >= 30 ? '🏆 30-Day Champion!' : '🔥 7-Day Streak!'}
                  </div>
                )}
              </div>
              {(streaks.meal === 0 && streaks.exercise === 0) && (
                <p className="text-sm text-gray-600">Start logging daily to build your streak!</p>
              )}
            </div>
          </div>
        </div>

        {/* Recipe Suggestions */}
        {allRecipes.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recipe Suggestions</h2>
                {selectedMealType === 'auto' && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date().getHours() >= 6 && new Date().getHours() < 11 
                      ? 'Showing breakfast recipes for this morning' 
                      : new Date().getHours() >= 11 && new Date().getHours() < 16
                      ? 'Showing lunch recipes for this afternoon'
                      : new Date().getHours() >= 16 && new Date().getHours() < 21
                      ? 'Showing dinner recipes for this evening'
                      : 'Showing snack recipes for tonight'}
                  </p>
                )}
              </div>
              
              {/* Meal Type Selector - Scrollable on mobile, right-aligned on desktop */}
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1 shadow-sm">
                  <button
                    onClick={() => filterRecipesByMealType('auto')}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedMealType === 'auto'
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Auto</span>
                  </button>
                  <button
                    onClick={() => filterRecipesByMealType('breakfast')}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedMealType === 'breakfast'
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Breakfast</span>
                  </button>
                  <button
                    onClick={() => filterRecipesByMealType('lunch')}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedMealType === 'lunch'
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Lunch</span>
                  </button>
                  <button
                    onClick={() => filterRecipesByMealType('dinner')}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedMealType === 'dinner'
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Dinner</span>
                  </button>
                  <button
                    onClick={() => filterRecipesByMealType('snack')}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedMealType === 'snack'
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Snacks</span>
                  </button>
                  <button
                    onClick={() => filterRecipesByMealType('all')}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedMealType === 'all'
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>All</span>
                  </button>
                </div>
              </div>
            </div>

            {recipes.length > 0 ? (
              <>
                {selectedMealType === 'all' ? (
                  // Grouped view for "All" tab
                  <div className="space-y-8">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                      const mealRecipes = allRecipes.filter((r: any) => r.mealType === mealType);
                      if (mealRecipes.length === 0) return null;
                      
                      return (
                        <div key={mealType}>
                          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              mealType === 'breakfast' ? 'bg-yellow-500' :
                              mealType === 'lunch' ? 'bg-blue-500' :
                              mealType === 'dinner' ? 'bg-purple-500' :
                              'bg-green-500'
                            }`}></span>
                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipes
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mealRecipes.map((recipe: any) => (
                              <div key={recipe.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                  <h3 className="font-semibold text-gray-900 text-sm flex-1">{recipe.name}</h3>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${
                                    recipe.mealType === 'breakfast' ? 'bg-yellow-100 text-yellow-700' :
                                    recipe.mealType === 'lunch' ? 'bg-blue-100 text-blue-700' :
                                    recipe.mealType === 'dinner' ? 'bg-purple-100 text-purple-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {recipe.mealType?.charAt(0).toUpperCase() + recipe.mealType?.slice(1)}
                                  </span>
                                </div>
                                <div className="space-y-2 mb-4">
                                  {recipe.ingredients.map((ing: any) => (
                                    <div key={ing.id} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-700">{ing.name}</span>
                                      <span className="text-gray-500">{ing.calories} cal</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="pt-3 border-t border-gray-100">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-medium text-gray-600">Total</span>
                                      {recipe.calorieStatus && (
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                          recipe.calorieStatus === 'Low Cal' ? 'bg-green-100 text-green-700' :
                                          recipe.calorieStatus === 'Balanced' ? 'bg-blue-100 text-blue-700' :
                                          'bg-orange-100 text-orange-700'
                                        }`}>
                                          {recipe.calorieStatus}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-lg font-bold text-primary-600">{recipe.totalCalories} cal</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Regular grid view for specific meal types
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recipes.map((recipe: any) => (
                      <div key={recipe.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 text-sm flex-1">{recipe.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${
                            recipe.mealType === 'breakfast' ? 'bg-yellow-100 text-yellow-700' :
                            recipe.mealType === 'lunch' ? 'bg-blue-100 text-blue-700' :
                            recipe.mealType === 'dinner' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {recipe.mealType?.charAt(0).toUpperCase() + recipe.mealType?.slice(1)}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          {recipe.ingredients.map((ing: any) => (
                            <div key={ing.id} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700">{ing.name}</span>
                              <span className="text-gray-500">{ing.calories} cal</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-600">Total</span>
                              {recipe.calorieStatus && (
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  recipe.calorieStatus === 'Low Cal' ? 'bg-green-100 text-green-700' :
                                  recipe.calorieStatus === 'Balanced' ? 'bg-blue-100 text-blue-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {recipe.calorieStatus}
                                </span>
                              )}
                            </div>
                            <span className="text-lg font-bold text-primary-600">{recipe.totalCalories} cal</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 text-sm">No recipes available for this meal type</p>
                <p className="text-gray-500 text-xs mt-1">Try selecting a different meal type</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href={hasProfile ? "/dashboard/health-profile/view" : "/dashboard/health-profile"}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer h-full min-h-[180px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {hasProfile && (
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">Active</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Health Profile</h3>
                {hasProfile ? (
                  <p className="text-2xl font-semibold text-gray-900">Complete</p>
                ) : (
                  <p className="text-2xl font-semibold text-gray-400">Not Set</p>
                )}
                {hasProfile && profileData && (
                  <p className="text-xs text-gray-500 mt-2">
                    {profileData.age} years • {profileData.weight}kg
                  </p>
                )}
              </div>
            </div>
          </Link>

          <Link href="/dashboard/goals">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer h-full min-h-[180px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Active Goals</h3>
                <p className="text-2xl font-semibold text-gray-900">{activeGoals.length}</p>
                {activeGoals.length > 0 && (
                  <div className="mt-3">
                    <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary-600 h-full"
                        style={{ width: `${Math.min(((activeGoals[0].currentValue || activeGoals[0].startValue || 0) / activeGoals[0].targetValue) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      {activeGoals[0].goalType.charAt(0).toUpperCase() + activeGoals[0].goalType.slice(1)} goal in progress
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Link>

          <Link href="/dashboard/my-plans">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer h-full min-h-[180px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Generated Plans</h3>
                <p className="text-2xl font-semibold text-gray-900">{planCounts.diet + planCounts.workout}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {planCounts.diet} diet • {planCounts.workout} workout
                </p>
              </div>
            </div>
          </Link>

          {/* Water Intake Widget */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-6 h-full min-h-[180px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-700">Today</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Water Intake</h3>
              {waterIntake ? (
                <>
                  <div className="flex items-baseline space-x-1 mb-3">
                    <span className="text-2xl font-semibold text-blue-600">{waterIntake.glasses}</span>
                    <span className="text-sm text-gray-600">/ {waterIntake.goal} glasses</span>
                  </div>
                  <div className="bg-white rounded-full h-2 overflow-hidden mb-3">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min((waterIntake.glasses / waterIntake.goal) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateWaterIntake('add')}
                      className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      + Add
                    </button>
                    {waterIntake.glasses > 0 && (
                      <button
                        onClick={() => updateWaterIntake('subtract')}
                        className="bg-white border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors"
                      >
                        - Remove
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">Loading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          <Link href={hasProfile ? "/dashboard/health-profile/view" : "/dashboard/health-profile"}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Health Profile</h3>
                  <p className="text-sm text-gray-600">Manage your health information</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/diet-plan">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Diet Plan Generator</h3>
                  <p className="text-sm text-gray-600">Create personalized meal plans</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/workout-plan">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Workout Plan Generator</h3>
                  <p className="text-sm text-gray-600">Generate fitness routines</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/food-catalog">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Food Catalog</h3>
                  <p className="text-sm text-gray-600">Browse foods with allergen info</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/exercise-catalog">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Exercise Catalog</h3>
                  <p className="text-sm text-gray-600">Explore exercises with safety checks</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/log-meal">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Log Meal</h3>
                  <p className="text-sm text-gray-600">Track your daily food intake</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/log-exercise">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Log Exercise</h3>
                  <p className="text-sm text-gray-600">Record your workout sessions</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/my-logs">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">My Logs</h3>
                  <p className="text-sm text-gray-600">View your meal and exercise history</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/progress">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Progress & Charts</h3>
                  <p className="text-sm text-gray-600">Visualize your health data</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

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
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
