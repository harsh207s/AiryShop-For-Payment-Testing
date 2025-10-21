
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { Order } from '@/entities/Order';
import { UserActivity } from '@/entities/UserActivity';
import { Product } from '@/entities/Product';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ShoppingBag, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setCurrentUser(user);

      // Load stats
      const users = await User.list();
      const orders = await Order.list();
      const products = await Product.list();

      const totalRevenue = orders
        .filter(o => o.payment_status === 'success')
        .reduce((sum, o) => sum + o.total, 0);

      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length
      });

      // Load recent orders
      const recent = await Order.list('-created_date', 10);
      setRecentOrders(recent);

      // Load recent signups
      const signups = await UserActivity.filter({ activity_type: 'signup' }, '-created_date', 10);
      setRecentSignups(signups);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {currentUser.full_name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{order.order_number}</p>
                          <p className="text-sm text-gray-600">{order.user_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{order.total.toFixed(2)}</p>
                          <Badge className={
                            order.payment_status === 'success' ? 'bg-green-500' :
                            order.payment_status === 'failed' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }>
                            {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {format(new Date(order.created_date), 'PPP')}
                        </p>
                        <Link to={createPageUrl('OrderConfirmation') + '?id=' + order.id}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Signups */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Signups</h2>
              {recentSignups.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No signups yet</p>
              ) : (
                <div className="space-y-4">
                  {recentSignups.map(signup => (
                    <div key={signup.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{signup.user_name}</p>
                            <p className="text-sm text-gray-600">{signup.user_email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{signup.signup_method}</Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-2 ml-13">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(signup.created_date), 'PPP p')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
