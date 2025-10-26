import { motion } from 'framer-motion';
import { Link2, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';

function Citations() {
  const directories = [
    { name: 'Google Business Profile', url: 'https://business.google.com', status: 'present' },
    { name: 'Bing Places', url: 'https://www.bingplaces.com', status: 'missing' },
    { name: 'Apple Business Register', url: 'https://register.apple.com/placesonmaps', status: 'incomplete' },
    { name: 'Facebook Page', url: 'https://facebook.com', status: 'present' },
    { name: 'Yelp', url: 'https://biz.yelp.com', status: 'missing' },
  ] as const;

  const statusBadge = (status: 'present'|'missing'|'incomplete') => {
    if (status === 'present') return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
        <CheckCircle2 className="w-3 h-3" /> Present
      </span>
    );
    if (status === 'incomplete') return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
        <AlertTriangle className="w-3 h-3" /> Incomplete
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertTriangle className="w-3 h-3" /> Missing
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Citations</h1>
          <p className="text-white/70 mt-1">Keep your business details consistent across directories</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Key Directories</h3>
        </div>
        <div className="divide-y divide-white/10">
          {directories.map((dir) => (
            <div key={dir.name} className="py-4 flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{dir.name}</div>
                <a href={dir.url} target="_blank" rel="noreferrer" className="text-xs text-white/60 inline-flex items-center gap-1 hover:text-white">
                  {dir.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(dir.status)}
                <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/10">
                  {dir.status === 'present' ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-2">Why citations matter</h3>
        <p className="text-white/70 text-sm">
          Consistent business information helps customers find you and improves local search rankings. Start with the key directories, then expand gradually.
        </p>
      </div>
    </motion.div>
  );
}

export default Citations;
