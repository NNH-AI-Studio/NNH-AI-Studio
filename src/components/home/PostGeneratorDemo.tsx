import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Tag, Sparkles } from 'lucide-react';
import Button from '../shared/Button';
import Input from '../shared/Input';

const postTypes = [
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'offer', label: 'Offer', icon: Tag },
  { id: 'update', label: 'Update', icon: Sparkles }
];

const samplePosts = {
  event: {
    title: 'Grand Opening Celebration',
    content: 'Join us this Saturday for our Grand Opening Celebration! Enjoy live music, special discounts, and complimentary refreshments. We can\'t wait to welcome you to our new location and share this exciting milestone with our amazing community!'
  },
  offer: {
    title: '20% Off This Weekend',
    content: 'Special Weekend Offer! Get 20% off all services this Saturday and Sunday. Book your appointment now and treat yourself to the quality you deserve. Limited slots available, so don\'t miss out on this amazing deal!'
  },
  update: {
    title: 'New Spring Hours',
    content: 'We\'re excited to announce our new extended spring hours! Starting next week, we\'ll be open Monday through Saturday from 8 AM to 8 PM. These new hours give you more flexibility to visit us at your convenience. See you soon!'
  }
};

export default function PostGeneratorDemo() {
  const [selectedType, setSelectedType] = useState('event');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePost = async () => {
    setIsGenerating(true);
    setGeneratedPost('');

    await new Promise(resolve => setTimeout(resolve, 500));

    const post = samplePosts[selectedType as keyof typeof samplePosts];
    let currentText = '';
    const fullText = post.content;

    for (let i = 0; i < fullText.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 15));
      currentText += fullText[i];
      setGeneratedPost(currentText);
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {postTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id);
                setGeneratedPost('');
              }}
              className={`p-4 rounded-xl border transition-all ${
                selectedType === type.id
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-nnh-orange/5 border-neon-orange shadow-neon-orange text-white/60 hover:bg-nnh-orange/10'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <Input
          label="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={samplePosts[selectedType as keyof typeof samplePosts].title}
        />
        <Input
          label="Additional Details (Optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add any specific details you want to include..."
        />
      </div>

      <Button
        onClick={generatePost}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating Post...' : 'Generate Post with AI'}
      </Button>

      <AnimatePresence>
        {generatedPost && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="mb-4">
              <h4 className="font-semibold text-white mb-2">Generated Post Preview</h4>
              <div className="text-sm text-white/60">
                {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Post
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-neon-orange shadow-neon-orange">
              <h3 className="font-bold text-white text-lg mb-3">
                {samplePosts[selectedType as keyof typeof samplePosts].title}
              </h3>
              <p className="text-white/90 leading-relaxed">
                {generatedPost}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
