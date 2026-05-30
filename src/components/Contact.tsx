import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import RippleButton from './RippleButton';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { ref, inView } = useInView(0.1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipient = 'hello@framecraft.com';
    const subject = encodeURIComponent(formData.subject || 'Photography inquiry');
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-16 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Ready to capture your special moments? Let's create beautiful memories together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className={`transition-all duration-1000 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Let's Connect
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                We're here to capture your most important moments. Reach out to discuss your photography needs, 
                book a session, or just say hello.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Mail,
                  title: 'Email Us',
                  content: 'hello@framecraft.com',
                  action: 'mailto:hello@framecraft.com',
                  external: false
                },
                {
                  icon: Phone,
                  title: 'Call Us',
                  content: '+91 8329758125',
                  action: 'tel:+91 8329758125',
                  external: false
                },
                {
                  icon: MapPin,
                  title: 'Studio Location',
                  content: 'Thakur Village, Kandivali East, Mumbai',
                  action: 'https://maps.google.com',
                  external: true
                }
              ].map((contact, index) => (
                <div 
                  key={contact.title}
                  className={`flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                      <contact.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {contact.title}
                    </h4>
                    <a
                      href={contact.action}
                      target={contact.external ? '_blank' : undefined}
                      rel={contact.external ? 'noopener noreferrer' : undefined}
                      className="text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
                    >
                      {contact.content}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className={`transition-all duration-1000 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Wedding, Portrait, Commercial, etc."
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                  placeholder="Tell us about your photography needs, event date, location, and any special requirements..."
                />
              </div>

              <RippleButton
                type="submit"
                className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="flex items-center justify-center">
                  Open Email Client
                  <Send className="w-5 h-5 ml-2" />
                </span>
              </RippleButton>
            </form>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              This opens your email app with a prefilled message. No backend is required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;