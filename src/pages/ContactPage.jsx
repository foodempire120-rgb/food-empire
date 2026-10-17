import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ArrowRight, MessageSquare, Calendar, Users, Globe, Zap, Shield } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import { useEffect } from "react";
import { BsChatDotsFill } from "react-icons/bs";


const ContactPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [showChatButtons, setShowChatButtons] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
  e.preventDefault();

  emailjs.send(
    'service_n5lptmv',
    'template_lvjxldc',
    formData,
    'KYTDmibC6pXtsgIw9'
  )
  .then(() => {
    setIsSubmitted(true);
    setFormData({   // 👈 This clears the form
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    });
    setTimeout(() => setIsSubmitted(false), 3000);
  })
  .catch((error) => {
    console.error('EmailJS error:', error);
    alert('Failed to send message. Please try again.');
  });
};


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const offices = [
  {
    city: "New York",
    address: "123 Distribution Ave, Suite 500",
    zipcode: "New York, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "ny@foodempire.com",
    image: "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    manager: "Sarah Mitchell",
    specialties: ["AI Logistics", "Technology Hub", "East Coast Operations"]
  },
  {
    city: "Los Angeles",
    address: "456 Pacific Blvd, Floor 12",
    zipcode: "Los Angeles, CA 90028",
    phone: "+1 (555) 987-6543",
    email: "la@foodempire.com",
    image: "https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    manager: "David Chen",
    specialties: ["Fresh Produce", "West Coast Hub", "Sustainability Center"]
  },
  {
    city: "Chicago",
    address: "789 Midwest Plaza, Suite 300",
    zipcode: "Chicago, IL 60601",
    phone: "+1 (555) 456-7890",
    email: "chicago@foodempire.com",
    image: "https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    manager: "Maria Rodriguez",
    specialties: ["Quality Control", "Central Distribution", "Training Center"]
  }
];


const contactMethods = [
  {
    icon: <Phone className="w-8 h-8" />,
    title: "Call Us",
    description: "Speak with our experts",
    contact: "+84 258 3888 388",
    availability: "Mon-Fri, 8AM–5PM · Sat, 8AM–12PM",
    gradient: "from-blue-500 to-cyan-600",
    action: "Call Now",
    href: "tel:+842583888388"
  },
  {
    icon: <Mail className="w-8 h-8" />,
    title: "Email Us",
    description: "Get detailed information and quotes",
    contact: "info@food-empire.net",
    availability: "Response within a day",
    gradient: "from-purple-500 to-pink-600",
    action: "Send Email",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=info@food-empire.net"
  },
  {
  icon: <MessageSquare className="w-8 h-8" />,
  title: "Live Chat",
  description: "Instant responsive support from our team",
  contact: "Within Business Hours",
  availability: "Average response: business hours",
  gradient: "from-emerald-500 to-teal-600",
  action: "Start Chat",
  href: "", // No external link
  onClick: () => setIsChatOpen(prev => !prev) // ✅ TOGGLE instead of force open
}
,
 {
  icon: <Calendar className="w-8 h-8" />,
  title: "Schedule Meeting",
  description: "Connect with our specialists to discuss your needs",
  contact: "Personalized consultation",
  availability: "Available slots this week",
  gradient: "from-orange-500 to-red-600",
  action: "Book Now",
  onClick: () => {
    const formSection = document.getElementById("contact-form");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  }
},
  {
    icon: <FaWhatsapp className="w-8 h-8" />,
    title: "WhatsApp",
    description: "Quick chat on WhatsApp with our team",
    contact: "+84 799 508 999",
    availability: "Available during business hours",
    gradient: "from-green-500 to-green-600",
    action: "Chat Now",
    href: "https://wa.me/84799508999"
  },
  {
    icon: <BsChatDotsFill className="w-8 h-8" />,
    title: "Zalo Support",
    description: "Connect instantly with us on Zalo",
    contact: "+84 90 291 79 02",
    availability: "Available during business hours",
    gradient: "from-sky-500 to-blue-600",
    action: "Message Now",
    href: "https://zalo.me/84902917902"
  }
];

  

 const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Fast Response",
    description: "Average response time within business hours"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Communication",
    description: "All communications are encrypted and secure"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Expert Team",
    description: "Dedicated specialists for every inquiry type"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Reliable Availability",
    description: "Live chat support during working hours"
  }
];

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'beef', label: 'Beef' },
  { value: 'lamb', label: 'Lamb' },
  { value: 'fries', label: 'Fries' },
  { value: 'mayonnaise', label: 'Mayonnaise' }
];

