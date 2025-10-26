import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Copy, CheckCircle } from 'lucide-react';
import Button from '../shared/Button';

const sampleReviews = [
  {
    id: 1,
    author: 'Sarah M.',
    rating: 5,
    text: 'Amazing service! The staff was incredibly friendly and helpful. Will definitely come back!',
    response: 'Thank you so much for your wonderful review, Sarah! We\'re thrilled to hear that our team provided you with excellent service. Your satisfaction means everything to us, and we can\'t wait to welcome you back soon!'
  },
  {
    id: 2,
    author: 'John D.',
    rating: 4,
    text: 'Great experience overall. The wait time was a bit long but the quality made up for it.',
    response: 'Hi John, thank you for taking the time to share your feedback! We\'re glad you enjoyed the quality of our service. We appreciate your patience regarding the wait time and are actively working to improve our efficiency. We hope to serve you again soon!'
  },
  {
    id: 3,
    author: 'Emily R.',
    rating: 5,
    text: 'Best in town! Clean, professional, and exactly what I was looking for.',
    response: 'Emily, we\'re so grateful for your 5-star review! It\'s wonderful to hear that we met your expectations with our cleanliness and professionalism. Thank you for choosing us, and we look forward to seeing you again!'
  }
];

export default function ReviewReplyDemo() {
  const [currentReview, setCurrentReview] = useState(0);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const review = sampleReviews[currentReview];

  const generateResponse = async () => {
    setIsGenerating(true);
    setGeneratedResponse('');
    setCopied(false);

    const response = review.response;
    let currentText = '';

    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      currentText += response[i];
      setGeneratedResponse(currentText);
    }

    setIsGenerating(false);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(generatedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6">
        {sampleReviews.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentReview(index);
              setGeneratedResponse('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentReview === index
                ? 'bg-blue-500 text-white'
                : 'bg-nnh-orange/5 text-white/60 hover:bg-nnh-orange/10'
            }`}
          >
            Review {index + 1}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentReview}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {review.author[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{review.author}</h3>
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-white/70">{review.text}</p>
            </div>
          </div>

          <Button
            onClick={generateResponse}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating AI Response...' : 'Generate AI Response'}
          </Button>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {generatedResponse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-white">AI Generated Response</h4>
              <button
                onClick={copyResponse}
                className="flex items-center gap-2 px-3 py-1.5 bg-nnh-orange/10 hover:bg-nnh-orange/20 rounded-lg text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-white/90 leading-relaxed">
              {generatedResponse}
              {isGenerating && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block ml-1"
                >
                  |
                </motion.span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
