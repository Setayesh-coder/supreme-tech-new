import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../contexts/SettingsContext';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
}

export default function MetaTags({ 
  title, 
  description, 
  image, 
  url, 
  keywords 
}: MetaTagsProps) {
  const { settings } = useSettings();
  
  const pageTitle = title || settings?.seo?.title || settings?.site_title || 'Supreme Tech';
  const pageDescription = description || settings?.seo?.description || settings?.site_description || '';
  const pageKeywords = keywords || settings?.seo?.keywords || '';
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={settings?.site_description || 'Supreme Tech'} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
