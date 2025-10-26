import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle, AlertTriangle, XCircle, Globe, MapPin, Phone } from 'lucide-react';

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

interface CitationCardProps {
  citation: Citation;
  correctNAP: {
    name: string;
    address: string;
    phone: string;
  };
}

function CitationCard({ citation, correctNAP }: CitationCardProps) {
  const getStatusBadge = () => {
    const badges = {
      verified: {
        icon: CheckCircle,
        label: 'Verified',
        className: 'bg-green-400/20 text-orange-500 border-green-400/30'
      },
      pending: {
        icon: AlertTriangle,
        label: 'Pending',
        className: 'bg-yellow-400/20 text-orange-500 border-yellow-400/30'
      },
      inconsistent: {
        icon: XCircle,
        label: 'Inconsistent',
        className: 'bg-red-400/20 text-orange-500 border-red-400/30'
      }
    };

    const badge = badges[citation.status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const checkField = (field?: string, correct?: string) => {
    if (!field) return null;
    const isCorrect = field === correct;
    return (
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
        )}
        <span className={isCorrect ? 'text-white/80' : 'text-orange-500'}>{field}</span>
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-neon-orange rounded-xl p-6 hover:border-orange-500 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{citation.directory_name}</h3>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="text-xs text-white">
              Last checked: {formatDate(citation.last_checked)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {citation.citation_url && (
            <a
              href={citation.citation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="View Citation"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
          )}
          <a
            href={citation.directory_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Visit Directory"
          >
            <Globe className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>

      <div className="space-y-3">
        {citation.business_name && (
          <div>
            <div className="text-xs text-white mb-1">Business Name</div>
            {checkField(citation.business_name, correctNAP.name)}
          </div>
        )}

        {citation.address && (
          <div>
            <div className="text-xs text-white mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Address
            </div>
            {checkField(citation.address, correctNAP.address)}
          </div>
        )}

        {citation.phone && (
          <div>
            <div className="text-xs text-white mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Phone
            </div>
            {checkField(citation.phone, correctNAP.phone)}
          </div>
        )}

        {citation.website && (
          <div>
            <div className="text-xs text-white mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Website
            </div>
            <a
              href={citation.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline text-sm"
            >
              {citation.website}
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default CitationCard;
