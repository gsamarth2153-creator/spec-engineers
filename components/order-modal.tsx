'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
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
    customerName: string;
  } | null>(null);

  if (!isOpen || !product) return null;

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
          quantity: 1,
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
          customerName: fullName.trim(),
        });
        toast.success('Enquiry request submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to submit enquiry request.');
      }
    } catch {
      toast.error('Network error submitting enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setConfirmationOrder(null);
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
            <Send className="w-5 h-5 text-primary" />
            <h2 className="font-extrabold text-lg text-foreground tracking-tight">
              {confirmationOrder ? 'Enquiry Confirmation' : 'Enquiry Request Form'}
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
              <h3 className="text-2xl font-extrabold text-foreground">Enquiry Request Submitted Successfully!</h3>
              <p className="text-sm text-foreground/75 mt-2">
                Thank you, <span className="font-bold text-foreground">{confirmationOrder.customerName}</span>. We have received your request and our engineering sales team will contact you shortly.
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-muted/40 border border-border rounded-2xl p-6 text-left space-y-3 font-mono text-sm max-w-md mx-auto">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-foreground/60">Enquiry Number:</span>
                <span className="font-bold text-primary">{confirmationOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-foreground/60">Product:</span>
                <span className="font-bold text-foreground truncate max-w-[200px]">{product.name}</span>
              </div>
            </div>

            <div>
              <button
                onClick={resetAndClose}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        ) : (
          /* Order Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Auto Selected Product Info Box */}
            <div className="bg-muted/50 border border-border rounded-2xl p-4 flex items-center gap-4">
              <img
                src={product.featured_image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-xl border border-border bg-background flex-shrink-0"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {product.category_name}
                </span>
                <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{product.name}</h3>
                {product.sku && (
                  <div className="text-xs text-foreground/60 font-mono mt-0.5">
                    Model / SKU: <span className="font-bold text-foreground">{product.sku}</span>
                  </div>
                )}
              </div>
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
                    <span>Processing Enquiry Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Enquiry Request</span>
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
