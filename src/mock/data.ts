export const mockStats = {
  totalViews: 15428,
  totalSearches: 8934,
  totalCalls: 456,
  totalMessages: 234
};

export const mockAccounts = [
  {
    id: '1',
    name: 'Main Business Account',
    email: 'business@company.com',
    status: 'connected',
    locations: 5,
    lastSync: '2024-01-15 10:30 AM'
  },
  {
    id: '2',
    name: 'Secondary Account',
    email: 'secondary@company.com',
    status: 'connected',
    locations: 3,
    lastSync: '2024-01-15 09:45 AM'
  }
];

export const mockLocations = [
  {
    id: '1',
    name: 'Downtown Store',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567',
    status: 'verified',
    rating: 4.5,
    reviews: 127,
    category: 'Retail Store'
  },
  {
    id: '2',
    name: 'Mall Location',
    address: '456 Mall Ave, City, State 12345',
    phone: '(555) 987-6543',
    status: 'verified',
    rating: 4.2,
    reviews: 89,
    category: 'Retail Store'
  },
  {
    id: '3',
    name: 'Airport Branch',
    address: '789 Airport Blvd, City, State 12345',
    phone: '(555) 456-7890',
    status: 'pending',
    rating: 4.8,
    reviews: 203,
    category: 'Service Center'
  }
];

export const mockPosts = [
  {
    id: '1',
    type: 'photo',
    caption: 'New winter collection now available! Visit our store today.',
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Downtown Store',
    date: '2024-01-14',
    engagement: { likes: 23, comments: 5, shares: 2 }
  },
  {
    id: '2',
    type: 'event',
    caption: 'Grand opening celebration this Saturday! Join us for special offers.',
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Mall Location',
    date: '2024-01-13',
    engagement: { likes: 45, comments: 12, shares: 8 }
  },
  {
    id: '3',
    type: 'offer',
    caption: '20% off all items this week! Limited time offer.',
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Airport Branch',
    date: '2024-01-12',
    engagement: { likes: 67, comments: 18, shares: 15 }
  }
];

export const mockReviews = [
  {
    id: '1',
    author: 'Sarah Johnson',
    rating: 5,
    text: 'Excellent service and great products! The staff was very helpful and knowledgeable.',
    date: '2024-01-14',
    location: 'Downtown Store'
  },
  {
    id: '2',
    author: 'Mike Chen',
    rating: 4,
    text: 'Good experience overall. Quick service and clean environment.',
    date: '2024-01-13',
    location: 'Mall Location'
  },
  {
    id: '3',
    author: 'Emily Davis',
    rating: 5,
    text: 'Amazing customer service! They went above and beyond to help me.',
    date: '2024-01-12',
    location: 'Downtown Store'
  },
  {
    id: '4',
    author: 'Robert Wilson',
    rating: 3,
    text: 'Average experience. The wait time was longer than expected.',
    date: '2024-01-11',
    location: 'Airport Branch'
  }
];

export const mockInsightsData = [
  { name: 'Mon', views: 2400, searches: 1300, calls: 45 },
  { name: 'Tue', views: 1398, searches: 980, calls: 32 },
  { name: 'Wed', views: 9800, searches: 2100, calls: 67 },
  { name: 'Thu', views: 3908, searches: 1500, calls: 54 },
  { name: 'Fri', views: 4800, searches: 1800, calls: 78 },
  { name: 'Sat', views: 3800, searches: 1600, calls: 43 },
  { name: 'Sun', views: 4300, searches: 1400, calls: 39 }
];