'use client';

import React, { useState } from 'react';
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/lib/db';
import { ALL_INDIAN_STATES, INDIAN_STATES_CITIES } from '@/lib/indian-states-cities';

interface OrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderModal({ product, isOpen, onClose }: OrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  
  // Dependent State & City states
  const [selectedState, setSelectedState] = useState('');
  const [customState, setCustomState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [customCity, setCustomCity] = useState('');

  const [pincode, setPincode] = useState('');
  const [additionalReqs, setAdditionalReqs] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmationOrder, setConfirmationOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    customerName: string;
  } | null>(null);

  if (!isOpen || !product) return null;

  const currentUnitPrice = product.sale_price && product.sale_price < product.price
    ? product.sale_price
    : product.price;

  const totalEstimatedAmount = currentUnitPrice * quantity;
  const maxAvailableStock = product.stock_quantity > 0 ? product.stock_quantity : 999;

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < maxAvailableStock) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.error(`Maximum available stock is ${maxAvailableStock}`);
    }
  };

  const handleStateChange = (stateVal: string) => {
    setSelectedState(stateVal);
    if (stateVal !== 'OTHER') {
      setCustomState('');
    }
    // Reset City selection when State changes
    setSelectedCity('');
    setCustomCity('');
  };

  const validateForm = (): boolean => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('Please enter a valid Full Name (at least 2 characters).');
      return false;
    }

    // Validate Indian 10-digit mobile number
    const cleanMobile = mobileNumber.replace(/[\s\-\+\(\)]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return false;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    if (!address.trim() || address.trim().length < 5) {
      toast.error('Please enter a detailed Delivery Address.');
      return false;
    }

    const finalState = selectedState === 'OTHER' ? customState.trim() : selectedState;
    if (!finalState) {
      toast.error('Please select or enter your State.');
      return false;
    }

    const finalCity = selectedCity === 'OTHER' ? customCity.trim() : selectedCity;
    if (!finalCity) {
      toast.error('Please select or enter your City.');
      return false;
    }

    // Validate Indian 6-digit PIN code
    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error('Please enter a valid 6-digit PIN code.');
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    const finalState = selectedState === 'OTHER' ? customState.trim() : selectedState;
    const finalCity = selectedCity === 'OTHER' ? customCity.trim() : selectedCity;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
          customer_name: fullName.trim(),
          customer_phone: mobileNumber.trim(),
          customer_email: emailAddress.trim().toLowerCase(),
          company_name: companyName.trim() || null,
          address: address.trim(),
          city: finalCity,
          state: finalState,
          pincode: pincode.trim(),
          additional_requirements: additionalReqs.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConfirmationOrder({
          orderNumber: data.order_number,
          totalAmount: data.total_amount,
          customerName: fullName.trim(),
        });
        toast.success('Order request submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to submit order request.');
      }
    } catch {
      toast.error('Network error submitting order.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setConfirmationOrder(null);
    setQuantity(1);
    setFullName('');
    setMobileNumber('');
    setEmailAddress('');
    setCompanyName('');
    setAddress('');
    setSelectedState('');
    setCustomState('');
    setSelectedCity('');
    setCustomCity('');
    setPincode('');
    setAdditionalReqs('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted/60 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-extrabold text-lg text-foreground tracking-tight">
              {confirmationOrder ? 'Order Confirmation' : 'Order Request Form'}
            </h2>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-full hover:bg-background/80 text-foreground/70 hover:text-foreground transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {confirmationOrder ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6 flex-1 overflow-y-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-foreground">Order Request Submitted Successfully!</h3>
              <p className="text-sm text-foreground/75 mt-2">
                Thank you, <span className="font-bold text-foreground">{confirmationOrder.customerName}</span>. We have received your request and our engineering sales team will contact you shortly.
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-muted/40 border border-border rounded-2xl p-6 text-left space-y-3 font-mono text-sm max-w-md mx-auto">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-foreground/60">Order Number:</span>
                <span className="font-bold text-primary">{confirmationOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-foreground/60">Product:</span>
                <span className="font-bold text-foreground truncate max-w-[200px]">{product.name}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-foreground/60">Quantity:</span>
                <span className="font-bold text-foreground">{quantity} unit(s)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-foreground/60">Estimated Total:</span>
                <span className="font-extrabold text-base text-foreground">
                  ₹{confirmationOrder.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <button
                onClick={resetAndClose}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Order Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Auto Selected Product Info Box */}
            <div className="bg-muted/50 border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={product.featured_image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-xl border border-border bg-background flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {product.category_name}
                  </span>
                  <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-1">{product.name}</h3>
                  <div className="text-xs text-foreground/60 font-mono mt-0.5">
                    Unit Price: <span className="font-bold text-foreground">₹{currentUnitPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                <div className="text-xs font-semibold text-foreground/70 uppercase">Qty:</div>
                <div className="flex items-center border border-border bg-background rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1}
                    className="p-2 text-foreground/70 hover:text-foreground hover:bg-muted transition disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-bold text-sm text-foreground min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    disabled={quantity >= maxAvailableStock}
                    className="p-2 text-foreground/70 hover:text-foreground hover:bg-muted transition disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Calculation Display */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Total Estimated Amount:</span>
              <span className="text-2xl font-black text-foreground">₹{totalEstimatedAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Customer Information Inputs */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground/70 border-b border-border pb-2">
                Customer & Delivery Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-foreground/40" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Rajesh Sharma"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-foreground/40" />
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g., 9876543210"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-foreground/40" />
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="rajesh@company.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">Company Name (Optional)</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-foreground/40" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Apex Industries Ltd."
                      className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">Delivery Address *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-foreground/40" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Plot No. 42, Sanwer Road Industrial Area"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                </div>

                {/* State Dropdown (First) */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    State *
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition cursor-pointer text-foreground"
                  >
                    <option value="" disabled>-- Select State --</option>
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                    <option value="OTHER">Other State (Specify Manually)</option>
                  </select>

                  {selectedState === 'OTHER' && (
                    <input
                      type="text"
                      value={customState}
                      onChange={(e) => setCustomState(e.target.value)}
                      placeholder="Enter State Name"
                      required
                      className="w-full mt-2 px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  )}
                </div>

                {/* City Dropdown (Second - Dependent on State) */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    City *
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    required
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition cursor-pointer text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>
                      {!selectedState ? '-- Select State First --' : '-- Select City --'}
                    </option>
                    {selectedState &&
                      selectedState !== 'OTHER' &&
                      (INDIAN_STATES_CITIES[selectedState] || []).map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    <option value="OTHER">Other City (Specify Manually)</option>
                  </select>

                  {selectedCity === 'OTHER' && (
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="Enter City Name"
                      required
                      className="w-full mt-2 px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  )}
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="452015"
                    required
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                {/* Additional Requirements */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground/80 mb-1">
                    Additional Technical / Customization Requirements
                  </label>
                  <textarea
                    rows={2}
                    value={additionalReqs}
                    onChange={(e) => setAdditionalReqs(e.target.value)}
                    placeholder="Any specific material tolerances, expedited delivery needs, or custom mounting instructions..."
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              </div>
            </div>

            {/* Action Submit Button */}
            <div className="pt-4 border-t border-border">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Order Request...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Submit Order Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
