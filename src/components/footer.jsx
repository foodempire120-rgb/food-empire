import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-900 py-6 md:py-8 relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gray-200/30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-6 mb-4">
          {/* ✅ Logo and Description */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-3 group">
              <img 
                src="/Images/preview.png"
                alt="Food Empire Logo"
                className="w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out animate-bounce-subtle"
              />
            </Link>
            <p className="text-gray-800 text-sm leading-relaxed mb-2">
              Shaping the future of food delivery through intelligent logistics, trusted sourcing, and unbeatable freshness.
            </p>
          </div>

          {/* ✅ Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-800 text-sm">
              <li><Link to="/" className="hover:text-emerald-600 transition-colors duration-300">Home</Link></li>
              <li><Link to="/about" className="hover:text-emerald-600 transition-colors duration-300">About Us</Link></li>
              <li><Link to="/products" className="hover:text-emerald-600 transition-colors duration-300">Products</Link></li>
              <li><Link to="/careers" className="hover:text-emerald-600 transition-colors duration-300">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600 transition-colors duration-300">Contact</Link></li>
            </ul>
          </div>

          {/* ✅ Contact Info */}
          <div>
            <h4 className="text-md font-semibold mb-3">Contact Info</h4>
            <div className="space-y-2 text-gray-800 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>+84-258-3888-388</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>info@food-empire.net</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="leading-snug">
                  Lot NV05-06, Road No. 28, Phuoc Long Urban Area, Phuoc Long Ward, Nha Trang City, Khanh Hoa Province, Vietnam
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Bottom Strip */}
        <div className="border-t border-gray-300 pt-3 pb-2 text-center">
          <p className="text-gray-700 text-xs">
            © 2025 Food Empire. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
