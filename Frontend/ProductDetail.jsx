
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Product } from '@/entities/Product';
import { User } from '@/entities/User';
import { CartItem } from '@/entities/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, Package, Shield, Truck } from 'lucide-react';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
      const products = await Product.filter({ id: productId });
      if (products.length > 0) {
        setProduct(products[0]);
        setSelectedImage(products[0].image_url);
      }
    }

    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  const addToCart = async () => {
    if (!user) {
      await User.login();
      return;
    }

    setAdding(true);
    
    const existingItems = await CartItem.filter({ 
      user_email: user.email, 
      product_id: product.id 
    });

    if (existingItems.length > 0) {
      await CartItem.update(existingItems[0].id, {
        quantity: existingItems[0].quantity + quantity
      });
    } else {
      await CartItem.create({
        user_email: user.email,
        product_id: product.id,
        product_title: product.title,
        product_image: product.image_url,
        price: product.final_price || product.price,
        quantity
      });
    }

    window.location.href = createPageUrl('Cart');
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const images = [product.image_url, ...(product.additional_images || [])];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl('Shop')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl">
              <img 
                src={selectedImage} 
                alt={product.title}
                className="w-full h-[500px] object-cover"
              />
              {product.discount_percentage > 0 && (
                <Badge className="absolute top-6 right-6 bg-red-500 text-lg px-4 py-2">
                  {product.discount_percentage}% OFF
                </Badge>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === img ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-4">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <p className="text-gray-600">{product.brand}</p>
            </div>

            <div className="flex items-baseline space-x-4">
              {product.discount_percentage > 0 ? (
                <>
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{product.final_price.toLocaleString()}
                  </span>
                  <span className="text-2xl text-gray-500 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <Badge className="bg-green-500">
                    Save ₹{(product.price - product.final_price).toLocaleString()}
                  </Badge>
                </>
              ) : (
                <span className="text-4xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {product.offer_text && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <p className="text-green-800 font-medium">
                    🎉 {product.offer_text}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="border-t border-b py-6">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <Package className={`w-5 h-5 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} units)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg"
                onClick={addToCart}
                disabled={adding || product.stock_quantity === 0}
              >
                {adding ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-4 pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Free Delivery</p>
                  <p className="text-sm text-gray-600">On orders above ₹500</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% secure transactions</p>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Specifications</h3>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b last:border-0">
                        <span className="text-gray-600 font-medium">{key}</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Product Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
