export const testData = {
  accounts: {
    valid: {
      accountName: 'Test Business Account',
      accountEmail: 'test.business@example.com',
      platform: 'google' as const,
    },
  },
  locations: {
    valid: {
      locationName: 'Test Coffee Shop',
      address: '123 Main St, New York, NY 10001',
      phone: '+1234567890',
      website: 'https://testcoffeeshop.com',
      category: 'Coffee Shop',
      description: 'A cozy coffee shop in downtown',
    },
  },
  posts: {
    valid: {
      title: 'Summer Special Offer',
      content: 'Get 20% off on all cold beverages this summer! Visit us today and enjoy our refreshing drinks.',
      type: 'OFFER' as const,
    },
    announcement: {
      title: 'New Hours Announcement',
      content: 'We are now open 7 days a week from 7 AM to 9 PM. Come visit us!',
      type: 'UPDATE' as const,
    },
  },
  reviews: {
    positive: {
      rating: 5,
      reviewerName: 'Happy Customer',
      comment: 'Excellent service and great coffee! Highly recommend this place.',
    },
    negative: {
      rating: 2,
      reviewerName: 'Disappointed Customer',
      comment: 'Long wait times and cold coffee. Not what I expected.',
    },
  },
  aiSettings: {
    brandVoice: {
      tone: 'professional',
      style: 'friendly',
      keywords: ['quality', 'customer service', 'excellence'],
    },
    autopilot: {
      enableAutoReply: true,
      enableSmartPosting: true,
      postingFrequency: 'weekly',
      reviewResponseDelay: 24,
    },
  },
};

export function generateUniqueEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}.${timestamp}.${random}@example.com`;
}

export function generateRandomPhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${prefix}${lineNumber}`;
}

export function waitForDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
