import React from 'react';
import { Camera, Heart, Instagram, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Navigate',
      links: [
        { label: 'Portfolio', href: '#gallery' },
        { label: 'Services', href: '#services' },
        { label: 'Team', href: '#team' },
        { label: 'Timeline', href: '#timeline' },
        { label: 'Contact', href: '#contact' }
      ]
    },
    {
      title: 'Connect',
      links: [
        { label: 'Email Us', href: 'mailto:hello@framecraft.com' },
        { label: 'Instagram', href: 'https://instagram.com' },
        { label: 'LinkedIn', href: 'https://linkedin.com' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@framecraft.com', label: 'Email' }
  ];

  const isExternal = (href: string) => href.startsWith('http');

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Camera className="w-8 h-8 text-amber-400" />
              <span className="text-2xl font-bold">FrameCraft</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Capturing life's most precious moments with artistic vision and technical excellence. 
              We tell your story, one frame at a time.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={isExternal(social.href) ? '_blank' : undefined}
                  rel={isExternal(social.href) ? 'noopener noreferrer' : undefined}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-lg font-semibold mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={isExternal(link.href) ? '_blank' : undefined}
                      rel={isExternal(link.href) ? 'noopener noreferrer' : undefined}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-gray-400 mb-4 md:mb-0">
              <span>© {currentYear} FrameCraft Studio. Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>from algoonerd</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#contact" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#contact" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;