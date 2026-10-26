// Terms of Service Page
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, ArrowLeft, FileText, Shield, Users, Clock, Gavel, Globe } from 'lucide-react';
import { Button } from '@monopoly/ui-components';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    icon: FileText,
    content: `
      <p>By accessing or using the Monopoly Game service ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.</p>
      <p>These Terms apply to all visitors, users, and others who access or use the Service.</p>
    `
  },
  {
    id: 'accounts',
    title: '2. User Accounts',
    icon: Users,
    content: `
      <p>When you create an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
      <p>You must be at least 13 years old to create an account. By creating an account, you represent and warrant that you meet this requirement.</p>
      <p>We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.</p>
    `
  },
  {
    id: 'conduct',
    title: '3. User Conduct',
    icon: Shield,
    content: `
      <p>You agree not to use the Service for any unlawful or prohibited purpose. You will not:</p>
      <ul className="list-disc list-inside space-y-2 mt-2 text-gray-300">
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe on intellectual property rights</li>
        <li>Harass, abuse, or harm other users</li>
        <li>Use cheats, bots, or unauthorized third-party software</li>
        <li>Attempt to gain unauthorized access to systems or data</li>
        <li>Disrupt the Service or interfere with other users' enjoyment</li>
      </ul>
    `
  },
  {
    id: 'content',
    title: '4. Content & Intellectual Property',
    icon: Gavel,
    content: `
      <p>The Service and its original content (excluding user-generated content), features, and functionality are owned by Monopoly Game and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
      <p>You retain ownership of content you create and share through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content for the purpose of operating and improving the Service.</p>
      <p>Monopoly® is a trademark of Hasbro, Inc. This is an independent implementation for educational/entertainment purposes.</p>
    `
  },
  {
    id: 'modding',
    title: '5. Modding & Plugins',
    icon: Puzzle,
    content: `
      <p>The Service supports a modding system allowing users to create and share plugins (board skins, rule packs, piece sets, AI personalities, game modes). By submitting a plugin:</p>
      <ul className="list-disc list-inside space-y-2 mt-2 text-gray-300">
        <li>You grant us a license to host, distribute, and display your plugin</li>
        <li>You represent that you have the rights to all content in your plugin</li>
        <li>You agree not to include malicious code, tracking, or unauthorized network requests</li>
        <li>We reserve the right to remove plugins that violate these Terms or pose security risks</li>
      </ul>
      <p>Plugins run in a secure sandbox with restricted permissions. We are not responsible for third-party plugin content.</p>
    `
  },
  {
    id: 'payments',
    title: '6. Payments & Subscriptions',
    icon: CreditCard,
    content: `
      <p>Certain features may require payment. By making a purchase, you agree to pay all charges at the prices then in effect. All payments are processed by third-party payment processors (e.g., Stripe) and are subject to their terms.</p>
      <p>Subscriptions auto-renew unless cancelled. You may cancel at any time, but refunds are not provided for partial periods.</p>
    `
  },
  {
    id: 'termination',
    title: '7. Termination',
    icon: X,
    content: `
      <p>We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
      <p>Upon termination, your right to use the Service ceases immediately. Provisions that should survive termination will survive.</p>
    `
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimer of Warranties',
    icon: AlertTriangle,
    content: `
      <p>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.</p>
      <p>We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
    `
  },
  {
    id: 'limitation',
    title: '9. Limitation of Liability',
    icon: AlertTriangle,
    content: `
      <p>In no event shall Monopoly Game, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
      <p>Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim, or $100, whichever is greater.</p>
    `
  },
  {
    id: 'governing',
    title: '10. Governing Law',
    icon: Gavel,
    content: `
      <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>
      <p>Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
    `
  },
  {
    id: 'changes',
    title: '11. Changes to Terms',
    icon: Clock,
    content: `
      <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the new Terms on this page and updating the "Last Updated" date.</p>
      <p>Your continued use of the Service after changes constitutes acceptance of the new Terms.</p>
    `
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    icon: Globe,
    content: `
      <p>If you have any questions about these Terms, please contact us:</p>
      <ul className="list-disc list-inside space-y-1 mt-2 text-gray-300">
        <li>Email: legal@monopolygame.example.com</li>
        <li>Address: 123 Game Street, Suite 100, Wilmington, DE 19801</li>
      </ul>
    `
  },
];

export function Terms() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-monopoly-red to-red-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-white text-2xl">M</span>
              </div>
              <span className="font-display text-xl font-bold text-white">Monopoly</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-monopoly-red to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-400 mt-2">Last updated: October 26, 2026</p>
          </div>

          <div className="space-y-10">
            {sections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                className="prose prose-invert max-w-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-monopoly-red" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{section.title}</h2>
                </div>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 mb-4">By using Monopoly Game, you agree to these Terms of Service.</p>
            <Link to="/register">
              <Button variant="primary" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Need to import missing icons
import { CreditCard, AlertTriangle, X, Puzzle } from 'lucide-react';