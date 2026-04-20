'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkFoodSafety } from '@/lib/safetyCheck';

interface Food {
  id: number;
  name: string;
  calories: number;
  allergens: string[];
}

interface HealthProfile {
  allergens: string[];
}

export default function FoodCatalog() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState<{ [key: string]: Food[] }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [userProfile, setUserProfile] = useState<HealthProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [nutritionFilter, setNutritionFilter] = useState<'all' | 'low-cal'>('all');
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    fetchUserProfile();
    fetchFoods();
    fetchFavorites();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/health-profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.exists && data.profile) {
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await fetch('/api/foods');
      const data = await response.json();

      if (data.success) {
        setFoods(data.grouped || {});
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/favorites?type=food', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const toggleFavorite = async (food: Food) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const existingFavorite = favorites.find(f => f.itemId === food.id);

      if (existingFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?id=${existingFavorite.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setFavorites(favorites.filter(f => f.id !== existingFavorite.id));
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemType: 'food',
            itemId: food.id,
            itemName: food.name,
            itemData: food,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setFavorites([...favorites, data.favorite]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Case-insensitive search on client side since SQLite doesn't support it
      const response = await fetch(`/api/foods`);
      const data = await response.json();
      
      if (data.success && data.grouped) {
        const allFoods: Food[] = [];
        Object.values(data.grouped).forEach((categoryFoods: any) => {
          allFoods.push(...categoryFoods);
        });
        
        const filtered = allFoods.filter(food => 
          food.name.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const getSafetyInfo = (foodAllergens: string[]) => {
    if (!userProfile) {
      return { safe: true, message: '', severity: 'SAFE' };
    }
    return checkFoodSafety(foodAllergens, userProfile.allergens || []);
  };

  const applyNutritionFilter = (foodList: Food[]) => {
    switch (nutritionFilter) {
      case 'low-cal':
        return foodList.filter(f => f.calories <= 100);
      default:
        return foodList;
    }
  };

  const getAllFoods = () => {
    const allFoods: Food[] = [];
    Object.values(foods).forEach((categoryFoods) => {
      allFoods.push(...categoryFoods);
    });
    return allFoods;
  };

  const getStats = () => {
    const allFoods = getAllFoods();
    const safeCount = allFoods.filter(f => getSafetyInfo(f.allergens).safe).length;
    const lowCal = allFoods.filter(f => f.calories <= 100).length;
    const categories = Object.keys(foods).length;
    
    return {
      total: allFoods.length,
      safe: safeCount,
      categories,
      lowCal
    };
  };

  const categories = Object.keys(foods);
  const displayFoods = searchTerm 
    ? { 'Search Results': applyNutritionFilter(searchResults) }
    : selectedCategory === 'all' 
      ? Object.fromEntries(
          Object.entries(foods).map(([cat, items]) => [cat, applyNutritionFilter(items)])
        )
      : { [selectedCategory]: applyNutritionFilter(foods[selectedCategory] || []) };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading food catalog...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Food Catalog</h1>
          <p className="text-gray-600">Browse {stats.total}+ foods with nutrition info and allergen safety checks</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Foods</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.safe}</div>
            <div className="text-sm text-gray-600">Safe for You</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.categories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.lowCal}</div>
            <div className="text-sm text-gray-600">Low Calorie</div>
          </div>
        </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search foods (e.g., 'chicken', 'apple', 'rice')..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Nutrition Filter */}
            <select
              value={nutritionFilter}
              onChange={(e) => setNutritionFilter(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none"
            >
              <option value="all">All Foods</option>
              <option value="low-cal">Low Calorie (≤100 kcal)</option>
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat} ({foods[cat]?.length || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Help Banner */}
        {!userProfile && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  💡 <strong>Tip:</strong> Create your{' '}
                  <Link href="/dashboard/health-profile" className="underline font-semibold">
                    Health Profile
                  </Link>{' '}
                  to get personalized allergen warnings and safety checks!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Food Grid */}
        {Object.entries(displayFoods).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {category}
              <span className="ml-2 text-sm font-normal text-gray-500">({items.length} items)</span>
            </h2>
            
            {items.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No foods match your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((food) => {
                  const safety = getSafetyInfo(food.allergens);
                  
                  return (
                    <div
                      key={food.id}
                      className={`bg-white rounded-lg border-2 p-5 hover:shadow-sm transition-all ${
                        safety.severity === 'DANGER'
                          ? 'border-red-300'
                          : safety.severity === 'WARNING'
                          ? 'border-yellow-300'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {/* Food Name & Safety Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-base text-gray-900">{food.name}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(food)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title={favorites.some(f => f.itemId === food.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <svg
                              className={`w-5 h-5 ${favorites.some(f => f.itemId === food.id) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                              fill={favorites.some(f => f.itemId === food.id) ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          {!safety.safe && (
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              safety.severity === 'DANGER' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {safety.severity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Calories Display */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-3 text-center">
                        <div className="text-3xl font-bold text-primary-600">{food.calories}</div>
                        <div className="text-sm text-gray-600">Calories</div>
                      </div>

                      {/* Allergens */}
                      {food.allergens && food.allergens.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-700 mb-1">Allergens:</div>
                          <div className="flex flex-wrap gap-1">
                            {food.allergens.map((allergen: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-200"
                              >
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Safety Warning */}
                      {!safety.safe && safety.message && (
                        <div className={`mb-3 p-2.5 rounded-lg text-xs border ${
                          safety.severity === 'DANGER' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {safety.message}
                        </div>
                      )}

                      {/* Action Button */}
                      <Link
                        href={safety.safe ? `/dashboard/log-meal?food=${encodeURIComponent(food.name)}` : '#'}
                        onClick={(e) => !safety.safe && e.preventDefault()}
                      >
                        <button
                          disabled={!safety.safe}
                          className={`w-full py-2.5 rounded-lg font-medium transition-all text-sm ${
                            safety.safe
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {safety.safe ? 'Add to Meal Log' : 'Not Safe'}
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {Object.keys(displayFoods).length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Foods Found</h3>
            <p className="text-gray-600">Try a different search term or filter</p>
          </div>
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
