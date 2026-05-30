import React from 'react';
import { Instagram, Linkedin, Twitter, Mail, Award, Camera } from 'lucide-react';
import { TeamMember } from '../types';
import { useInView } from '../hooks/useInView';

const TeamSection: React.FC = () => {
  const { ref, inView } = useInView(0.1);

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Alexandra Rivera',
      role: 'Lead Photographer & Founder',
      bio: 'Award-winning photographer with 10+ years of experience capturing life\'s most precious moments with artistic vision.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Wedding Photography', 'Portrait Photography', 'Adobe Lightroom', 'Studio Lighting'],
      specialties: ['Weddings', 'Portraits', 'Fashion'],
      experience: '10+ years',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        email: 'alex@framecraft.com',
        instagram: 'https://instagram.com'
      }
    },
    {
      id: '2',
      name: 'Marcus Thompson',
      role: 'Commercial Photographer',
      bio: 'Specialized in commercial and product photography, bringing brands to life through compelling visual storytelling.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Product Photography', 'Commercial Shoots', 'Brand Photography', 'Photo Retouching'],
      specialties: ['Commercial', 'Product', 'Corporate'],
      experience: '8+ years',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'marcus@framecraft.com',
        instagram: 'https://instagram.com'
      }
    },
    {
      id: '3',
      name: 'Emily Chen',
      role: 'Event Photographer',
      bio: 'Passionate about capturing the energy and emotion of special events, from intimate gatherings to grand celebrations.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Event Photography', 'Candid Shots', 'Low Light Photography', 'Photo Journalism'],
      specialties: ['Events', 'Weddings', 'Corporate'],
      experience: '6+ years',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        email: 'emily@framecraft.com',
        instagram: 'https://instagram.com'
      }
    },
    {
      id: '4',
      name: 'James Wilson',
      role: 'Photo Editor & Retoucher',
      bio: 'Master of post-production, transforming raw captures into stunning final images that exceed client expectations.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: ['Adobe Photoshop', 'Adobe Lightroom', 'Color Grading', 'Digital Retouching'],
      specialties: ['Retouching', 'Color Grading', 'Digital Art'],
      experience: '7+ years',
      social: {
        linkedin: 'https://linkedin.com',
        email: 'james@framecraft.com',
        instagram: 'https://instagram.com'
      }
    }
  ];

  return (
    <section id="team" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-16 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Creative professionals passionate about capturing your most important moments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <TeamCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

const TeamCard: React.FC<TeamCardProps> = ({ member, index }) => {
  const { ref, inView } = useInView(0.1);

  return (
    <div 
      ref={ref}
      className={`group relative bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-sm leading-relaxed mb-4">{member.bio}</p>
            <div className="mb-4">
              <p className="text-white/80 text-xs mb-2">Specialties:</p>
              <div className="flex flex-wrap gap-1">
                {member.specialties.map((specialty) => (
                  <span key={specialty} className="px-2 py-1 text-xs bg-amber-500/80 text-white rounded-full backdrop-blur-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.skills.slice(0, 2).map((skill) => (
                <span key={skill} className="px-2 py-1 text-xs bg-white/20 text-white rounded-full backdrop-blur-sm">
                  {skill}
                </span>
              ))}
              {member.skills.length > 2 && (
                <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full backdrop-blur-sm">
                  +{member.skills.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Award Badge */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-2 bg-amber-400 rounded-full">
            <Camera className="w-4 h-4 text-gray-900" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Award className="w-4 h-4 mr-1" />
            <span className="text-sm">{member.experience}</span>
          </div>
        </div>
        
        <p className="text-amber-600 dark:text-amber-400 font-medium mb-4">{member.role}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {member.skills.map((skill) => (
            <span key={skill} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex justify-center space-x-3">
          {member.social.instagram && (
            <a
              href={member.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-pink-600 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {member.social.linkedin && (
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {member.social.twitter && (
            <a
              href={member.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          )}
          {member.social.email && (
            <a
              href={`mailto:${member.social.email}`}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSection;