
import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { CartItem } from '@/entities/CartItem';
import { Order } from '@/entities/Order';
import { User } from '@/entities/User';
import { UserActivity } from '@/entities/UserActivity';
import { SendEmail } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, CreditCard, Smartphone } from 'lucide-react';
import { format } from 'date-fns';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [shippingData, setShippingData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('paytm');
  const [simulateFailure, setSimulateFailure] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      setShippingData(prev => ({
        ...prev,
        name: currentUser.full_name,
        email: currentUser.email,
        phone: currentUser.phone || ''
      }));

      const items = await CartItem.filter({ user_email: currentUser.email });
      if (items.length === 0) {
        window.location.href = createPageUrl('Cart');
      }
      setCartItems(items);
    } catch (error) {
      window.location.href = createPageUrl('Home');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * 0.05;
  const tax = (subtotal - discount) * 0.18;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal - discount + tax + shipping;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const processPayment = async () => {
    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const paymentSuccess = !simulateFailure;
    const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    const orderNumber = 'ORD' + Date.now();

    const orderData = {
      order_number: orderNumber,
      user_email: user.email,
      user_name: shippingData.name,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        product_title: item.product_title,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal,
      discount,
      tax,
      shipping,
      total,
      shipping_address: {
        street: shippingData.street,
        city: shippingData.city,
        state: shippingData.state,
        pincode: shippingData.pincode,
        phone: shippingData.phone
      },
      payment_method: paymentMethod,
      payment_status: paymentSuccess ? 'success' : 'failed',
      order_status: paymentSuccess ? 'confirmed' : 'pending',
      transaction_id: transactionId
    };

    const order = await Order.create(orderData);

    // Log activity
    await UserActivity.create({
      user_email: user.email,
      user_name: user.name,
      activity_type: paymentSuccess ? 'payment_success' : 'payment_failed',
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        amount: total,
        payment_method: paymentMethod,
        transaction_id: transactionId
      }
    });

    if (paymentSuccess) {
      await UserActivity.create({
        user_email: user.email,
        user_name: user.full_name,
        activity_type: 'order_created',
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          total: total
        }
      });

      // Send email receipts
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #1e40af, #1e3a8a); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">AiryShop</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1e293b;">Order Confirmation</h2>
            <p>Hi ${shippingData.name},</p>
            <p>Thank you for your order! Your payment was successful.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Date:</strong> ${format(new Date(), 'PPP')}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Items Ordered</h3>
              ${cartItems.map(item => `
                <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                  <p style="margin: 5px 0;"><strong>${item.product_title}</strong></p>
                  <p style="margin: 5px 0; color: #6b7280;">Quantity: ${item.quantity} × ₹${item.price.toLocaleString()}</p>
                  <p style="margin: 5px 0;"><strong>₹${(item.price * item.quantity).toLocaleString()}</strong></p>
                </div>
              `).join('')}
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Summary</h3>
              <table style="width: 100%;">
                <tr><td>Subtotal:</td><td align="right">₹${subtotal.toLocaleString()}</td></tr>
                <tr><td style="color: #16a34a;">Discount:</td><td align="right" style="color: #16a34a;">-₹${discount.toFixed(2)}</td></tr>
                <tr><td>Tax (GST 18%):</td><td align="right">₹${tax.toFixed(2)}</td></tr>
                <tr><td>Shipping:</td><td align="right">${shipping === 0 ? 'FREE' : '₹' + shipping}</td></tr>
                <tr style="border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 1.2em;">
                  <td style="padding-top: 10px;">Total Paid:</td>
                  <td align="right" style="padding-top: 10px;">₹${total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Shipping Address</h3>
              <p style="margin: 5px 0;">${shippingData.name}</p>
              <p style="margin: 5px 0;">${shippingData.street}</p>
              <p style="margin: 5px 0;">${shippingData.city}, ${shippingData.state} - ${shippingData.pincode}</p>
              <p style="margin: 5px 0;">Phone: ${shippingData.phone}</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Need help? Contact us at support@airyshop.com
            </p>
          </div>

          <div style="background: #1e293b; padding: 20px; text-align: center; color: white; font-size: 12px;">
            <p>© 2024 AiryShop. All rights reserved.</p>
            <p style="margin-top: 10px;">Developed by Harsh Vardhan</p>
          </div>
        </div>
      `;

      // Send to buyer
      await SendEmail({
        to: shippingData.email,
        subject: `Order Confirmation - ${orderNumber}`,
        body: emailBody
      });

      // Send to admin
      await SendEmail({
        to: 'harshaer35@gmail.com',
        subject: `New Order Received - ${orderNumber}`,
        body: emailBody
      });

      // Clear cart
      for (const item of cartItems) {
        await CartItem.delete(item.id);
      }

      window.location.href = createPageUrl('OrderConfirmation') + '?id=' + order.id;
    } else {
      setProcessing(false);
      alert('Payment failed! Please try again.');
    }
  };

  const steps = [
    { number: 1, title: 'Shipping' },
    { number: 2, title: 'Payment' }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((s, idx) => (
              <React.Fragment key={s.number}>
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    step >= s.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s.number ? <Check className="w-6 h-6" /> : s.number}
                  </div>
                  <span className={`ml-3 font-medium ${
                    step >= s.number ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 ${
                    step > s.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={shippingData.name}
                          onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingData.email}
                          onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        value={shippingData.street}
                        onChange={(e) => setShippingData({...shippingData, street: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingData.state}
                          onChange={(e) => setShippingData({...shippingData, state: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={shippingData.pincode}
                          onChange={(e) => setShippingData({...shippingData, pincode: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="paytm" id="paytm" />
                      <Label htmlFor="paytm" className="flex items-center cursor-pointer flex-1">
                        <Smartphone className="w-6 h-6 mr-3 text-blue-600" />
                        <span className="font-medium">Paytm</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="phonepe" id="phonepe" />
                      <Label htmlFor="phonepe" className="flex items-center cursor-pointer flex-1">
                        <Smartphone className="w-6 h-6 mr-3 text-purple-600" />
                        <span className="font-medium">PhonePe</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="googlepay" id="googlepay" />
                      <Label htmlFor="googlepay" className="flex items-center cursor-pointer flex-1">
                        <Smartphone className="w-6 h-6 mr-3 text-green-600" />
                        <span className="font-medium">Google Pay</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                        <CreditCard className="w-6 h-6 mr-3 text-amber-600" />
                        <span className="font-medium">Credit / Debit Card</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Test Mode Toggle */}
                  <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-semibold text-amber-900 mb-3">🧪 Test Mode</h3>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="simulate-failure"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="simulate-failure" className="text-sm text-amber-900 cursor-pointer">
                        Simulate payment failure (for testing)
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={processPayment}
                      disabled={processing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {processing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Pay ₹' + total.toFixed(2)
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <img 
                        src={item.product_image} 
                        alt={item.product_title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">{item.product_title}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
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
