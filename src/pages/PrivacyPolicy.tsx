import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSiteSettings, type SiteSettings } from '@/lib/supabase-secure';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    let active = true;
    
    const loadSiteSettings = async () => {
      try {
        const settings = await getSiteSettings();
        if (active) setSiteSettings(settings);
      } catch (error) {
        console.error('Failed to load site settings:', error);
      }
    };

    loadSiteSettings();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 bg-white shadow-lg rounded-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>
          
          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                At Shatam Care Foundation, we collect information that you provide directly to us, such as when you:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Register for events or programs</li>
                <li>Make donations through our website</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us through our contact forms</li>
                <li>Participate in surveys or feedback forms</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal Information may include:</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Name and contact information (email, phone, address)</li>
                <li>Demographic information (age, gender)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Communication preferences</li>
                <li>Information about your caregiving experience or needs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect about you to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide you with information about our services and programs</li>
                <li>Process your donations and provide receipts</li>
                <li>Send you newsletters and updates (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the internet is 100% secure. We strive to 
                protect your personal information but cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Withdraw consent for communications</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <p className="mb-4">
                For questions about this Privacy Policy, please contact us at:{' '}
                <a 
                  href={`mailto:${siteSettings?.contactEmail || 'shatamcare@gmail.com'}`}
                  className="text-warm-teal hover:text-warm-teal-600 underline"
                >
                  {siteSettings?.contactEmail || 'shatamcare@gmail.com'}
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Updates to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. The latest version will always 
                be posted on this page with the effective date.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Last updated: July 7, 2025
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
