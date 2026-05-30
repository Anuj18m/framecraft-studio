export interface SanityImageAsset {
  _ref: string;
  _type?: 'reference';
}

export interface SanityImage {
  _type: 'image';
  asset: SanityImageAsset;
  alt?: string;
}

export interface SeoFields {
  title?: string;
  description?: string;
  ogImage?: {
    image?: SanityImage;
    alt?: string;
  };
}

export interface TeamMember {
  _id: string;
  name: string;
  slug?: {
    current: string;
  };
  role: string;
  bio?: string;
  avatar?: {
    image?: SanityImage;
    alt?: string;
  };
  skills?: string[];
  specialties?: string[];
  experience?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
    instagram?: string;
    behance?: string;
  };
  published?: boolean;
  seo?: SeoFields;
}
