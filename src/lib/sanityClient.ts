import {createClient} from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'fb0ooyzc';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2025-05-29';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
});

export default sanityClient;
