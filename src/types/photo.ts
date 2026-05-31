export interface Photo {
  id: string;
  gallery_id: string;
  photographer_id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

export interface PhotoWithUrl extends Photo {
  signedUrl: string;
}
