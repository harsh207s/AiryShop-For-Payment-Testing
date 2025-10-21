
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ShoppingCart, User as UserIcon, Menu, X, Home, Store, LayoutDashboard, LogOut, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    loadCartCount();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Log user activity on first load
      const activities = await base44.entities.UserActivity.filter({ user_email: currentUser.email }, '-created_date', 1);
      if (activities.length === 0) {
        await base44.entities.UserActivity.create({
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          activity_type: 'signup',
          signup_method: 'Google OAuth',
          metadata: { timestamp: new Date().toISOString() }
        });
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const currentUser = await base44.auth.me();
      const items = await base44.entities.CartItem.filter({ user_email: currentUser.email });
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      setCartCount(0);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = createPageUrl('Home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        :root {
          --primary: #1e40af;
          --primary-dark: #1e3a8a;
          --accent: #f59e0b;
          --text: #1e293b;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AiryShop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to={createPageUrl('Home')} 
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                  currentPageName === 'Home' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link 
                to={createPageUrl('Shop')} 
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                  currentPageName === 'Shop' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Shop</span>
              </Link>
              
              {user && user.role === 'admin' && (
                <Link 
                  to={createPageUrl('AdminDashboard')} 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                    currentPageName === 'AdminDashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to={createPageUrl('Cart')} className="relative">
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  
                  <Link to={createPageUrl('Profile')}>
                    <Button variant="ghost" size="icon">
                      <UserIcon className="w-5 h-5" />
                    </Button>
                  </Link>

                  <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <Button onClick={() => base44.auth.redirectToLogin()} className="bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t">
              <Link 
                to={createPageUrl('Home')} 
                className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to={createPageUrl('Shop')} 
                className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              {user && user.role === 'admin' && (
                <Link 
                  to={createPageUrl('AdminDashboard')} 
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              {user && (
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">AiryShop</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted destination for electronics, fashion, and lifestyle products.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to={createPageUrl('Home')} className="hover:text-white transition">Home</Link></li>
                <li><Link to={createPageUrl('Shop')} className="hover:text-white transition">Shop</Link></li>
                <li><Link to={createPageUrl('Cart')} className="hover:text-white transition">Cart</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Smartphones</li>
                <li>Smartwatches</li>
                <li>Electronics</li>
                <li>Fashion</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href="mailto:harshaer35@gmail.com" className="hover:text-white transition break-all">
                    harshaer35@gmail.com
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href="tel:+918941835114" className="hover:text-white transition">
                    +91 8941835114
                  </a>
                </li>
                <li>Hours: 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 AiryShop. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              Developed by Harsh Vardhan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
