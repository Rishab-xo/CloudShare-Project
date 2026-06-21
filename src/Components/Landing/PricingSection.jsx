import React from "react";
import { Check } from "lucide-react";
import { pricingPlans } from "../../assets/data";

const PricingSection = () => {
  return (
    <section className="py-20 bg-slate-50" id="pricing">
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Choose the plan that's right for you
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const isHighlighted = plan.highlighted;
            return (
              <div
                key={index}
                className={`flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                  isHighlighted
                    ? "border-2 border-purple-500 scale-105 z-10 shadow-md shadow-purple-100"
                    : "border border-gray-200 hover:border-purple-400"
                }`}
              >
                {/* Top Section */}
                <div className="p-6 relative">
                  {isHighlighted && (
                    <span className="absolute top-5 right-6 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1.5 min-h-8">
                    {plan.description}
                  </p>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-gray-900">
                      ₹{plan.price}
                    </span>
                  </div>
                </div>

                {/* Bottom Section with Features & Button */}
                <div className="flex-1 flex flex-col p-6 bg-gray-50/70 border-t border-gray-100">
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="text-purple-600 mr-2.5 h-4 w-4 shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-center transition-all duration-200 cursor-pointer ${
                      isHighlighted
                        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
                        : "border border-gray-200 text-purple-600 bg-white hover:bg-purple-600 hover:text-white hover:border-purple-600"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
