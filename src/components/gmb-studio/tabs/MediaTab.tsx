import { useState, useMemo } from 'react';
import { Upload, Image as ImageIcon, Video, Grid, List } from 'lucide-react';
import { useMedia } from '../../../hooks/useMedia';
import { supabase } from '../../../lib/supabase';
import MediaGallery from '../media/MediaGallery';

interface MediaTabProps {
  selectedLocation: string;
}

function MediaTab({ selectedLocation }: MediaTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { media, loading, refetch } = useMedia(selectedLocation, selectedCategory);

  const stats = useMemo(() => {
    return {
      total: media.length,
      photos: media.filter((m) => m.media_type === 'photo').length,
      videos: media.filter((m) => m.media_type === 'video').length,
      interior: media.filter((m) => m.category === 'interior').length,
      exterior: media.filter((m) => m.category === 'exterior').length,
      team: media.filter((m) => m.category === 'team').length,
      products: media.filter((m) => m.category === 'products').length
    };
  }, [media]);

  const handleDelete = async (mediaId: string) => {
    const confirmed = confirm('Are you sure you want to delete this media?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('gmb_media')
      .delete()
      .eq('id', mediaId);

    if (!error) {
      refetch();
    }
  };

  const categories = [
    { value: 'all', label: 'All Media', count: stats.total },
    { value: 'interior', label: 'Interior', count: stats.interior },
    { value: 'exterior', label: 'Exterior', count: stats.exterior },
    { value: 'team', label: 'Team', count: stats.team },
    { value: 'products', label: 'Products', count: stats.products }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Gallery</h2>
          <p className="text-white mt-1">
            Manage photos and videos for your business listing
          </p>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black rounded-lg font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/20 transition-colors flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Media
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Grid className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-white">Total Files</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <ImageIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.photos}</div>
          <div className="text-sm text-white">Photos</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Video className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.videos}</div>
          <div className="text-sm text-white">Videos</div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedCategory === category.value
                ? 'bg-orange-500 text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {category.label}
            <span className="ml-2 text-sm opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      <div className="bg-black border border-neon-orange rounded-xl p-6">
        <div className="border-2 border-dashed border-orange-500 rounded-xl p-12 text-center hover:border-white/40 transition-colors cursor-pointer">
          <Upload className="w-16 h-16 text-white mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Drop files here or click to upload
          </h3>
          <p className="text-sm text-white mb-4">
            Support for JPEG, PNG, GIF, MP4, MOV (Max 10MB)
          </p>
          <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors">
            Select Files
          </button>
        </div>
      </div>

      <MediaGallery media={media} loading={loading} onDelete={handleDelete} />
    </div>
  );
}

export default MediaTab;
