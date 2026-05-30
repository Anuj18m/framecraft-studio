import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { GalleryItem } from '../types';
import { useInView } from '../hooks/useInView';
import RippleButton from './RippleButton';
import ImageCard from './ImageCard';

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Sarah & Michael Wedding',
    category: 'wedding',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Romantic outdoor ceremony captured in golden hour light',
    tags: ['wedding', 'outdoor', 'golden hour', 'romantic'],
    client: 'Sarah & Michael',
    location: 'Napa Valley, CA',
    camera: 'Canon EOS R5',
    lens: '85mm f/1.4'
  },
  {
    id: '2',
    title: 'Corporate Headshots',
    category: 'portrait',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Professional executive portraits for tech startup',
    tags: ['portrait', 'corporate', 'professional', 'headshot'],
    client: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    camera: 'Sony A7R IV',
    lens: '70-200mm f/2.8'
  },
  {
    id: '3',
    title: 'Fashion Editorial',
    category: 'fashion',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'High-fashion editorial shoot for luxury brand',
    tags: ['fashion', 'editorial', 'luxury', 'studio'],
    client: 'Vogue Magazine',
    location: 'Los Angeles, CA',
    camera: 'Hasselblad X1D',
    lens: '90mm f/3.2'
  },
  {
    id: '4',
    title: 'Product Photography',
    category: 'commercial',
    image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Luxury watch collection for e-commerce catalog',
    tags: ['product', 'commercial', 'luxury', 'catalog'],
    client: 'Timepiece Co.',
    location: 'Studio, NYC',
    camera: 'Canon EOS R5',
    lens: '100mm f/2.8 Macro'
  },
  {
    id: '5',
    title: 'Maternity Session',
    category: 'portrait',
    image: 'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&w=800',
    description: 'Beautiful maternity portraits in natural setting',
    tags: ['maternity', 'portrait', 'natural', 'outdoor'],
    client: 'The Johnson Family',
    location: 'Central Park, NYC',
    camera: 'Nikon D850',
    lens: '85mm f/1.4'
  },
  {
    id: '6',
    title: 'Engagement Photos',
    category: 'wedding',
    image: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Romantic engagement session at sunset',
    tags: ['engagement', 'couple', 'sunset', 'romantic'],
    client: 'Emma & David',
    location: 'Golden Gate Bridge, SF',
    camera: 'Sony A7 III',
    lens: '24-70mm f/2.8'
  }
];

const ImageGallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { ref, inView } = useInView(0.1);

  const categories = ['all', ...Array.from(new Set(galleryItems.map(item => item.category)))];

  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <section id="gallery" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-16 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our Portfolio
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover our finest work across weddings, portraits, fashion, and commercial photography
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search portfolio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>

            <div className="flex items-center gap-4">
              <RippleButton
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </RippleButton>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                <RippleButton
                  onClick={() => setViewMode('grid')}
                  aria-label="View gallery as grid"
                  className={`p-3 ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'} transition-colors duration-200`}
                >
                  <Grid className="w-5 h-5" />
                </RippleButton>
                <RippleButton
                  onClick={() => setViewMode('list')}
                  aria-label="View gallery as list"
                  className={`p-3 ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'} transition-colors duration-200`}
                >
                  <List className="w-5 h-5" />
                </RippleButton>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-wrap gap-2 py-4">
              {categories.map((category) => (
                <RippleButton
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors duration-200 ${
                    selectedCategory === category
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </RippleButton>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredItems.map((item, index) => (
            <ImageCard 
              key={item.id} 
              item={item} 
              index={index} 
              viewMode={viewMode}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No items found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageGallery;