/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';

const ContactSection = () => {
  return (
    <div className="mt-20 px-4">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-[#1E2203]">Contact Us</h2>
        <p className="mt-4 text-gray-600">
          Our customer service team is available to help you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <ContactCard
          icon="email"
          title="Email"
          description="For business inquiries, please contact our sales department."
          contact="info@example.com"
        />
        <ContactCard
          icon="phone"
          title="Phone"
          description="Connect with us on social media for updates and promotions."
          contact="+123-456-7890"
        />
        <ContactCard
          icon="location"
          title="Office"
          description="We value your feedback and strive to improve our services."
          contact="123 Main Street, City, Country"
        />
      </div>

      <div className="max-w-4xl mx-auto mt-16 p-8 bg-[#E6E1D7] rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1E2203]">
              Subscribe to our newsletter
            </h3>
            <p className="text-sm text-gray-600">
              Get the latest updates on new features and product releases.
            </p>
          </div>
          <div className="flex-1 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#9ebf3f] focus:outline-none"
              />
              <button className="px-6 py-2 bg-[#9ebf3f] text-white rounded-lg hover:bg-[#8ba835] transition-colors duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({ icon, title, description, contact }) => {
  const icons = {
    email: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    phone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    ),
    location: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </>
    ),
  };

  return (
    <div className="bg-[#E6E1D7] rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <svg
          className="w-8 h-8 text-[#9ebf3f]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icons[icon]}
        </svg>
      </div>
      <h3 className="text-lg font-bold text-[#1E2203]">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <p className="text-[#9ebf3f]">{contact}</p>
    </div>
  );
};

export default ContactSection;
