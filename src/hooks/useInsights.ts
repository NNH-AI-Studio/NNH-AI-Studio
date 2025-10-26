import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface InsightData {
  name: string;
  views: number;
  searches: number;
  calls: number;
  messages?: number;
  directions?: number;
  website_clicks?: number;
}

export interface GmbInsight {
  id: string;
  location_id: string;
  date: string;
  metric_type: 'views' | 'searches' | 'calls' | 'messages' | 'directions' | 'website_clicks';
  metric_value: number;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export function useInsights(locationId?: string, days: number = 7) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalSearches: 0,
    totalCalls: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('gmb_insights')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (locationId) {
        query = query.eq('location_id', locationId);
      } else {
        const { data: accountsData } = await supabase
          .from('gmb_accounts')
          .select('id')
          .eq('user_id', user.id);

        if (!accountsData || accountsData.length === 0) {
          setInsights([]);
          setLoading(false);
          return;
        }

        const accountIds = accountsData.map((acc) => acc.id);

        const { data: locationsData } = await supabase
          .from('gmb_locations')
          .select('id')
          .in('gmb_account_id', accountIds);

        if (!locationsData || locationsData.length === 0) {
          setInsights([]);
          setLoading(false);
          return;
        }

        const locationIds = locationsData.map((loc) => loc.id);
        query = query.in('location_id', locationIds);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const groupedByDate: { [key: string]: InsightData } = {};
      let totalViews = 0;
      let totalSearches = 0;
      let totalCalls = 0;
      let totalMessages = 0;

      (data || []).forEach((insight) => {
        const dateKey = new Date(insight.date).toLocaleDateString('en-US', {
          weekday: 'short',
        });

        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = {
            name: dateKey,
            views: 0,
            searches: 0,
            calls: 0,
            messages: 0,
          };
        }

        switch (insight.metric_type) {
          case 'views':
            groupedByDate[dateKey].views += insight.metric_value;
            totalViews += insight.metric_value;
            break;
          case 'searches':
            groupedByDate[dateKey].searches += insight.metric_value;
            totalSearches += insight.metric_value;
            break;
          case 'calls':
            groupedByDate[dateKey].calls += insight.metric_value;
            totalCalls += insight.metric_value;
            break;
          case 'messages':
            groupedByDate[dateKey].messages! += insight.metric_value;
            totalMessages += insight.metric_value;
            break;
        }
      });

      setInsights(Object.values(groupedByDate));
      setStats({
        totalViews,
        totalSearches,
        totalCalls,
        totalMessages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user, locationId, days]);

  const addInsight = async (insightData: {
    location_id: string;
    date: string;
    metric_type: 'views' | 'searches' | 'calls' | 'messages' | 'directions' | 'website_clicks';
    metric_value: number;
    source?: string;
  }) => {
    const { error } = await supabase
      .from('gmb_insights')
      .upsert(insightData, {
        onConflict: 'location_id,date,metric_type,source',
      });

    if (error) throw error;

    await fetchInsights();
  };

  return {
    insights,
    stats,
    loading,
    error,
    refetch: fetchInsights,
    addInsight,
  };
}
