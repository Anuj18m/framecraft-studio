import sanityClient from '@/lib/sanityClient';
import type {TeamMember} from '@/types/cms';

export const getTeam = async (): Promise<TeamMember[]> => {
  const query = `*[_type == "teamMember" && published != false] | order(_createdAt asc) {
    _id,
    name,
    slug,
    role,
    bio,
    avatar,
    skills,
    specialties,
    experience,
    social,
    published,
    seo
  }`;

  return sanityClient.fetch<TeamMember[]>(query);
};
