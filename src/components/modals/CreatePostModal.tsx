import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Image, Calendar, MapPin, Send } from 'lucide-react';
import Modal from './Modal';
import { usePosts } from '../../hooks/usePosts';
import { useLocations } from '../../hooks/useLocations';
import { useToast } from '../../contexts/ToastContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCaption?: string;
}

export default function CreatePostModal({ isOpen, onClose, initialCaption }: CreatePostModalProps) {
  const { createPost, uploadPostImage } = usePosts();
  const { locations } = useLocations();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    location_id: string;
    post_type: 'photo' | 'event' | 'offer' | 'update';
    caption: string;
    title?: string;
    description?: string;
    status: 'draft' | 'published';
  }>({
    location_id: '',
    post_type: 'photo' as 'photo' | 'event' | 'offer' | 'update',
    caption: '',
    title: '',
    description: '',
    status: 'published' as 'draft' | 'published',
  });
  const [aiLoading, setAiLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Prefill caption from AI draft when modal opens
  useEffect(() => {
    if (isOpen && initialCaption && formData.caption === '') {
      setFormData((prev) => ({ ...prev, caption: initialCaption }));
    }
  }, [isOpen, initialCaption]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.location_id) {
      toast.error('Please select a location');
      return;
    }

    if (!formData.caption.trim()) {
      toast.error('Please enter a caption');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadPostImage(imageFile);
      }

      const finalCaption = `${formData.title ? formData.title + '\n\n' : ''}${formData.caption}${formData.description ? '\n\n' + formData.description : ''}`;

      await createPost({
        location_id: formData.location_id,
        post_type: formData.post_type,
        caption: finalCaption,
        image_url: imageUrl || undefined,
        status: formData.status,
      });

      toast.success('Post created successfully!');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      location_id: '',
      post_type: 'photo',
      caption: '',
      title: '',
      description: '',
      status: 'published',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Post">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Select Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <select
              value={formData.location_id}
              onChange={(e) =>
                setFormData({ ...formData, location_id: e.target.value })
              }
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-white/20 transition-colors"
            >
              <option value="">Choose a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.location_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Post Type
          </label>
          <div className="grid grid-cols-4 gap-3">
            {(['photo', 'event', 'offer', 'update'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, post_type: type })}
                className={`py-2 px-4 rounded-lg text-sm font-medium capitalize transition-colors ${
                  formData.post_type === type
                    ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Upload Image
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="post-image"
            />
            <label
              htmlFor="post-image"
              className="flex items-center justify-center w-full h-48 bg-white/5 border-2 border-dashed border-white/15 rounded-lg cursor-pointer hover:border-white/25 transition-colors"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Image className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-sm text-white">Click to upload image</p>
                  <p className="text-xs text-white mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Caption
          </label>
          <textarea
            value={formData.caption}
            onChange={(e) =>
              setFormData({ ...formData, caption: e.target.value })
            }
            required
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-white/60 focus:outline-none focus:border-white/20 transition-colors resize-none"
            placeholder="Write your post caption..."
          />

          {/* AI Assist */}
          <div className="mt-3 flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              disabled={aiLoading}
              onClick={async () => {
                setAiLoading(true);
                await new Promise((r) => setTimeout(r, 800));
                const ideas = [
                  'Exciting updates from our team this week! 🎉',
                  'Discover our latest offer designed just for you ✨',
                  'Here’s how we help customers every day ❤️'
                ];
                setFormData((prev) => ({ ...prev, caption: ideas[Math.floor(Math.random()*ideas.length)] }));
                setAiLoading(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {aiLoading ? 'Thinking…' : 'Generate Caption'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => {
                const tags = ['#LocalBusiness', '#Dubai', '#SpecialOffer', '#GMB', '#NNH'];
                setFormData((prev) => ({ ...prev, caption: prev.caption ? prev.caption + '\n\n' + tags.join(' ') : tags.join(' ') }));
              }}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm"
            >
              Add Hashtags
            </motion.button>
          </div>
        </div>

        {(formData.post_type === 'event' || formData.post_type === 'offer') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Title (optional)</label>
              <div className="flex items-center gap-2">
                <input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/60"
                  placeholder="Add a concise title"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  disabled={aiLoading}
                  onClick={async () => {
                    setAiLoading(true);
                    await new Promise((r) => setTimeout(r, 600));
                    const ideas = ['Limited-time Offer', 'This Week\'s Event', 'Don\'t Miss Out'];
                    setFormData((prev) => ({ ...prev, title: ideas[Math.floor(Math.random()*ideas.length)] }));
                    setAiLoading(false);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {aiLoading ? 'Thinking…' : 'Generate'}
                </motion.button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Description (optional)</label>
              <div className="flex items-center gap-2">
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/60 resize-none"
                  placeholder="Add more details"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  disabled={aiLoading}
                  onClick={async () => {
                    setAiLoading(true);
                    await new Promise((r) => setTimeout(r, 700));
                    const ideas = [
                      'Join us for exclusive savings and a delightful experience.',
                      'Discover special benefits available for a limited time only.',
                      'Be part of our upcoming event packed with great moments.'
                    ];
                    setFormData((prev) => ({ ...prev, description: ideas[Math.floor(Math.random()*ideas.length)] }));
                    setAiLoading(false);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm disabled:opacity-50 h-fit"
                >
                  {aiLoading ? 'Thinking…' : 'Generate'}
                </motion.button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['draft', 'published'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData({ ...formData, status })}
                className={`py-2 px-4 rounded-lg text-sm font-medium capitalize transition-colors ${
                  formData.status === status
                    ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Scheduling removed for now */}

        <div className="flex justify-end space-x-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Create Post'}</span>
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
