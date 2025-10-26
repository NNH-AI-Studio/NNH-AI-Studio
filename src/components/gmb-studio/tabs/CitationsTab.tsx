import { useState, useEffect, useMemo } from 'react';
import { Plus, CheckCircle, AlertTriangle, XCircle, Link as LinkIcon } from 'lucide-react';
import { useCitations } from '../../../hooks/useCitations';
import { supabase } from '../../../lib/supabase';
import NAPChecker from '../citations/NAPChecker';
import CitationsList from '../citations/CitationsList';

interface CitationsTabProps {
  selectedLocation: string;
}

function CitationsTab({ selectedLocation }: CitationsTabProps) {
  const { citations, loading, refetch } = useCitations(selectedLocation);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [correctNAP, setCorrectNAP] = useState({
    name: 'Your Business Name',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567'
  });

  useEffect(() => {
    if (selectedLocation) {
      fetchLocationNAP();
    }
  }, [selectedLocation]);

  const fetchLocationNAP = async () => {
    const { data } = await supabase
      .from('gmb_locations')
      .select('location_name, address, phone')
      .eq('id', selectedLocation)
      .maybeSingle();

    if (data) {
      setCorrectNAP({
        name: data.location_name,
        address: data.address || 'Not set',
        phone: data.phone || 'Not set'
      });
    }
  };

  const filteredCitations = useMemo(() => {
    if (statusFilter === 'all') return citations;
    return citations.filter((citation) => citation.status === statusFilter);
  }, [citations, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: citations.length,
      verified: citations.filter((c) => c.status === 'verified').length,
      inconsistent: citations.filter((c) => c.status === 'inconsistent').length,
      pending: citations.filter((c) => c.status === 'pending').length
    };
  }, [citations]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const statusFilters = [
    { value: 'all', label: 'All Citations', icon: LinkIcon },
    { value: 'verified', label: 'Verified', icon: CheckCircle },
    { value: 'inconsistent', label: 'Inconsistent', icon: XCircle },
    { value: 'pending', label: 'Pending', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Citations & Directory Listings</h2>
          <p className="text-white mt-1">
            Monitor your business information across online directories
          </p>
        </div>

        <button
          className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black rounded-lg font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Citation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <LinkIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-white">Total Citations</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.verified}</div>
          <div className="text-sm text-white">Verified</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.inconsistent}</div>
          <div className="text-sm text-white">Inconsistent</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.pending}</div>
          <div className="text-sm text-white">Pending</div>
        </div>
      </div>

      <NAPChecker
        correctNAP={correctNAP}
        citations={citations}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                statusFilter === filter.value
                  ? 'bg-orange-500 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {filter.label}
            </button>
          );
        })}
      </div>

      <CitationsList
        citations={filteredCitations}
        loading={loading}
        correctNAP={correctNAP}
      />
    </div>
  );
}

export default CitationsTab;
