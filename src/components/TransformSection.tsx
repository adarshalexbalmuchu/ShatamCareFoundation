import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

// Feature flag (can later be turned on via env or settings)
export const TRANSFORM_SECTION_FLAG = false;

// NOTE: This component was extracted on request to temporarily hide it from the site.
// Do NOT delete. Re-enable by rendering <TransformSection /> where needed and
// optionally toggling TRANSFORM_SECTION_FLAG to true or wiring an env/site setting.

const donationOptions = [
  { amount: '₹500', purpose: 'Caregiver Resources', impact: 'Provides printed dementia care guides to families in need.' },
  { amount: '₹1,000', purpose: 'Support Group Session', impact: 'Funds one support group session for caregivers.' },
  { amount: '₹2,500', purpose: 'Training Scholarship', impact: 'Sponsors partial training for a low-income caregiver.', popular: true },
  { amount: '₹5,000', purpose: 'Community Workshop', impact: 'Helps organize a community dementia awareness workshop.' },
];

export const TransformSection: React.FC = () => {
  return (
    <section id="donate" className="section-padding bg-gradient-to-br from-warm-teal via-warm-teal-600 to-sunrise-orange text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-poppins">Transform a Life Today</h2>
        <p className="text-xl max-w-3xl mx-auto mb-12">Choose your impact - every donation directly supports our mission.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {donationOptions.map((option, index) => (
            <Card key={index} className={`donation-card bg-white text-dark-charcoal hover:shadow-2xl transition-all duration-300 ${option.popular ? 'ring-4 ring-sunrise-orange' : ''}`}>
              {option.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sunrise-orange text-white text-xs px-3 py-1 rounded-full font-bold z-10">POPULAR</div>}
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="text-3xl font-bold text-warm-teal mb-2">{option.amount}</div>
                  <div className="font-semibold text-gray-800">{option.purpose}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl my-4 text-sm text-gray-600">{option.impact}</div>
                <Button className="btn-cta w-full">Donate Securely <Heart className="ml-2 h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformSection;
