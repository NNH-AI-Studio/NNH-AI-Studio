import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap, Star, Crown, HelpCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SEO from '../components/shared/SEO';

function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      description: 'Perfect for your first 3 locations',
      monthlyPrice: 49,
      annualPrice: 470,
      features: [
        'Manage 3 locations',
        'AI creates 100 posts monthly',
        'Get alerts for new reviews',
        'See daily analytics reports',
        'Email support in 24 hours',
        'Connect Google Business in 1 click'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      icon: Star,
      description: 'Best for businesses with 4-10 locations',
      monthlyPrice: 129,
      annualPrice: 1240,
      features: [
        'Manage 10 locations',
        'Unlimited AI posts and content',
        'AI responds to every review in 2 min',
        'Get daily performance reports',
        'We list you on 50+ directories',
        'Track rankings for 20 keywords',
        'Priority support in 4 hours',
        'Add your logo and colors'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      icon: Crown,
      description: 'Custom plan for 10+ locations',
      monthlyPrice: null,
      annualPrice: null,
      features: [
        'Unlimited locations',
        'Unlimited AI content creation',
        'Remove all NNH branding',
        'Add unlimited team members',
        'Full API access included',
        'We build custom integrations',
        'Your own account manager',
        '99.9% uptime guarantee',
        'Phone support 24/7/365'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const faqs = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes. Upgrade anytime and get instant access. Downgrade at your next billing date. Cancel anytime with one click.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Visa, Mastercard, and American Express. Some regions support local payment methods too.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes. Try any plan free for 14 days. No credit card needed. Cancel anytime.'
    },
    {
      question: 'What happens when I exceed my limits?',
      answer: 'We notify you at 80% of your limit. Then you choose: upgrade your plan, buy extra credits, or wait until next month. You stay in control.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes. Not happy? Get 100% of your money back within 30 days. No questions asked.'
    },
    {
      question: 'Can I get a custom plan?',
      answer: 'Yes. Need something different? Talk to our sales team. We build custom plans for unique needs.'
    }
  ];

  const addOns = [
    {
      name: 'Additional Locations',
      price: 15,
      unit: 'per location/month',
      description: 'Add more business locations to your account'
    },
    {
      name: 'Extra AI Credits',
      price: 29,
      unit: 'per 100 credits',
      description: 'Additional AI-generated content credits'
    },
    {
      name: 'Premium Support',
      price: 99,
      unit: 'per month',
      description: '24/7 priority support with 1-hour response time'
    }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'NNH Local',
    description: 'AI-powered Google My Business management platform',
    brand: {
      '@type': 'Brand',
      name: 'NNH Local'
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter Plan',
        price: '49',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Professional Plan',
        price: '129',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <SEO
        title="Simple Pricing - Plans for Every Business"
        description="Start at $49/month. Manage 3-10 locations. AI automation included. Try free for 14 days. No credit card needed. Cancel anytime."
        keywords="google business management pricing, local seo cost, gmb tool price, review automation pricing"
        canonical="/pricing"
        structuredData={structuredData}
      />
      <Header />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
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
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple Pricing. No Surprises.</h1>
              <p className="text-xl text-white max-w-2xl mx-auto mb-8">
                Pick your plan. Try free for 14 days. Cancel anytime.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                      : 'text-white hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingCycle === 'annual'
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                      : 'text-white hover:text-white'
                  }`}
                >
                  Annual
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
                const monthlyEquivalent = billingCycle === 'annual' && plan.annualPrice
                  ? Math.floor(plan.annualPrice / 12)
                  : null;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-nnh-orange/5 border rounded-2xl p-8 ${
                      plan.popular
                        ? 'border-white ring-2 ring-white/20'
                        : 'border-neon-orange shadow-neon-orange'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <Icon className="w-12 h-12 text-white mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-white text-sm mb-6">{plan.description}</p>

                    <div className="mb-6">
                      {price ? (
                        <>
                          <div className="flex items-baseline">
                            <span className="text-4xl font-bold">${price}</span>
                            <span className="text-white ml-2">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                          </div>
                          {monthlyEquivalent && (
                            <p className="text-sm text-white mt-1">
                              ${monthlyEquivalent}/mo when billed annually
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-3xl font-bold">Custom</div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to={plan.cta === 'Contact Sales' ? '/contact' : '/register'}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                          plan.popular
                            ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600'
                            : 'bg-nnh-orange/10 text-white border border-neon-orange shadow-neon-orange hover:bg-nnh-orange/20'
                        }`}
                      >
                        {plan.cta}
                      </motion.button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Add-ons */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-8">Add-ons & Extras</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {addOns.map((addon, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6"
                  >
                    <h3 className="text-xl font-semibold mb-2">{addon.name}</h3>
                    <div className="text-2xl font-bold mb-2">
                      ${addon.price}
                      <span className="text-sm text-white font-normal ml-2">{addon.unit}</span>
                    </div>
                    <p className="text-sm text-white">{addon.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6"
                  >
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-sm text-white">{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-2xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get More Customers?</h2>
              <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
                Join 124+ businesses using NNH Local. Start free today. See results in 24 hours.
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
                    Talk to Sales
                  </motion.button>
                </Link>
              </div>
              <p className="text-sm text-white mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Pricing;
