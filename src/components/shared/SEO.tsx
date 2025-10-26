import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  structuredData?: Record<string, any>;
}

function SEO({
  title = 'NNH Local - Google Business Management Tool',
  description = 'Manage Google Business locations, automate reviews, and track rankings. AI responds in 2 minutes. Free 14-day trial. No credit card required.',
  keywords = 'google my business management, local seo automation, review response tool, gmb dashboard, business listing management',
  ogImage = '/nnh-logo.png',
  ogType = 'website',
  canonical,
  structuredData
}: SEOProps) {
  const siteUrl = 'https://www.nnh.ae';
  const fullTitle = title.includes('NNH Local') ? title : `${title} | NNH Local`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="NNH Local" />
      <meta property="og:url" content={canonical ? `${siteUrl}${canonical}` : siteUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
