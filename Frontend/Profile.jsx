
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { Order } from '@/entities/Order';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Package, MapPin, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const userOrders = await Order.filter({ user_email: currentUser.email }, '-created_date', 10);
      setOrders(userOrders);
    } catch (error) {
      window.location.href = createPageUrl('Home');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-12 h-12 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">{user.full_name}</h2>
                  <Badge className="mt-2">{user.role}</Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="w-5 h-5" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Account Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-semibold">{orders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-semibold">
                        {format(new Date(user.created_date), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Order History</h2>
                  <Package className="w-6 h-6 text-gray-400" />
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link to={createPageUrl('Shop')}>
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id} className="hover:shadow-md transition">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-semibold text-lg">{order.order_number}</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(order.created_date), 'PPP')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">₹{order.total.toFixed(2)}</p>
                              <Badge className={
                                order.payment_status === 'success' ? 'bg-green-500' : 
                                order.payment_status === 'failed' ? 'bg-red-500' : 
                                'bg-yellow-500'
                              }>
                                {order.payment_status}
                              </Badge>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <p className="text-sm text-gray-600 mb-2">Items:</p>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <p key={idx} className="text-sm">
                                  {item.product_title} × {item.quantity}
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>
                                {order.shipping_address.city}, {order.shipping_address.state}
                              </span>
                            </div>
                            <Link to={createPageUrl('OrderConfirmation') + '?id=' + order.id}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
