import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface NAPData {
  name: string;
  address: string;
  phone: string;
}

interface NAPCheckerProps {
  correctNAP: NAPData;
  citations: any[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

function NAPChecker({ correctNAP, citations, onRefresh, isRefreshing = false }: NAPCheckerProps) {
  const checkConsistency = () => {
    let consistent = 0;
    let inconsistent = 0;
    let missing = 0;

    citations.forEach((citation) => {
      const hasData = citation.business_name || citation.address || citation.phone;

      if (!hasData) {
        missing++;
        return;
      }

      const nameMatch = !citation.business_name || citation.business_name === correctNAP.name;
      const addressMatch = !citation.address || citation.address === correctNAP.address;
      const phoneMatch = !citation.phone || citation.phone === correctNAP.phone;

      if (nameMatch && addressMatch && phoneMatch) {
        consistent++;
      } else {
        inconsistent++;
      }
    });

    return { consistent, inconsistent, missing };
  };

  const { consistent, inconsistent, missing } = checkConsistency();
  const total = citations.length;
  const consistencyScore = total > 0 ? Math.round((consistent / total) * 100) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-orange-500';
    if (score >= 70) return 'text-orange-500';
    return 'text-orange-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-400/20 border-green-400/30';
    if (score >= 70) return 'bg-yellow-400/20 border-yellow-400/30';
    return 'bg-red-400/20 border-red-400/30';
  };

  return (
    <div className="bg-black border border-neon-orange rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">NAP Consistency Score</h3>
          <p className="text-sm text-white">Name, Address, Phone consistency across directories</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getScoreBg(consistencyScore)} mb-4`}>
            <span className={`text-4xl font-bold ${getScoreColor(consistencyScore)}`}>
              {consistencyScore}%
            </span>
          </div>
          <p className="text-white">Overall Consistency</p>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-4 bg-green-400/10 border border-green-400/20 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <span className="text-white font-medium">Consistent</span>
            </div>
            <span className="text-2xl font-bold text-orange-500">{consistent}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-4 bg-red-400/10 border border-red-400/20 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-orange-500" />
              <span className="text-white font-medium">Inconsistent</span>
            </div>
            <span className="text-2xl font-bold text-orange-500">{inconsistent}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-white font-medium">Missing Data</span>
            </div>
            <span className="text-2xl font-bold text-orange-500">{missing}</span>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-neon-orange">
        <h4 className="font-semibold text-white mb-3">Correct NAP Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-white w-20">Name:</span>
            <span className="text-white font-medium">{correctNAP.name}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-white w-20">Address:</span>
            <span className="text-white font-medium">{correctNAP.address}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-white w-20">Phone:</span>
            <span className="text-white font-medium">{correctNAP.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NAPChecker;
