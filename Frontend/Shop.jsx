import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ShoppingCart, Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [showOffers, setShowOffers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Smartphones', 'Smartwatches', 'TVs', 'Refrigerators', 
    'Chairs', 'Tables', 'Beds', 'Bags', 'Clothes - Boys', 'Clothes - Girls', 
    'Tablets', 'Sports', 'Kids', 'Gym Products'
  ];

  useEffect(() => {
    loadData();
    
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const offersParam = urlParams.get('offers');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (offersParam === 'true') {
      setShowOffers(true);
    }
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange, showOffers]);

  const loadData = async () => {
    const allProducts = await base44.entities.Product.list('-created_date', 200);
    setProducts(allProducts);

    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Brand
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    // Price Range
    filtered = filtered.filter(p => {
      const price = p.final_price || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Offers Only
    if (showOffers) {
      filtered = filtered.filter(p => p.discount_percentage > 0);
    }

    setFilteredProducts(filtered);
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

  const brands = [...new Set(products.map(p => p.brand))].sort();

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center">
            🛍️ Shop
          </h1>
          <p className="text-xl text-gray-600 mb-6">Discover amazing products across all categories</p>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-2 focus:border-blue-500 shadow-lg"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <Button 
              variant="outline" 
              className="lg:hidden w-full mb-4 h-12"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <Card className="border-2">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                      📂 Category
                    </h3>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                      🏷️ Brand
                    </h3>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                      💰 Price Range
                    </h3>
                    <Slider
                      min={0}
                      max={200000}
                      step={1000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-3"
                    />
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>₹{priceRange[0].toLocaleString()}</span>
                      <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="offers"
                        checked={showOffers}
                        onChange={(e) => setShowOffers(e.target.checked)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <label htmlFor="offers" className="text-base font-semibold cursor-pointer flex items-center">
                        🔥 Show only offers
                      </label>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-11"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedBrand('all');
                      setPriceRange([0, 200000]);
                      setShowOffers(false);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-700">
                Showing <span className="text-blue-600">{filteredProducts.length}</span> products
              </p>
              {showOffers && (
                <Badge className="bg-red-500 text-white text-sm px-3 py-1">
                  🔥 Hot Deals
                </Badge>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-16 text-center">
                  <div className="text-7xl mb-6">😔</div>
                  <p className="text-2xl font-semibold text-gray-800 mb-4">No products found</p>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search</p>
                  <Button 
                    size="lg"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedBrand('all');
                      setPriceRange([0, 200000]);
                      setShowOffers(false);
                    }}
                  >
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-blue-400 transform hover:-translate-y-2">
                    <Link to={createPageUrl('ProductDetail') + '?id=' + product.id}>
                      <div className="relative overflow-hidden bg-gray-100">
                        <img 
                          src={product.image_url} 
                          alt={product.title}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.discount_percentage > 0 && (
                          <Badge className="absolute top-4 right-4 bg-red-500 text-lg px-3 py-1 shadow-lg">
                            {product.discount_percentage}% OFF
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

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {product.offer_text && (
                        <p className="text-green-600 text-sm font-medium mb-3 flex items-center">
                          <Sparkles className="w-4 h-4 mr-1" />
                          {product.offer_text}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          {product.discount_percentage > 0 ? (
                            <div>
                              <span className="text-2xl font-bold text-gray-900">
                                ₹{product.final_price.toLocaleString()}
                              </span>
                              <div>
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{product.price.toLocaleString()}
                                </span>
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
                          className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
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
          </div>
        </div>
      </div>
    </div>
  );
}