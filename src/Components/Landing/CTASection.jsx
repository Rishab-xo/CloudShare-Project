import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { SocialProofAvatars } from '../ui/social-proof-avatars';
import { SignUpButton } from '@clerk/clerk-react';

const CTASection = ({
  title = "Ready to Transform Your Workflow?",
  description = "Join thousands of teams already using our platform to streamline their processes and boost productivity. Start your free trial today—no credit card required.",
  primaryButtonText = "Get Started Free",
  secondaryButtonText = "Schedule a Demo",
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-linear-to-br from-purple-100/30 via-white to-indigo-100/20 py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Floating icons */}
      <div className="absolute top-20 left-10 opacity-30 animate-bounce">
        <Sparkles className="w-8 h-8 text-purple-500" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-30 animate-bounce delay-300">
        <Zap className="w-8 h-8 text-indigo-500" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-purple-50 border border-purple-200/60 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Limited Time Offer</span>
        </div>

        {/* Main heading */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 bg-clip-text">
          {title}
        </h2>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          {description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <SignUpButton>
            <Button
            size="lg"
            className="group relative overflow-hidden px-8 py-6 text-lg font-semibold bg-purple-600 text-white rounded-2xl shadow-lg hover:bg-purple-700 hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              {primaryButtonText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          </SignUpButton>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <SocialProofAvatars />
            <span>10,000+ users</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-purple-600 text-purple-600"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span>4.9/5 rating</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span>Free 14-day trial</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
