export interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface FeatureTab {
  id: string;
  label: string;
  subtitle: string;
  image: string;
  features: string[];
  learnMoreHref?: string;
}

export interface ClientLogo {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Testimonial {
  name: string;
  title: string;
  company: string;
  quote: string;
  videoThumbnail?: string;
  duration?: string;
}

export interface CaseStudy {
  logo: string;
  company: string;
  location: string;
  personPhoto: string;
  personName: string;
  personRole: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  unit: string;
  badge?: string;
  features: string[];
  cta: string;
  ctaHref: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface NavItem {
  label: string;
  href?: string;
  hasDropdown?: boolean;
}
