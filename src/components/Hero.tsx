import React from 'react';
import { ArrowRight, Camera, Award, Users, Image } from 'lucide-react';
import RippleButton from './RippleButton';
import TypewriterText from './TypewriterText';

const Hero: React.FC = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
              <Camera className="w-4 h-4 mr-2" />
              Professional Photography
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="block">Capturing Life's</span>
            <TypewriterText 
              words={['Moments', 'Beauty', 'Stories', 'Emotions']}
              className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent"
            />
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            We specialize in wedding, portrait, and commercial photography that tells your unique story 
            with artistic vision and technical excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <RippleButton
              onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center">
                View Portfolio
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </RippleButton>
            
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: '500+', label: 'Happy Clients', icon: Users },
              { number: '50+', label: 'Awards Won', icon: Award },
              { number: '10K+', label: 'Photos Captured', icon: Image }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;