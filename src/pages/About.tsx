import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Zap, Award, Globe, TrendingUp, Heart, Shield } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SEO from '../components/shared/SEO';

function About() {
  const values = [
    {
      icon: Target,
      title: 'Results First',
      description: 'We measure success by your results. More calls. More customers. More revenue.'
    },
    {
      icon: Users,
      title: 'You Win, We Win',
      description: 'Your growth is our success. We build tools that deliver real value every day.'
    },
    {
      icon: Zap,
      title: 'Always Improving',
      description: 'New features every month. Faster AI. Better results. We never stop building.'
    },
    {
      icon: Shield,
      title: 'Your Data is Safe',
      description: 'Bank-level encryption. Regular security audits. Your information stays private.'
    }
  ];

  const team = [
    {
      name: 'Ahmed Al-Mansouri',
      role: 'Founder & CEO',
      description: '10 years in local SEO. Built NNH Local after seeing agencies overcharge small businesses.'
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of AI',
      description: 'Makes AI simple. Trains our models to write like humans, not robots.'
    },
    {
      name: 'Mohammed Hassan',
      role: 'Lead Developer',
      description: 'Builds fast, reliable systems. Obsessed with 99.9% uptime.'
    }
  ];

  const stats = [
    { value: '124+', label: 'Active Clients' },
    { value: '6,400+', label: 'Content Generated' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'Customer Rating' }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NNH Local',
    url: 'https://www.nnh.ae',
    logo: 'https://www.nnh.ae/nnh-logo.png',
    foundingDate: '2023',
    foundingLocation: 'Dubai, UAE',
    description: 'AI-powered local SEO automation platform for businesses'
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <SEO
        title="About Us - Building Better Local SEO Tools"
        description="Started in Dubai 2023. We help businesses grow with AI-powered Google My Business management. Simple tools. Real results."
        keywords="local seo company, google business management, ai automation dubai"
        canonical="/about"
        structuredData={structuredData}
      />
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
            className="space-y-16"
          >
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-bold mb-6"
              >
                About NNH Local
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white leading-relaxed"
              >
                Every business deserves powerful SEO tools. We built them. You use them. Your customers find you. It's that simple.
              </motion.p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Story Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-white/80">
                  <p>
                    We started in Dubai in 2023. We saw a problem everywhere.
                  </p>
                  <p>
                    Small businesses couldn't keep up with Google My Business. Reviews piled up. Posts got forgotten. Rankings dropped.
                  </p>
                  <p>
                    Meanwhile, agencies charged thousands for basic tasks. Tasks that AI could do in seconds.
                  </p>
                  <p>
                    We built NNH Local to fix this. Now business owners focus on their business. AI handles their Google presence.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-2xl p-8"
              >
                <Globe className="w-16 h-16 text-white mb-6" />
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-white/80">
                  Help one million businesses grow their local presence. Make powerful SEO tools accessible to everyone. Build trust through results, not promises.
                </p>
              </motion.div>
            </div>

            {/* Values */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Core Values</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6 hover:border-neon-orange shadow-neon-orange transition-all"
                    >
                      <Icon className="w-12 h-12 text-white mb-4" />
                      <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                      <p className="text-white text-sm">{value.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Team */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Meet Our Team</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {team.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6 text-center"
                  >
                    <div className="w-24 h-24 bg-nnh-orange/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-white text-sm mb-3">{member.role}</p>
                    <p className="text-white text-sm">{member.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Technology */}
            <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-2xl p-8 md:p-12">
              <div className="flex items-center justify-center mb-6">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Multiple AI Models Working for You</h2>
              <p className="text-white/80 text-center max-w-3xl mx-auto mb-8">
                We use AI from OpenAI, Anthropic, and Google. If one goes down, another takes over. You get 99.9% uptime. Your customers get responses that sound human, not robotic.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Award className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Multi-Model AI</h4>
                  <p className="text-sm text-white">Fallback system ensures 99.9% uptime</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Smart Learning</h4>
                  <p className="text-sm text-white">AI adapts to your brand voice over time</p>
                </div>
                <div className="text-center">
                  <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Human Touch</h4>
                  <p className="text-sm text-white">Responses that feel authentic and caring</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Grow Your Business?</h2>
                <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
                  One location or fifty. New business or established brand. We help you get more customers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg font-semibold text-lg hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors"
                    >
                      Start Free Trial
                    </motion.button>
                  </Link>
                  <Link to="/contact">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-nnh-orange/10 border border-neon-orange shadow-neon-orange rounded-lg font-semibold text-lg hover:bg-nnh-orange/20 transition-colors"
                    >
                      Contact Us
                    </motion.button>
                  </Link>
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

export default About;
