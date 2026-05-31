export interface PhotographerProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  logo_url: string | null;
  primary_color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileInput {
  businessName?: string;
  logoUrl?: string | null;
  primaryColor?: string;
}

export interface UpdateProfileInput {
  businessName?: string;
  logoUrl?: string | null;
  primaryColor?: string;
}