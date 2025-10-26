import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-white hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <Shield className="w-12 h-12 text-white" />
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-white text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-8 text-white/80">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
                <p>
                  At NNH Local, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
                  and safeguard your information when you use our Google My Business management platform.
                </p>
              </section>

              <section className="grid md:grid-cols-2 gap-6">
                <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                  <Database className="w-8 h-8 text-orange-500 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Data Collection</h3>
                  <p className="text-sm">We collect only the data necessary to provide our services effectively.</p>
                </div>
                <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                  <Lock className="w-8 h-8 text-orange-500 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Security</h3>
                  <p className="text-sm">Your data is encrypted and protected with industry-standard security measures.</p>
                </div>
                <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                  <UserCheck className="w-8 h-8 text-orange-500 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">User Control</h3>
                  <p className="text-sm">You have full control over your data and can request deletion at any time.</p>
                </div>
                <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                  <Globe className="w-8 h-8 text-orange-500 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Transparency</h3>
                  <p className="text-sm">We are transparent about how we use and protect your information.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <Eye className="w-6 h-6" />
                  <span>Information We Collect</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Name and email address</li>
                      <li>Phone number (if provided)</li>
                      <li>Company information</li>
                      <li>Profile picture (optional)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Google My Business Data</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Business profile information</li>
                      <li>Reviews and ratings</li>
                      <li>Posts and media</li>
                      <li>Analytics and insights</li>
                      <li>Customer messages</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Usage Information</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Log data and IP addresses</li>
                      <li>Device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and actions taken</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
                <p className="mb-4">We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain the Service</li>
                  <li>Manage your Google My Business accounts</li>
                  <li>Generate AI-powered content and insights</li>
                  <li>Send you notifications and updates</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations</li>
                  <li>Detect and prevent fraud and abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing and Disclosure</h2>
                <p className="mb-4">We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Google:</strong> To access and manage your Google My Business accounts</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in providing our services</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <Lock className="w-6 h-6" />
                  <span>Data Security</span>
                </h2>
                <p className="mb-4">We implement security measures to protect your information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data centers and backups</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Your Rights and Choices</h2>
                <p className="mb-4">You have the following rights regarding your personal information:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Access</h4>
                    <p className="text-sm">Request access to your personal data</p>
                  </div>
                  <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Correction</h4>
                    <p className="text-sm">Request correction of inaccurate data</p>
                  </div>
                  <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Deletion</h4>
                    <p className="text-sm">Request deletion of your data</p>
                  </div>
                  <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Portability</h4>
                    <p className="text-sm">Request a copy of your data</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience. You can control cookie
                  preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Children's Privacy</h2>
                <p>
                  Our Service is not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your country of residence.
                  We ensure appropriate safeguards are in place for such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by
                  posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-white">Contact Us</p>
                        <p className="text-sm">Email: contact@nnh.ae</p>
                        <p className="text-sm">Phone: +971 54 366 5548</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-white">Office Address</p>
                        <p className="text-sm">Dubai, United Arab Emirates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Privacy;
