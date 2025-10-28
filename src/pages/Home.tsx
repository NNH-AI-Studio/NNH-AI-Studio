import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Star,
  MapPin,
  MessageCircle,
  Shield,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Users,
  FileText,
  Brain,
  XCircle,
  Zap,
  Target,
  Sparkles,
  Quote,
  ChevronDown
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import AIShowcase from '../components/home/AIShowcase';
import SEO from '../components/shared/SEO';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const oauthError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (oauthError) {
      if (oauthError === 'invalid_request' || oauthError === 'bad_oauth_state') {
        setError('OAuth session expired. Please try connecting your account again.');
        setTimeout(() => {
          navigate('/accounts', { replace: true });
        }, 3000);
      } else {
        setError(errorDescription ? decodeURIComponent(errorDescription) : 'Authentication failed');
      }
      setSearchParams({});
    }
  }, [searchParams, navigate, setSearchParams]);
  const features = [
    {
      icon: MapPin,
      title: 'Location Management',
      description: 'Control all your Google Business locations from one simple dashboard',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Brain,
      title: 'AI Autopilot',
      description: 'AI replies to reviews in 2 minutes. Creates 12 posts monthly. Sends weekly insights.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Star,
      title: 'Review Management',
      description: 'Never miss a review. AI responds instantly in your brand voice. Track sentiment trends.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Daily Analytics',
      description: 'See exactly what works. Track views, calls, and direction requests in real-time.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      title: 'Automatic Posting',
      description: 'AI creates 12 engaging posts every month. Auto-schedules for peak engagement.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Ranking Monitor',
      description: 'Check your Google rankings daily. Get alerts when competitors move up.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'Urban Cafe Chain',
      content: 'We manage 12 locations with zero stress. NNH Local saves us 20 hours every week. Reviews get answered instantly. Posts go live automatically.',
      rating: 5,
      initials: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Owner',
      company: 'Chen Dental Group',
      content: 'Our rankings jumped 40% in 3 months. We now appear in the top 3 for "dentist near me". More calls. More patients. Simple as that.',
      rating: 5,
      initials: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Digital Marketing Manager',
      company: 'FitLife Gyms',
      content: 'Every review gets a response in under 2 minutes. Our engagement tripled. Walk-ins doubled. This tool paid for itself in week one.',
      rating: 5,
      initials: 'ER'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connect Your Accounts',
      description: 'Link your Google My Business accounts in seconds with our secure OAuth integration',
      icon: Zap
    },
    {
      step: '02',
      title: 'Configure AI Autopilot',
      description: 'Set your preferences and let our AI learn your brand voice and style',
      icon: Brain
    },
    {
      step: '03',
      title: 'Watch It Work',
      description: 'Sit back while we automate reviews, posts, and provide actionable insights',
      icon: Sparkles
    },
    {
      step: '04',
      title: 'Dominate Local Search',
      description: 'Watch your rankings soar and your customer engagement multiply',
      icon: Target
    }
  ];

  const integrations = [
    { name: 'Google My Business', initials: 'GMB' },
    { name: 'OpenAI', initials: 'OAI' },
    { name: 'Anthropic', initials: 'ANT' },
    { name: 'Google AI', initials: 'GAI' },
    { name: 'Groq', initials: 'GRQ' },
    { name: 'Supabase', initials: 'SB' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const stats = [
    { value: '6,400+', label: 'Content Generated' },
    { value: '124+', label: 'Active Clients' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'Customer Rating' }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NNH Local',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'AI-powered Google My Business management platform for local businesses',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '49',
      highPrice: '129',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '124',
      bestRating: '5',
      worstRating: '1'
    },
    provider: {
      '@type': 'Organization',
      name: 'NNH Local',
      url: 'https://www.nnh.ae',
      logo: 'https://www.nnh.ae/nnh-logo.png'
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <SEO
        title="Control Your Local Search Rankings | NNH Local"
        description="AI-powered Google Business management. Automate reviews, create posts, track rankings. 124+ businesses trust us. Free 14-day trial. No credit card."
        keywords="google my business tool, local seo software, automated review responses, gmb management platform, local search rankings"
        canonical="/"
        structuredData={structuredData}
      />
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX }}
      />
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] max-w-md w-full mx-4"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-500 font-medium">{error}</p>
                <p className="text-sm text-red-500/70 mt-1">Redirecting to accounts...</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-orange-500"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Control Your Local Search Rankings
            </h1>
            <p className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-gradient">
              AI Does the Work. You Get Results.
            </p>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              Manage all your Google Business locations from one dashboard. Watch AI respond to reviews, create posts, and boost your rankings. Start seeing results in 24 hours.
            </p>
            <div className="flex items-center justify-center space-x-4 mb-12">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg font-semibold text-lg flex items-center space-x-2 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-nnh-orange/10 border border-neon-orange shadow-neon-orange rounded-lg font-semibold text-lg hover:bg-nnh-orange/20 transition-colors"
                >
                  GMB Dashboard
                </motion.button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center space-x-8 text-sm text-white"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-16"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center space-y-2 text-white"
              >
                <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <AnimatedCounter
                  value={stat.value}
                  className="text-4xl font-bold text-white mb-2"
                />
                <div className="text-white">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-nnh-orange/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Get More Customers. Automatically.
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Our platform handles the boring stuff so you can focus on running your business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, rotateY: 5 }}
                className="bg-black border border-neon-orange shadow-neon-orange rounded-xl p-6 hover:border-neon-orange shadow-neon-orange transition-all relative group overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <feature.icon className={`w-12 h-12 mb-4 bg-gradient-to-br ${feature.color} text-transparent bg-clip-text`} style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }} />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase Section */}
      <AIShowcase />

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start in 5 Minutes
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Connect your accounts. Turn on AI. Watch it work.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 -translate-y-1/2 z-0" />

            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative z-10"
                >
                  <div className="bg-black border border-neon-orange shadow-neon-orange rounded-2xl p-6 hover:border-neon-orange shadow-neon-orange transition-all">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-5xl font-bold text-white/10 mb-2 text-center">{step.step}</div>
                    <h3 className="text-xl font-semibold mb-3 text-center">{step.title}</h3>
                    <p className="text-white text-sm text-center">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-nnh-orange/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Businesses Worldwide
            </h2>
            <p className="text-xl text-white">
              See what our customers are saying about NNH Local
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-black border border-neon-orange shadow-neon-orange rounded-3xl p-12"
              >
                <Quote className="w-12 h-12 text-white/20 mb-6" />
                <p className="text-2xl text-white/90 mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                      {testimonials[currentTestimonial].initials}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{testimonials[currentTestimonial].name}</div>
                      <div className="text-white text-sm">{testimonials[currentTestimonial].role}</div>
                      <div className="text-white/50 text-sm">{testimonials[currentTestimonial].company}</div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-orange-500" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial
                      ? 'bg-white w-8'
                      : 'bg-white/30 hover:bg-nnh-orange/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Autopilot Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 bg-nnh-orange/10 px-4 py-2 rounded-full mb-6">
                <Brain className="w-5 h-5 text-white" />
                <span className="text-sm font-medium">AI-Powered Automation</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                30-Day AI Autopilot
              </h2>
              <p className="text-xl text-white mb-8">
                AI handles everything while you run your business. Get instant review responses. Fresh posts every week. Competitor alerts. Weekly reports in your inbox.
              </p>
              <ul className="space-y-4">
                {[
                  'AI responds to every review in under 2 minutes',
                  'Creates and publishes 3 posts weekly',
                  'Monitors 5 competitors and sends alerts',
                  'Delivers performance reports every Monday',
                  'Tracks rankings for 10+ keywords daily'
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-neon-orange shadow-neon-orange rounded-2xl p-8 shadow-2xl"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg hover:border-green-500/40 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    >
                      <MessageCircle className="w-8 h-8 text-orange-500" />
                    </motion.div>
                    <div>
                      <div className="font-medium">Auto Reply</div>
                      <div className="text-sm text-white">14 reviews today</div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="px-3 py-1 bg-green-500/20 text-orange-500 rounded-full text-sm font-semibold"
                  >
                    Active
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 1.5 }}
                    >
                      <FileText className="w-8 h-8 text-orange-500" />
                    </motion.div>
                    <div>
                      <div className="font-medium">Smart Posting</div>
                      <div className="text-sm text-white">3 posts this week</div>
                      <div className="w-32 h-1.5 bg-nnh-orange/10 rounded-full mt-1 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: '0%' }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 2, delay: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    className="px-3 py-1 bg-blue-500/20 text-orange-500 rounded-full text-sm font-semibold"
                  >
                    Active
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: 2 }}
                    >
                      <Users className="w-8 h-8 text-orange-500" />
                    </motion.div>
                    <div>
                      <div className="font-medium">Competitor Watch</div>
                      <div className="text-sm text-white">5 competitors tracked</div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                    className="px-3 py-1 bg-purple-500/20 text-orange-500 rounded-full text-sm font-semibold"
                  >
                    Active
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    >
                      <BarChart3 className="w-8 h-8 text-orange-400" />
                    </motion.div>
                    <div>
                      <div className="font-medium">Insights Reports</div>
                      <div className="text-sm text-white">Weekly delivery</div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 1.5 }}
                    className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-semibold"
                  >
                    Active
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integration Partners Section */}
      <section className="py-20 px-6 bg-nnh-orange/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Industry Leaders
            </h2>
            <p className="text-lg text-white">
              Seamlessly integrated with the best tools and platforms
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 md:grid-cols-6 gap-8"
          >
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex flex-col items-center justify-center p-6 bg-black border border-neon-orange shadow-neon-orange rounded-xl hover:border-neon-orange shadow-neon-orange transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-xl font-bold text-white mb-3">
                  {integration.initials}
                </div>
                <div className="text-sm text-white text-center">{integration.name}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-neon-orange shadow-neon-orange rounded-3xl p-12 shadow-2xl">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Get More Customers?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join 124+ businesses using NNH Local. Start your free 14-day trial today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg font-semibold text-lg inline-flex items-center space-x-2 shadow-xl"
                >
                  <span>Start Your Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-nnh-orange/10 backdrop-blur-sm border border-neon-orange shadow-neon-orange text-white rounded-lg font-semibold text-lg hover:bg-nnh-orange/20 transition-all"
                >
                  View Pricing
                </motion.button>
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-white">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Live counter simulation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 pt-8 border-t border-neon-orange shadow-neon-orange"
            >
              <p className="text-sm text-white/50">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"
                />
                <span className="text-orange-500 font-semibold">23 businesses</span> signed up in the last 24 hours
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
