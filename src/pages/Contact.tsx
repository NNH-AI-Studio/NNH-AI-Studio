import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'contact@nnh.ae',
      description: 'Send us an email anytime',
      link: 'mailto:contact@nnh.ae'
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+971 54 366 5548',
      description: 'Mon-Fri from 9am to 6pm',
      link: 'tel:+971543665548'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'Dubai, UAE',
      description: 'Our office in the heart of Dubai',
      link: null
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
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
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
              <p className="text-xl text-white max-w-2xl mx-auto">
                Have a question or want to learn more? We'd love to hear from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                const content = (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6 text-center ${
                      info.link ? 'hover:border-neon-orange shadow-neon-orange cursor-pointer' : ''
                    } transition-all`}
                  >
                    <Icon className="w-12 h-12 text-white mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
                    <p className="text-white font-medium mb-2">{info.value}</p>
                    <p className="text-sm text-white">{info.description}</p>
                  </motion.div>
                );

                return info.link ? (
                  <a key={index} href={info.link}>
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-white">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg px-4 py-3 text-white placeholder:text-white focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg px-4 py-3 text-white placeholder:text-white focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="sales">Sales Question</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg px-4 py-3 text-white placeholder:text-white focus:outline-none focus:border-white/40 transition-colors resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-6">Frequently Asked</h2>
                  <div className="space-y-4">
                    <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <MessageSquare className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-2">How quickly can I get started?</h3>
                          <p className="text-sm text-white">
                            You can start using NNH Local immediately after signing up. Connect your Google My Business
                            account and you're ready to go!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <Clock className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-2">What's your response time?</h3>
                          <p className="text-sm text-white">
                            We typically respond to all inquiries within 24 hours during business days. For urgent
                            matters, please call us directly.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-2">Do you offer onboarding support?</h3>
                          <p className="text-sm text-white">
                            Yes! We provide personalized onboarding sessions to help you get the most out of NNH Local
                            from day one.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white">Monday - Friday</span>
                      <span className="text-white font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">Saturday</span>
                      <span className="text-white font-medium">10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">Sunday</span>
                      <span className="text-white font-medium">Closed</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neon-orange shadow-neon-orange">
                      <p className="text-white text-xs">
                        All times are in Gulf Standard Time (GST)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Contact;
