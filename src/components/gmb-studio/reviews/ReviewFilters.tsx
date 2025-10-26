import { Search, Star } from 'lucide-react';

interface ReviewFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRating: string;
  onRatingChange: (rating: string) => void;
  replyStatus: string;
  onReplyStatusChange: (status: string) => void;
}

function ReviewFilters({
  searchTerm,
  onSearchChange,
  selectedRating,
  onRatingChange,
  replyStatus,
  onReplyStatusChange
}: ReviewFiltersProps) {
  const ratings = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  const replyStatuses = [
    { value: 'all', label: 'All' },
    { value: 'replied', label: 'Replied' },
    { value: 'pending', label: 'Pending Reply' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search reviews..."
          className="w-full pl-10 pr-4 py-3 bg-black border border-orange-500 rounded-lg text-white placeholder:text-white focus:outline-none focus:border-white/40 transition-colors"
        />
      </div>

      <select
        value={selectedRating}
        onChange={(e) => onRatingChange(e.target.value)}
        className="px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
      >
        {ratings.map((rating) => (
          <option key={rating.value} value={rating.value}>
            {rating.label}
          </option>
        ))}
      </select>

      <select
        value={replyStatus}
        onChange={(e) => onReplyStatusChange(e.target.value)}
        className="px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
      >
        {replyStatuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ReviewFilters;
