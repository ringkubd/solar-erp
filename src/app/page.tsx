import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

async function getSeo() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/website/seo/home', { next: { revalidate: 10 } });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  
  if (!seo) {
    return {
      title: 'ECOPAC Power and Technology',
      description: 'Engineering and Power Solutions',
    };
  }

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords ? seo.keywords.split(',') : [],
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.og_image ? [{ url: seo.og_image }] : [],
    },
  };
}

export default async function Page() {
  const seo = await getSeo();
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: seo?.title || 'ECOPAC Power and Technology',
    image: seo?.og_image || 'https://www.ecopacpowertech.com/logo.png',
    description: seo?.description || 'Engineering and Power Solutions',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD'
    },
    telephone: '+880 1339 671631',
    url: 'https://www.ecopacpowertech.com'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageClient />
    </>
  );
}
