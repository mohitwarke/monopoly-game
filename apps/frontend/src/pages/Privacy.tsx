// Privacy Policy Page
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, ArrowLeft, FileText, Shield, Users, Clock, Eye, Lock, Database, Globe, Trash2, Download } from 'lucide-react';
import { Button } from '@monopoly/ui-components';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: FileText,
    content: `
      <p>Monopoly Game ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>
      <p>By using the Service, you agree to the collection and use of information in accordance with this policy.</p>
    `
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    icon: Database,
    content: `
      <h3 className="font-semibold text-white mb-2">Personal Information</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-300">
        <li>Account information: username, email address, password (hashed)</li>
        <li>Profile information: avatar, bio, preferences</li>
        <li>Payment information: processed by third-party providers (Stripe)</li>
      </ul>

      <h3 className="font-semibold text-white mt-4 mb-2">Automatically Collected Information</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-300">
        <li>Usage data: games played, actions taken, time spent</li>
        <li>Device information: IP address, browser type, operating system</li>
        <li>Log data: access times, error reports, performance metrics</li>
        <li>Cookies and similar tracking technologies</li>
      </ul>

      <h3 className="font-semibold text-white mt-4 mb-2">Game Data</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-300">
        <li>Game state, moves, chat messages</li>
        <li>Replay data for games you participate in</li>
        <li>Tournament participation and results</li>
        <li>AI interaction data for improvement</li>
      </ul>
    `
  },
  {
    id: 'use-of-information',
    title: '3. How We Use Your Information',
    icon: Shield,
    content: `
      <ul className="list-disc list-inside space-y-2 text-gray-300">
        <li>Provide, maintain, and improve the Service</li>
        <li>Create and manage your account</li>
        <li>Enable multiplayer gameplay and matchmaking</li>
        <li>Process transactions and send receipts</li>
        <li>Send notifications (game invites, updates, security alerts)</li>
        <li>Personalize your experience and recommendations</li>
        <li>Detect and prevent fraud, cheating, and abuse</li>
        <li>Analyze usage trends to improve the Service</li>
        <li>Comply with legal obligations</li>
      </ul>
    `
  },
  {
    id: 'sharing',
    title: '4. Information Sharing & Disclosure',
    icon: Users,
    content: `
      <p>We do not sell your personal information. We may share information in the following circumstances:</p>
      <ul className="list-disc list-inside space-y-2 text-gray-300 mt-2">
        <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (hosting, analytics, payments)</li>
        <li><strong>Game Participants:</strong> Other players in your games can see your username, avatar, and game actions</li>
        <li><strong>Tournaments:</strong> Tournament organizers and participants can see your tournament profile and results</li>
        <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
        <li><strong>Safety:</strong> To protect rights, property, or safety of users or the public</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
      </ul>
      <p className="mt-2">We may share aggregated, anonymized data that cannot identify you personally.</p>
    `
  },
  {
    id: 'cookies',
    title: '5. Cookies & Tracking Technologies',
    icon: Eye,
    content: `
      <p>We use cookies and similar technologies to:</p>
      <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2">
        <li>Authenticate and maintain your session</li>
        <li>Remember your preferences and settings</li>
        <li>Analyze usage patterns and improve performance</li>
        <li>Deliver targeted notifications (with consent)</li>
      </ul>
      <p className="mt-2">You can control cookies through your browser settings. Disabling cookies may affect Service functionality.</p>
      <p className="mt-2">We use the following categories of cookies:</p>
      <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2">
        <li><strong>Essential:</strong> Required for the Service to function</li>
        <li><strong>Preferences:</strong> Remember your settings and choices</li>
        <li><strong>Analytics:</strong> Help us understand how the Service is used</li>
        <li><strong>Marketing:</strong> Deliver relevant communications (opt-in only)</li>
      </ul>
    `
  },
  {
    id: 'data-security',
    title: '6. Data Security',
    icon: Lock,
    content: `
      <p>We implement appropriate technical and organizational measures to protect your information:</p>
      <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2">
        <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
        <li>Passwords hashed with bcrypt (cost factor 12)</li>
        <li>JWT tokens with short expiration and secure refresh mechanism</li>
        <li>Rate limiting and DDoS protection</li>
        <li>Regular security audits and penetration testing</li>
        <li>Principle of least privilege for data access</li>
      </ul>
      <p className="mt-2">However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
    `
  },
  {
    id: 'data-retention',
    title: '7. Data Retention',
    icon: Clock,
    content: `
      <p>We retain your information for as long as necessary to fulfill the purposes outlined in this policy:</p>
      <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2">
        <li>Account data: While your account is active</li>
        <li>Game data: 2 years for replay and statistics</li>
        <li>Transaction records: 7 years for legal compliance</li>
        <li>Log data: 90 days</li>
        <li>Analytics data: 26 months (anonymized)</li>
      </ul>
      <p className="mt-2">You can request deletion of your data at any time (see Your Rights below).</p>
    `
  },
  {
    id: 'your-rights',
    title: '8. Your Rights',
    icon: Download,
    content: `
      <p>Depending on your jurisdiction, you may have the following rights:</p>
      <ul className="list-disc list-inside space-y-2 text-gray-300 mt-2">
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
        <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
        <li><strong>Restriction:</strong> Limit processing of your data</li>
        <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
        <li><strong>Objection:</strong> Object to processing for direct marketing or legitimate interests</li>
        <li><strong>Withdraw Consent:</strong> Withdraw consent for processing based on consent</li>
      </ul>
      <p className="mt-2">To exercise these rights, contact us at privacy@monopolygame.example.com or use the account settings page.</p>
    `
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy',
    icon: Shield,
    content: `
      <p>The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us. We will delete such information promptly.</p>
      <p>Users must be at least 13 years old to create an account.</p>
    `
  },
  {
    id: 'international',
    title: '10. International Transfers',
    icon: Globe,
    content: `
      <p>Your information may be transferred to and processed in countries other than your own, including the United States. These countries may have different data protection laws.</p>
      <p>We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission, for transfers outside the EEA.</p>
    `
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    icon: Clock,
    content: `
      <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last Updated" date.</p>
      <p>For significant changes, we may also notify you via email or in-app notification.</p>
    `
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    icon: Globe,
    content: `
      <p>If you have questions about this Privacy Policy or our data practices, contact us:</p>
      <ul className="list-disc list-inside space-y-1 mt-2 text-gray-300">
        <li>Email: privacy@monopolygame.example.com</li>
        <li>Address: 123 Game Street, Suite 100, Wilmington, DE 19801</li>
        <li>Data Protection Officer: dpo@monopolygame.example.com</li>
      </ul>
    `
  },
];

export function Privacy() {
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Privacy Policy</h1>
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
            <p className="text-gray-400 mb-4">Your privacy matters to us. We're committed to protecting your data.</p>
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