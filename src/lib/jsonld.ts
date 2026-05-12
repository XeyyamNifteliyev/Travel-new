export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TravelAZ',
    url: 'https://travelaz.az',
    logo: 'https://travelaz.az/logo.png',
    description: 'Azərbaycanın travel platforması — uçuşlar, otellər, vizalar və səyahət planlaşdırma.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://travelaz.az',
    },
    sameAs: [],
  };
}

export function webSiteJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TravelAZ',
    url: `https://travelaz.az/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://travelaz.az/${locale}/countries?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function countryJsonLd(country: {
  name: string;
  nameEn?: string;
  slug: string;
  capital?: string;
  description?: string;
  cca2?: string;
  locale?: string;
}) {
  const locale = country.locale || 'az';
  const url = `https://travelaz.az/${locale}/countries/${country.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: country.name,
    description: country.description || `Discover ${country.name} - travel guide, visa info, flights, hotels and more.`,
    url,
    address: {
      '@type': 'PostalAddress',
      addressCountry: country.cca2 || country.slug,
      addressLocality: country.capital || undefined,
    },
  };
}

export function cityJsonLd(city: {
  name: string;
  slug: string;
  countryName?: string;
  description?: string;
  locale?: string;
}) {
  const locale = city.locale || 'az';
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: city.name,
    description: city.description || `Explore ${city.name} - attractions, restaurants, hotels and travel tips.`,
    url: `https://travelaz.az/${locale}/cities/${city.slug}`,
    containedInPlace: city.countryName ? {
      '@type': 'Country',
      name: city.countryName,
    } : undefined,
  };
}

export function blogPostJsonLd(blog: {
  title: string;
  slug?: string;
  id?: string;
  coverImage?: string;
  createdAt?: string;
  authorName?: string;
  locale?: string;
}) {
  const locale = blog.locale || 'az';
  const url = blog.slug
    ? `https://travelaz.az/${locale}/blog/${blog.slug}`
    : `https://travelaz.az/${locale}/blog/${blog.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    url,
    image: blog.coverImage || undefined,
    datePublished: blog.createdAt || undefined,
    author: blog.authorName ? {
      '@type': 'Person',
      name: blog.authorName,
    } : { '@type': 'Organization', name: 'TravelAZ' },
    publisher: {
      '@type': 'Organization',
      name: 'TravelAZ',
      url: 'https://travelaz.az',
    },
  };
}