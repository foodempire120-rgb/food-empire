import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Globe, Target, Zap, Shield, Heart, TrendingUp, CheckCircle, ArrowRight, Building, Calendar, MapPin, Star } from 'lucide-react';
import { Clock, Menu } from "lucide-react";
import { Sparkles } from 'lucide-react';
import GlobalToVietnamMap from '../components/GlobalToVietnamMap';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BsChatDotsFill } from "react-icons/bs";
import { useEffect } from 'react';




const AboutPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true
    });
  }, []);
  const milestones = [
    { year: "2006", title: "Company Founded", description: "Started with a vision to revolutionize food distribution" },
    { year: "2010", title: "First AI Implementation", description: "Pioneered AI-powered logistics in food industry" },
    { year: "2015", title: "Global Expansion", description: "Expanded operations to 15 countries worldwide" },
    { year: "2018", title: "Blockchain Integration", description: "First food distributor to implement blockchain traceability" },
    { year: "2020", title: "Carbon Neutral", description: "Achieved carbon neutrality across all operations" },
    { year: "2024", title: "Industry Leader", description: "Serving 2,500+ partners with 99.9% success rate" }
  ];

  const team = [
    {
      name: "Alishan Zafar",
      role: "Chief Executive Officer",
      experience: "18+ years of experience",
      image: "/Images/alishan.jpg",
      bio: "Experienced executive in the multiple industries, known for driving growth and leading high-performing teams at top global companies."
    },
    {
      name: "Truong Thi Thu Lieu",
      role: "Sales Director",
      experience: "12+ years of experience",
      image: "/Images/truong.jpg",
      bio: "Leads strategic sales initiatives and builds strong client relationships to drive business growth."
    },

  ];


  const values = [
    {
      // ✔ Represents trust, standards
      title: "Quality First",
      description: "Uncompromising commitment to food safety and quality standards in every aspect of our operations.",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      // ✨ Represents innovation, creativity
      title: "Innovation",
      description: "Pioneering cutting-edge technology solutions to transform the food distribution industry.",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      // Performance + growth visual
      title: "Operational Excellence",
      description: "Driven by precision, consistency, and efficiency in every step of our distribution process.",
      gradient: "from-green-600 to-emerald-600"
    },
    {

      title: "Partnership",
      description: "Building long-term relationships based on trust, reliability, and mutual success.",
      gradient: "from-orange-600 to-red-600"
    }
  ];

  const stats = [

    { number: "Timely", label: " Delivery ", icon: <Clock className="w-8 h-8" /> },
    { number: "Multiple", label: "Product Items Available", icon: <Menu className="w-8 h-8" /> },
    { number: "100%", label: "Quality Guaranteed", icon: <CheckCircle className="w-8 h-8" /> }
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
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">


            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up delay-200">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Pioneering the Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
                Food Distribution
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Food Empire is redefining food distribution through smart technology, a focus on quality, and a commitment to responsible sourcing.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 justify-items-center stagger-children">

            {stats.map((stat, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200/50 card-animate text-center gpu-accelerated w-72"
              >

                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 hover-rotate animate-float">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-20 bg-gradient-to-br from-white to-gray-50"
        data-aos="fade-up"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Title placed above the flex layout so it doesn't affect height match */}
          <h2 className="text-4xl font-bold mb-16 text-center animate-fade-in-up">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Our Mission & Vision
            </span>
          </h2>

          <div className="flex flex-col md:flex-row gap-16 items-stretch">

            {/* Left: Mission & Vision Cards only */}
            <div className="flex flex-col justify-between flex-1 h-full">
              <div className="space-y-8 h-full">
                {/* Mission */}
                <div className="group p-8 bg-white rounded-3xl shadow-xl border border-gray-200/50 card-animate">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center hover-rotate">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Mission</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    To revolutionize food distribution through innovative technology, ensuring fresh,
                    safe, and sustainable food reaches every table while supporting our partners' success.
                  </p>
                </div>

                {/* Vision */}
                <div className="group p-8 bg-white rounded-3xl shadow-xl border border-gray-200/50 card-animate">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center hover-rotate">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Vision</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    To be the global leader in intelligent food distribution, setting new standards
                    for quality, sustainability, and technological innovation in the industry.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Image perfectly matching cards' height */}
            <div className="flex-1">
              <div className="relative h-full">
                <img
                  src="/Images/premium.jpg"
                  alt="Food Empire facility"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Values */}
      <section
        className="py-24 bg-gradient-to-br from-white to-gray-50"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent animate-fade-in-up">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
              The foundation of everything we do—ensuring integrity, innovation, and excellence in every action.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-emerald-100/50 overflow-hidden"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                {/* Glowing hover background overlay */}
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-500"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm text-center leading-relaxed">{value.description}</p>
                </div>
              </div>

            ))}
          </div>
        </div>
      </section>


      {/* Why Choose Food Empire Section */}
      <section
        className="py-24 bg-gradient-to-br from-white to-gray-50"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent animate-fade-in-up">
              Why Choose Food Empire?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
              Discover what makes Food Empire the trusted leader in high-quality food delivery — from cutting-edge technology to uncompromising quality standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                title: "Timely Delivery",
                description:
                  "We ensure your beef, lamb, fries, and other products are delivered in perfect condition with guaranteed timely delivery."
              },
              {
                title: "Certified Quality",
                description:
                  "Hand-selected ingredients from certified suppliers with blockchain traceability ensuring authenticity and safety."
              },
              {
                title: "Carefully Packaged",
                description:
                  "Every order is securely packed using insulated materials to maintain quality from our facility to your doorstep."
              },
              {
                title: "Customer Satisfaction",
                description:
                  "Our commitment to excellence is reflected in every order we deliver, earning the trust of customers across the region."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-3xl border border-gray-200 shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm overflow-hidden gpu-accelerated"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-500"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Target Customers Section */}
      <section
        className="py-24 bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden"
        data-aos="fade-up"
        data-aos-delay="300"
      >

        <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-10 animate-fade-in-up">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Who We Serve?
            </span>
          </h2>

          <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-12 animate-fade-in-up delay-200">
            We proudly serve the HORECA sector — <span className="font-semibold text-gray-900">Hotels, Restaurants, and Catering</span> — along with large resorts, hospitality chains, catering services, and online retail platforms. Our tailored solutions ensure high-volume, high-quality supply with precision and care.
          </p>

          <div className="flex items-center justify-center space-x-6 animate-fade-in-up delay-400">
            <div className="flex items-center bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-3xl shadow-lg">
              <Target className="w-6 h-6 mr-3 text-white" />
              <span className="font-semibold text-lg">HORECA Focus</span>
            </div>
            <div className="flex items-center bg-gradient-to-br from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-3xl shadow-lg">
              <Globe className="w-6 h-6 mr-3 text-white" />
              <span className="font-semibold text-lg">Wholesale Clients</span>
            </div>
          </div>
        </div>
      </section>
      {/* Leadership Team */}
      <section
        className="py-24 bg-gradient-to-br from-gray-50 to-white"
        data-aos="fade-up"
        data-aos-delay="400"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 animate-fade-in-up">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
              Meet the visionary leaders driving Food Empire’s innovation and global growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {team.map((member, index) => (
              <div
                key={index}
                className="group relative bg-white p-10 rounded-3xl shadow-xl border border-gray-100 hover:border-emerald-400/30 hover:shadow-emerald-100/40 transition-all duration-300 transform hover:-translate-y-2 text-center gpu-accelerated"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-top object-cover rounded-full border-4 border-white shadow-md group-hover:rotate-[1.5deg] transition-transform duration-300"
                  />

                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse-smooth"></div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-emerald-600 font-medium mb-3">{member.role}</p>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>

                <div className="inline-block bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wide shadow-sm">
                  {member.experience}
                </div>

                <div className="mt-6 h-1 w-16 mx-auto bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full group-hover:w-24 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GlobalToVietnamMap />



      {/* Global Presence */}
      <section
        className="py-20 bg-gradient-to-br from-white to-gray-50"
        data-aos="fade-up"
        data-aos-delay="500"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Global Presence
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
              A growing group of dynamic companies led by Alishan Zafar, committed to quality, innovation, and expansion across international markets.
            </p>
          </div>


          <div className="max-w-4xl mx-auto animate-fade-in-left">
            <div className="space-y-12">
              {/* Our Companies */}
              <div className="group">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Business Portfolio</h3>
                <div className="space-y-4">
                  {/* Blue Focus */}
                  {/* Blue Focus */}
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-smooth flex-shrink-0"></div>

                    <div className="w-32 h-32 flex items-center justify-center flex-shrink-0">
                      <img
                        src="/Images/bluefocus.png"
                        alt="Blue Focus Logo"
                        className="w-full h-full object-contain scale-150"
                      />

                    </div>

                    <span className="text-gray-700">
                      <strong>Blue Focus</strong> — Dubai, established in 2012, operating across multiple industries
                    </span>
                  </div>





                  {/* Greek Souvlaki */}
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-smooth flex-shrink-0"></div>

                    <div className="w-20 h-20 flex items-center justify-center flex-shrink-0">
                      <img
                        src="/Images/greek-logo.png"
                        alt="Greek Souvlaki Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <span className="text-gray-700">
                      <strong>Greek Souvlaki</strong> — European-based food brand with a focus on refined taste and quality
                    </span>
                  </div>


                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section
        className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden"
        data-aos="fade-up"
        data-aos-delay="600"
      >

        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 animate-gradient"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Partner with Industry Leaders?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Join thousands of satisfied partners who trust Food Empire for their distribution needs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-400">
            <Link
              to="/contact"
              className="group bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg btn-animate hover-glow flex items-center space-x-3"
            >
              <span>Start Partnership</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/careers"
              className="group bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg border-2 border-white/20 btn-animate hover-lift"
            >
              Join Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;