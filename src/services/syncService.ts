import { supabase } from '../lib/supabase';
import { GMBClient, GMBLocation, GMBReview } from '../lib/google/gmbClient';

export class SyncService {
  private gmbClient: GMBClient;
  private accountId: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(accountId: string) {
    this.accountId = accountId;
    this.gmbClient = new GMBClient(accountId);
  }

  // Helper: جلب JWT المستخدم الحالي لاستخدامه مع وظائف الحافة
  private async getUserAccessToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;

    const { data } = await supabase.auth.refreshSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('No user session. Please sign in.');
    return token;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        const delay = this.retryDelay * (this.maxRetries - retries + 1);
        console.log(`Retrying operation in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(operation, retries - 1);
      }
      throw error;
    }
  }

  async syncLocations(): Promise<number> {
    return this.retryWithBackoff(async () => {
      try {
        // استخدم توكن المستخدم بدلاً من anon key
        const accessToken = await this.getUserAccessToken();

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmb-sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              accountId: this.accountId,
              syncType: 'locations'
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          // حاول قراءة JSON، وإن فشل اعرض النص
          let message = `HTTP ${response.status}: Failed to sync locations`;
          try {
            const errorData = JSON.parse(errorText || '{}');
            if (errorData?.error) message = errorData.error;
          } catch {
            if (errorText) message = errorText;
          }
          throw new Error(message);
        }

        const data = await response.json();
        return data.locationsCount || 0;
      } catch (error) {
        console.error('Failed to sync locations:', error);
        throw error;
      }
    });
  }

  private async saveLocation(location: GMBLocation): Promise<void> {
    const address = location.storefrontAddress;
    const fullAddress = address
      ? [
          ...(address.addressLines || []),
          address.locality,
          address.administrativeArea,
          address.postalCode
        ]
          .filter(Boolean)
          .join(', ')
      : '';

    const { error } = await supabase
      .from('gmb_locations')
      .upsert({
        account_id: this.accountId,
        location_name: location.title,
        gmb_location_id: location.name,
        address: fullAddress,
        phone: location.phoneNumbers?.primaryPhone,
        website: location.websiteUri,
        place_id: location.metadata?.placeId,
        category: location.categories?.primaryCategory?.displayName,
        last_sync: new Date().toISOString()
      }, {
        onConflict: 'gmb_location_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Failed to save location:', error);
    }
  }

  async syncReviews(locationId: string, gmbLocationName: string): Promise<number> {
    try {
      const reviews = await this.gmbClient.listReviews(gmbLocationName);
      let syncedCount = 0;

      for (const review of reviews) {
        await this.saveReview(locationId, review);
        syncedCount++;
      }

      return syncedCount;
    } catch (error) {
      console.error('Failed to sync reviews:', error);
      throw error;
    }
  }

  private async saveReview(locationId: string, review: GMBReview): Promise<void> {
    const starRatingMap = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5
    };

    const { error } = await supabase
      .from('gmb_reviews')
      .upsert({
        location_id: locationId,
        gmb_review_id: review.reviewId,
        reviewer_name: review.reviewer.displayName,
        reviewer_photo: review.reviewer.profilePhotoUrl,
        rating: starRatingMap[review.starRating],
        comment: review.comment,
        review_date: review.createTime,
        reply_text: review.reviewReply?.comment,
        reply_date: review.reviewReply?.updateTime,
        updated_at: review.updateTime
      }, {
        onConflict: 'gmb_review_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Failed to save review:', error);
    }
  }

  async syncInsights(locationId: string, gmbLocationName: string, days: number = 30): Promise<void> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const insights = await this.gmbClient.getInsights(
        gmbLocationName,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (insights.metricValues) {
        for (const metricValue of insights.metricValues) {
          await this.saveInsights(locationId, metricValue);
        }
      }
    } catch (error) {
      console.error('Failed to sync insights:', error);
      throw error;
    }
  }

  private async saveInsights(locationId: string, metricValue: any): Promise<void> {
    const metricTypeMap: Record<string, string> = {
      QUERIES_DIRECT: 'direct_searches',
      QUERIES_INDIRECT: 'discovery_searches',
      VIEWS_MAPS: 'maps_views',
      VIEWS_SEARCH: 'search_views',
      ACTIONS_WEBSITE: 'website_clicks',
      ACTIONS_PHONE: 'phone_calls',
      ACTIONS_DRIVING_DIRECTIONS: 'direction_requests'
    };

    if (!metricValue.dimensionalValues) return;

    for (const dimValue of metricValue.dimensionalValues) {
      if (!dimValue.timeDimension?.timeRange?.startTime) continue;

      const date = dimValue.timeDimension.timeRange.startTime.split('T')[0];
      const value = parseInt(dimValue.value || '0');
      const metricType = metricTypeMap[metricValue.metric];

      if (!metricType) continue;

      const { error } = await supabase
        .from('gmb_insights')
        .upsert({
          location_id: locationId,
          date,
          [metricType]: value
        }, {
          onConflict: 'location_id,date',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Failed to save insights:', error);
      }
    }
  }

  async fullSync(): Promise<{
    locations: number;
    reviews: number;
  }> {
    return this.retryWithBackoff(async () => {
      try {
        // استخدم توكن المستخدم بدلاً من anon key
        const accessToken = await this.getUserAccessToken();

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmb-sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              accountId: this.accountId,
              syncType: 'full'
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          let message = `HTTP ${response.status}: Sync failed`;
          try {
            const errorData = JSON.parse(errorText || '{}');
            if (errorData?.error) message = errorData.error;
          } catch {
            if (errorText) message = errorText;
          }
          throw new Error(message);
        }

        const data = await response.json();

        await supabase
          .from('gmb_accounts')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', this.accountId);

        return {
          locations: data.locationsCount || 0,
          reviews: data.reviewsCount || 0
        };
      } catch (error) {
        console.error('Full sync error:', error);
        throw error;
      }
    });
  }
}