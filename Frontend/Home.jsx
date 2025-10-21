import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, TrendingUp, Zap, Shield, Truck, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [currentBannerImage, setCurrentBannerImage] = useState(0);

  // Hero banner background images
  const bannerImages = [
    'https://images.unsplash.com/photo-1592286927505-4d46b4fda4e4?w=1920&q=80', // iPhone
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=1920&q=80', // Treadmill
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1920&q=80', // TV
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80', // Gym dumbbells
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80', // Headphones
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1920&q=80', // Fashion
    'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1920&q=80', // Gaming Chair
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1920&q=80', // Smart Watch
  ];

  useEffect(() => {
    loadData();
    
    // Auto-rotate banner images every 4 seconds
    const interval = setInterval(() => {
      setCurrentBannerImage((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const products = await base44.entities.Product.filter({ featured: true }, '-created_date', 8);
    setFeaturedProducts(products);

    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      await base44.auth.redirectToLogin();
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    const existingItems = await base44.entities.CartItem.filter({ 
      user_email: user.email, 
      product_id: product.id 
    });

    if (existingItems.length > 0) {
      await base44.entities.CartItem.update(existingItems[0].id, {
        quantity: existingItems[0].quantity + 1
      });
    } else {
      await base44.entities.CartItem.create({
        user_email: user.email,
        product_id: product.id,
        product_title: product.title,
        product_image: product.image_url,
        price: product.final_price || product.price,
        quantity: 1
      });
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    window.location.reload();
  };

  const categories = [
    { name: 'Smartphones', icon: '📱', color: 'from-blue-500 to-blue-600' },
    { name: 'Smartwatches', icon: '⌚', color: 'from-purple-500 to-purple-600' },
    { name: 'TVs', icon: '📺', color: 'from-red-500 to-red-600' },
    { name: 'Tablets', icon: '💻', color: 'from-gray-500 to-gray-600' },
    { name: 'Refrigerators', icon: '❄️', color: 'from-cyan-500 to-cyan-600' },
    { name: 'Tables', icon: '🪑', color: 'from-amber-500 to-amber-600' },
    { name: 'Beds', icon: '🛏️', color: 'from-indigo-500 to-indigo-600' },
    { name: 'Chairs', icon: '🪑', color: 'from-orange-500 to-orange-600' },
    { name: 'Bags', icon: '🎒', color: 'from-pink-500 to-pink-600' },
    { name: 'Clothes - Boys', icon: '👕', color: 'from-teal-500 to-teal-600' },
    { name: 'Clothes - Girls', icon: '👗', color: 'from-rose-500 to-rose-600' },
    { name: 'Sports', icon: '⚽', color: 'from-green-500 to-green-600' },
    { name: 'Kids', icon: '🧸', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Gym Products', icon: '💪', color: 'from-red-600 to-red-700' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Dynamic Background */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Background Image Slideshow */}
        <div className="absolute inset-0">
          {bannerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBannerImage ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>
            </div>
          ))}
        </div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-800/30"></div>
        
        {/* Decorative animated blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center text-white">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 mr-3 animate-pulse" />
                <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-1 backdrop-blur-sm">
                  New Arrivals Every Day!
                </Badge>
                <Sparkles className="w-8 h-8 ml-3 animate-pulse" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in drop-shadow-2xl">
                Welcome to <span className="text-yellow-300">AiryShop</span>
              </h1>
              <p className="text-xl md:text-3xl mb-4 font-light drop-shadow-lg">
                Your One-Stop Shop for Everything!
              </p>
              <p className="text-lg md:text-xl mb-10 text-blue-100 drop-shadow-lg">
                Electronics • Fashion • Furniture • Sports • Kids • Gym & More
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl('Shop')}>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-yellow-300 hover:text-blue-800 text-lg px-8 py-6 shadow-2xl transform hover:scale-105 transition-all">
                    🛍️ Start Shopping
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
                <Link to={createPageUrl('Shop') + '?offers=true'}>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 shadow-2xl transform hover:scale-105 transition-all backdrop-blur-sm">
                    🔥 View Hot Deals
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerImage(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBannerImage 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-blue-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Free Shipping</h3>
                <p className="text-gray-600 text-sm">On orders above ₹500</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">100% Secure</h3>
                <p className="text-gray-600 text-sm">Safe payments guaranteed</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Quick Delivery</h3>
                <p className="text-gray-600 text-sm">Fast shipping to your door</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-amber-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Premium Quality</h3>
                <p className="text-gray-600 text-sm">Authentic products only</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Explore our wide range of products</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category, idx) => (
              <Link 
                key={idx}
                to={createPageUrl('Shop') + '?category=' + encodeURIComponent(category.name)}
                className="group"
              >
                <Card className="border-2 hover:border-blue-400 transition-all transform hover:-translate-y-2 hover:shadow-2xl">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    <h3 className="font-semibold text-sm group-hover:text-blue-600 transition">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-10 h-10 mr-3 text-blue-600" />
                Featured Products
              </h2>
              <p className="text-gray-600 mt-2 text-lg">Handpicked deals just for you</p>
            </div>
            <Link to={createPageUrl('Shop')}>
              <Button size="lg" variant="outline" className="hidden md:flex">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-xl text-gray-600 mb-6">No featured products yet</p>
              <Link to={createPageUrl('Shop')}>
                <Button size="lg">Browse All Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-blue-400 transform hover:-translate-y-2">
                  <Link to={createPageUrl('ProductDetail') + '?id=' + product.id}>
                    <div className="relative overflow-hidden bg-gray-100">
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.discount_percentage > 0 && (
                        <Badge className="absolute top-4 right-4 bg-red-500 text-white text-lg px-3 py-1 shadow-lg">
                          {product.discount_percentage}% OFF
                        </Badge>
                      )}
                      {product.featured && (
                        <Badge className="absolute top-4 left-4 bg-yellow-500 text-black text-sm px-3 py-1 shadow-lg">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <CardContent className="p-5">
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>

                    <Link to={createPageUrl('ProductDetail') + '?id=' + product.id}>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition line-clamp-2 min-h-[3.5rem]">
                        {product.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>

                    {product.offer_text && (
                      <p className="text-green-600 text-sm font-medium mb-3 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        {product.offer_text}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {product.discount_percentage > 0 ? (
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              ₹{product.final_price.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.price.toLocaleString()}
                              </span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Save ₹{(product.price - product.final_price).toLocaleString()}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-gray-900">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <Button 
                        size="icon"
                        onClick={() => addToCart(product)}
                        disabled={addingToCart[product.id]}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
                      >
                        {addingToCart[product.id] ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <ShoppingCart className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link to={createPageUrl('Shop')}>
              <Button size="lg">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Special Offers Banner */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-6">
            <Badge className="bg-yellow-400 text-black text-xl px-6 py-2 animate-bounce">
              🔥 HOT DEALS 🔥
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Mega Sale - Up to 50% OFF!
          </h2>
          <p className="text-xl md:text-2xl mb-8">
            Limited time offer on selected products
          </p>
          <Link to={createPageUrl('Shop') + '?offers=true'}>
            <Button size="lg" className="bg-white text-red-600 hover:bg-yellow-300 hover:text-red-700 text-xl px-10 py-7 shadow-2xl transform hover:scale-110 transition-all">
              Shop Sale Now
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Discover amazing deals on electronics, fashion, furniture, sports, and more!
          </p>
          <Link to={createPageUrl('Shop')}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-yellow-300 hover:text-blue-800 text-xl px-10 py-7 shadow-2xl transform hover:scale-110 transition-all">
              Browse All Products
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}