// Chatbase bot loader
  useEffect(() => {
    if (document.getElementById("-96YCJOIt5KH-ZTaX0tyA")) return;

    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "-96YCJOIt5KH-ZTaX0tyA"; // Replace with your actual bot ID if needed
    script.defer = true;
    document.body.appendChild(script);
  }, []);



  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up delay-200">
            <div className="inline-flex items-center ">
              
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Let's Start Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
                Partnership Journey
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Ready to transform your food distribution? Our team of experts is here to help you elevate your business.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 stagger-children">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 card-animate"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className="text-lg font-semibold text-gray-900 mb-2">{method.contact}</p>
                <p className="text-sm text-gray-500 mb-6">{method.availability}</p>
        {method.href ? (
  <a
    href={method.href}
    target="_blank"
    rel="noopener noreferrer"
    className={`w-full inline-block text-center bg-gradient-to-r ${method.gradient} text-white py-3 rounded-xl font-semibold btn-animate hover-glow`}
  >
    {method.action}
  </a>
) : (
  <button
    onClick={method.onClick || (() => {
      if (method.title === "Live Chat") setIsChatOpen(true);
    })}
    className={`w-full bg-gradient-to-r ${method.gradient} text-white py-3 rounded-xl font-semibold btn-animate hover-glow`}
  >
    {method.action}
  </button>
)}




              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-gradient-to-br from-white to-gray-50 animate-fade-in-up delay-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Send Us a Message
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Fill out the form and our team will get back to you within business hours. 
                For urgent matters, please call us directly.
              </p>

              {/* Features */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200/50">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting us. Our team will review your message and respond within business hours.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Inquiry Type *</label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                      placeholder="Brief subject of your inquiry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 resize-none"
                      placeholder="Please provide details about your inquiry, including any specific requirements or questions you have..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

   {/* Office Location */}
<section className="py-24 bg-gradient-to-br from-white via-gray-50 to-white">
  <div className="max-w-6xl mx-auto px-6 text-center">
    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
      <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
        Visit Our Vietnam Office
      </span>
    </h2>
    <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">
      Strategically located in Nha Trang City, our Vietnam office supports operations, coordination, and distribution across the region.
    </p>

    <div className="max-w-3xl mx-auto bg-white border border-gray-200/50 shadow-xl rounded-3xl overflow-hidden transition-all hover:shadow-2xl">
      <div className="bg-gradient-to-br from-[#d4f4f0] via-[#f2f8fd] to-white p-10 relative">
        <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-teal-200 mb-6">
          <MapPin className="text-teal-600 w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Nha Trang City, Vietnam
        </h3>
        <p className="text-gray-600 text-base leading-relaxed mb-6">
          Lot NV05-06, Road No. 28,<br />
          Phuoc Long Urban Area,<br />
          Phuoc Long Ward,<br />
          Nha Trang City, Khanh Hoa Province
        </p>
        <a
          href="https://www.google.com/maps/place/12%C2%B012'53.9%22N+109%C2%B011'06.5%22E/@12.2149722,109.182564,17z/data=!3m1!4b1!4m4!3m3!8m2!3d12.2149722!4d109.1851389?entry=ttu&g_ep=EgoyMDI1MDcyMy4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
        >
          <ArrowRight className="w-4 h-4" />
          Get Directions
        </a>
      </div>
    </div>
  </div>
  
</section>



      {/* Business Hours */}
<section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-teal-900/20"></div>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="text-center mb-12">
      <h3 className="text-3xl font-bold text-white mb-4">Business Hours & Support</h3>
      <p className="text-gray-300 max-w-2xl mx-auto">
        We're here when you need us with comprehensive support during working hours.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 text-center">
        <Clock className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-white mb-4">Business Hours</h4>
        <div className="space-y-2 text-gray-300">
          <p>Monday - Friday: 8:00 AM - 5:00 PM ICT</p>
          <p>Saturday: 8:00 AM - 12:00 PM ICT</p>
          <p>Sunday: Closed</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 text-center">
        <MessageSquare className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-white mb-4">Customer Support</h4>
        <div className="space-y-2 text-gray-300">
          
          <p>Live Chat: Online during business hours</p>
          <p>Email: Replies within working hours</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 text-center">
        <Phone className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-white mb-4">Reach Us</h4>
        <div className="space-y-2 text-gray-300">
          <p>Call: +84 258 3888 388</p>
          <p>Email: info@food-empire.net</p>
          <p>We’re ready to help</p>
        </div>
      </div>
    </div>
  </div>
 




  
  

</section>
{isChatOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl relative">
      <button
        onClick={() => setIsChatOpen(false)}
        className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
        aria-label="Close Chat"
      >
        ×
      </button>
      <iframe
        src="https://www.chatbase.co/chatbot-iframe/09UYORqziZw2afP5UiUkA"
        width="100%"
        style={{ height: '700px' }}
        frameBorder="0"
        title="Live Chatbot"
      ></iframe>
    </div>
  </div>
)}

    </div>
  );
};

export default ContactPage;