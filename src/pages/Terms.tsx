import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function Terms() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-white text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-8 text-white/80">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using NNH Local GMB Platform ("the Service"), you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                <p className="mb-4">
                  NNH Local provides a comprehensive platform for managing Google My Business accounts, reviews, posts, and analytics.
                  The Service includes but is not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Google My Business account management</li>
                  <li>Review monitoring and response automation</li>
                  <li>Post creation and scheduling</li>
                  <li>Analytics and insights</li>
                  <li>AI-powered content generation</li>
                  <li>Citation management</li>
                  <li>Ranking tracking</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
                <p className="mb-4">
                  To access certain features of the Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Google API Services</h2>
                <p className="mb-4">
                  Our Service integrates with Google API Services. By using our Service, you also agree to comply with:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Google API Services Terms of Service</li>
                  <li>Google My Business API Terms</li>
                  <li>Google Privacy Policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
                <p className="mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Create fake reviews or manipulate ratings</li>
                  <li>Spam or send unsolicited messages</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Data and Privacy</h2>
                <p>
                  Your use of the Service is also governed by our Privacy Policy. We collect, use, and protect your data as
                  described in our Privacy Policy. By using the Service, you consent to such processing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
                <p>
                  The Service and its original content, features, and functionality are owned by NNH Local and are protected by
                  international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Termination</h2>
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability,
                  for any reason, including breach of these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimer of Warranties</h2>
                <p>
                  The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.
                  We do not warrant that the Service will be uninterrupted, secure, or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
                <p>
                  In no event shall NNH Local be liable for any indirect, incidental, special, consequential, or punitive damages
                  resulting from your use of or inability to use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes
                  by posting the new Terms of Service on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-nnh-orange/5 rounded-lg border border-neon-orange shadow-neon-orange">
                  <p className="font-medium">Email: contact@nnh.ae</p>
                  <p className="font-medium">Phone: +971 54 366 5548</p>
                  <p className="font-medium">Address: Dubai, United Arab Emirates</p>
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

export default Terms;
