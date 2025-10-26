import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';
import CitationCard from './CitationCard';

interface Citation {
  id: string;
  directory_name: string;
  directory_url: string;
  citation_url?: string;
  business_name?: string;
  address?: string;
  phone?: string;
  website?: string;
  status: string;
  last_checked?: string;
}

interface CitationsListProps {
  citations: Citation[];
  loading: boolean;
  correctNAP: {
    name: string;
    address: string;
    phone: string;
  };
}

function CitationsList({ citations, loading, correctNAP }: CitationsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (citations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No citations yet</h3>
        <p className="text-white">
          Add directory listings to track your business citations
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {citations.map((citation, index) => (
        <motion.div
          key={citation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CitationCard citation={citation} correctNAP={correctNAP} />
        </motion.div>
      ))}
    </div>
  );
}

export default CitationsList;
