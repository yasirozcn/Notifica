/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';

const PricingPlans = ({ activePlan, setActivePlan }) => {
  const plans = [
    {
      name: 'Basic plan',
      price: 9.99,
      yearlyPrice: 99.99,
      features: [
        'Unlimited train ticket alarms',
        'Basic support',
        'Standard class only',
      ],
      buttonStyle: 'border-2 border-[#9ebf3f] text-[#9ebf3f]',
      bgColor: '',
    },
    {
      name: 'Business plan',
      price: 19.99,
      yearlyPrice: 199.99,
      features: [
        'Unlimited train ticket alarms',
        'Priority support',
        'Standard and Business class options',
        'Feature text goes here',
      ],
      buttonStyle: 'bg-[#9ebf3f] text-white',
      bgColor: 'bg-[#E6E1D7]',
      scale: true,
    },
    {
      name: 'Enterprise plan',
      price: 29.99,
      yearlyPrice: 299.99,
      features: [
        'Unlimited train ticket alarms',
        '24/7 premium support',
        'Standard and Business class options',
        'Feature text goes here',
      ],
      buttonStyle: 'bg-[#9ebf3f] text-white',
      bgColor: 'bg-[#BFB69B]',
    },
  ];

  return (
    <div className="w-full mt-20 px-4 md:px-8">
      <div className="text-center mb-8">
        <h2 className="text-black text-l">Choose the perfect plan for you</h2>
        <h1 className="text-black text-2xl font-bold mt-2">Pricing plan</h1>
        <p className="text-gray-600 mt-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 border-[#1E2203] rounded-full p-1 inline-flex">
          <button
            className={`px-6 py-2 rounded-full ${
              activePlan === 'monthly'
                ? 'bg-[#9ebf3f] text-white'
                : 'text-gray-600'
            }`}
            onClick={() => setActivePlan('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-full ${
              activePlan === 'yearly'
                ? 'bg-[#9ebf3f] text-white'
                : 'text-gray-600'
            }`}
            onClick={() => setActivePlan('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`border border-[#1E2203] rounded-lg p-6 ${plan.bgColor} ${
              plan.scale ? 'transform scale-105' : ''
            } shadow-sm`}
          >
            <h3 className="text-xl text-[#1E2203] font-bold">{plan.name}</h3>
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#1E2203]">
                ${activePlan === 'monthly' ? plan.price : plan.yearlyPrice}
              </span>
              <span className="text-gray-600">
                /{activePlan === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            <ul className="mt-6 space-y-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-[#1E2203]">
                  <svg
                    className="w-5 h-5 text-[#9ebf3f] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full mt-8 py-2 px-4 ${plan.buttonStyle} rounded-lg hover:bg-[#8ba835] hover:text-white transition-colors duration-200`}
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans;
