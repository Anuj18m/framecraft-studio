import React, { useState } from 'react';
import { Eye, Heart, Share2, Tag, Camera, MapPin, ImageOff } from 'lucide-react';
import { GalleryItem } from '../types';
import { useInView } from '../hooks/useInView';
import RippleButton from './RippleButton';

interface ImageCardProps {
  item: GalleryItem;
  index: number;
  viewMode: 'grid' | 'list';
}

const ImageCard: React.FC<ImageCardProps> = ({ item, index, viewMode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { ref, inView } = useInView(0.1);

  const handleImageLoad = () => {
    setHasError(false);
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const renderImage = (heightClass: string) => {
    if (hasError) {
      return (
        <div className={`flex items-center justify-center ${heightClass} bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300`}>
          <div className="text-center px-4">
            <ImageOff className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Image unavailable</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <img
          src={item.image}
          alt={item.title}
          className={`w-full ${heightClass} object-cover transition-transform duration-500 hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {!isLoaded && (
          <div className={`absolute inset-0 ${heightClass} bg-gray-200 dark:bg-gray-700 animate-pulse`} />
        )}
      </>
    );
  };

  if (viewMode === 'list') {
    return (
      <div 
        ref={ref}
        className={`flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div className="md:w-1/3 relative overflow-hidden">
          {renderImage('h-64 md:h-full')}
        </div>
        <div className="md:w-2/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full capitalize">
                {item.category}
              </span>
              <div className="flex items-center space-x-2">
                <RippleButton className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200">
                  <Heart className="w-4 h-4" />
                </RippleButton>
                <RippleButton className="p-2 text-gray-400 hover:text-indigo-500 transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                </RippleButton>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
            
            {/* Photography Details */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
              {item.client && (
                <div className="flex items-center">
                  <span className="font-medium">Client:</span>
                  <span className="ml-2">{item.client}</span>
                </div>
              )}
              {item.location && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{item.location}</span>
                </div>
              )}
              {item.camera && (
                <div className="flex items-center">
                  <Camera className="w-3 h-3 mr-1" />
                  <span>{item.camera}</span>
                </div>
              )}
              {item.lens && (
                <div className="flex items-center">
                  <span className="font-medium">Lens:</span>
                  <span className="ml-2">{item.lens}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <div className={`${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-500`}>
          {renderImage('h-64')}
        </div>

        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="text-center text-white">
            <RippleButton className="mb-4 p-3 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors duration-200">
              <Eye className="w-6 h-6" />
            </RippleButton>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-sm opacity-90">{item.description}</p>
            {item.client && (
              <p className="text-xs opacity-75 mt-2">Client: {item.client}</p>
            )}
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-medium bg-amber-500/90 text-white rounded-full capitalize backdrop-blur-sm">
            {item.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className={`absolute top-4 right-4 flex space-x-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
          <RippleButton className="p-2 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200">
            <Heart className="w-4 h-4" />
          </RippleButton>
          <RippleButton className="p-2 bg-white/20 rounded-full backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200">
            <Share2 className="w-4 h-4" />
          </RippleButton>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{item.description}</p>
        
        {/* Photography Details */}
        <div className="space-y-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
          {item.location && (
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{item.location}</span>
            </div>
          )}
          {item.camera && (
            <div className="flex items-center">
              <Camera className="w-3 h-3 mr-1" />
              <span>{item.camera} • {item.lens}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{item.tags.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;