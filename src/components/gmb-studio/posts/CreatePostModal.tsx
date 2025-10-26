import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAI } from '../../../hooks/useAI';
import ImageUpload from '../../shared/ImageUpload';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: {
    post_type: string;
    content: string;
    media_urls?: string[];
    scheduled_date?: string;
  }) => Promise<void>;
  businessName: string;
  locationId?: string;
}

function CreatePostModal({ isOpen, onClose, onSubmit, businessName, locationId }: CreatePostModalProps) {
  const [postType, setPostType] = useState<'photo' | 'event' | 'offer' | 'update'>('photo');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { generatePost, loading: aiLoading } = useAI();

  const handleGenerateAI = async () => {
    const generatedContent = await generatePost(businessName, postType, topic || undefined);
    if (generatedContent) {
      setContent(generatedContent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        post_type: postType,
        content: content.trim(),
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        scheduled_date: scheduledDate || undefined
      });
      setContent('');
      setTopic('');
      setScheduledDate('');
      setMediaUrls([]);
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = (url: string) => {
    setMediaUrls([...mediaUrls, url]);
  };

  const postTypes = [
    { value: 'photo', label: 'Photo Post', emoji: '📸' },
    { value: 'event', label: 'Event', emoji: '📅' },
    { value: 'offer', label: 'Offer', emoji: '🎁' },
    { value: 'update', label: 'Update', emoji: '📢' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black border border-orange-500 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-black border-b border-neon-orange p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Create New Post</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Post Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {postTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setPostType(type.value as any)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          postType === type.value
                            ? 'border-white bg-gray-800'
                            : 'border-orange-500 hover:border-white/40'
                        }`}
                      >
                        <div className="text-3xl mb-2">{type.emoji}</div>
                        <div className="text-sm font-medium text-white">
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Topic (Optional - helps AI generate better content)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., New menu item, Holiday hours, Customer appreciation"
                    className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white placeholder:text-white focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-white">
                      Post Content
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={aiLoading}
                      className="px-4 py-2 bg-orange-500 text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      {aiLoading ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content here or use AI to generate..."
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white placeholder:text-white focus:outline-none focus:border-white/40 transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-white">
                      {content.length} / 1500 characters
                    </span>
                  </div>
                </div>

                {locationId && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Add Image
                    </label>
                    <ImageUpload
                      locationId={locationId}
                      category="product"
                      onUploadComplete={handleUploadComplete}
                      className="mb-2"
                    />
                    {mediaUrls.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {mediaUrls.map((url, index) => (
                          <div key={index} className="relative w-20 h-20">
                            <img
                              src={url}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Schedule Post (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full pl-10 pr-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-white mt-2">
                    Leave empty to publish immediately
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black rounded-lg font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        {scheduledDate ? 'Schedule Post' : 'Publish Now'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreatePostModal;
