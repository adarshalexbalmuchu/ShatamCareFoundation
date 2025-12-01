import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSiteSettings, type SiteSettings } from '@/lib/supabase-secure';

const TermsOfService = () => {
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
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>
          
          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using the Shatam Care Foundation website ("Service"), you accept and agree to be bound by the terms and 
                provisions of this agreement ("Terms of Service"). If you do not agree to abide by these terms, please do 
                not use this website.
              </p>
              <p className="mb-4">
                These Terms of Service apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
              <p className="mb-4">
                Shatam Care Foundation is a non-profit organization dedicated to dementia care, caregiver training, and supporting 
                families affected by dementia across India. Our website provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Information about our programs and services</li>
                <li>Educational resources about dementia care</li>
                <li>Event registration and participation</li>
                <li>Donation processing capabilities</li>
                <li>Contact forms and communication tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Responsibilities</h2>
              <p className="mb-4">When using our Service, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide accurate and truthful information</li>
                <li>Use the Service for lawful purposes only</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not engage in any activity that could harm or disrupt the Service</li>
                <li>Maintain the confidentiality of any login credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Intellectual Property Rights</h2>
              <p className="mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of 
                Shatam Care Foundation and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
              <p className="mb-4">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, 
                republish, download, store, or transmit any of the material on our Service without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Donations and Financial Transactions</h2>
              <p className="mb-4">
                All donations made through our website are voluntary and non-refundable unless required by law. Donations are 
                eligible for tax benefits under Section 80G of the Income Tax Act, 1961.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Donation receipts will be provided for tax purposes</li>
                <li>All transactions are processed through secure payment gateways</li>
                <li>We reserve the right to refuse or return donations at our discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Privacy and Data Protection</h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Disclaimers</h2>
              <p className="mb-4">
                The information on this website is provided on an "as is" basis. Shatam Care Foundation disclaims all warranties, 
                express or implied, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties regarding the accuracy, reliability, or completeness of the content</li>
                <li>Warranties that the Service will be uninterrupted or error-free</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                In no event shall Shatam Care Foundation, its directors, employees, partners, agents, suppliers, or affiliates 
                be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Modifications to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to 
                provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be interpreted and governed in accordance with the laws of India. Any disputes relating to 
                these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">Shatam Care Foundation</p>
                <p>Email: {siteSettings?.contactEmail || 'shatamcare@gmail.com'}</p>
                <p>Phone: {siteSettings?.contactPhone || '+91 9158566665'}</p>
                <p>Address: {siteSettings?.address || 'Mumbai, India'}</p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
