import React from 'react';
import { Link } from 'react-router-dom'; // Assuming some links might be internal
import { HeartIcon } from '@heroicons/react/24/solid'; // Example icon

// Example social media icons (replace with actual SVGs or an icon library if needed)
const SocialIcon = ({ href, children, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
    aria-label={label}
  >
    {children}
  </a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About Us', path: '/about' }, // Use Link for internal routes
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Column 1: Brand & Copyright */}
          <div className="space-y-3 text-center md:text-left">
            <Link to="/" className="inline-block text-2xl font-bold text-white hover:text-indigo-400 transition-colors">
              BlogSphere
            </Link>
            <p className="text-sm text-gray-400">
              Discover captivating stories, expert insights, and fresh perspectives.
            </p>
            <p className="text-xs text-gray-500">
              © {currentYear} BlogSphere. All rights reserved.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-indigo-400 hover:underline transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
               {/* Example additional link */}
              <li>
                <Link to="/blogs" className="text-gray-300 hover:text-indigo-400 hover:underline transition-colors text-sm">
                  Explore Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Media & Contact (Example) */}
          <div className="text-center md:text-left">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Connect With Us</h3>
            <div className="flex justify-center md:justify-start space-x-5 mb-4">
              <SocialIcon href="https://twitter.com" label="Follow us on Twitter">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Follow us on Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Follow us on Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.028 4.465c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zm0 2.188a6.505 6.505 0 00-3.712.054c-.985.042-1.505.198-1.915.362A2.72 2.72 0 005.08 5.74a2.72 2.72 0 00-.362 1.915c-.042.985-.054 1.505-.054 3.712s.012 2.727.054 3.712c.042.985.198 1.505.362 1.915a2.72 2.72 0 001.673 1.673c.41.164.93.319 1.915.362.985.042 1.505.054 3.712.054s2.727-.012 3.712-.054c.985-.042 1.505-.198 1.915-.362a2.72 2.72 0 001.673-1.673c.164-.41.319-.93.362-1.915.042-.985.054-1.505.054-3.712s-.012-2.727-.054-3.712c-.042-.985-.198-1.505-.362-1.915a2.72 2.72 0 00-1.673-1.673c-.41-.164-.93-.319-1.915-.362C15.042 4.24 14.522 4.188 12.315 4.188zM12 9.188a2.813 2.813 0 100 5.625 2.813 2.813 0 000-5.625zM12 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd" /></svg>
              </SocialIcon>
            </div>
            <p className="text-sm text-gray-400">
              Feel free to reach out via our social channels or the contact page.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            Made with <HeartIcon className="w-5 h-5 text-red-500 mx-1.5" /> by the BlogSphere Team.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;