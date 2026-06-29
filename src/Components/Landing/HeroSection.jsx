import React from "react";
import { ImageSplit } from "@/components/ui/image-split";
import { GradientSlideButton } from "@/components/ui/gradient-slide-button";
import dashboard from "../../assets/dashboard.png"
import { SignInButton, SignUpButton } from "@clerk/clerk-react";

const HeroSection = () => {
  return (
    <div className="landing-page-content relative">
      <div className="relative inset-0 bg-linear-to-r from-purple-100 to-indigo-100 opacity-80 z-0">
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16 relative z-10">

          <div className="pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-35">
            <div className="text-center mt-10 lg:mt-13">

              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Share Files Securely with</span>
                <span className="block text-purple-500">Cloud Share</span>
              </h1>

              <p className="mt-3 max-w-md mx-auto text-base text-gray-700 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Upload, manage, and share your files securely. Accessible anywhere, anytime.
              </p>

              {/* Centered, locked-geometry button container */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">

                {/* Button 1: Solid Purple */}
                <SignUpButton mode="modal">
                  <button className="flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/25 transition-all hover:bg-purple-700 hover:shadow-purple-500/40 cursor-pointer">
                    Get Started
                  </button>
                </SignUpButton>

                {/* Button 2: Gradient Slide (Identical dimensions) */}
                <SignInButton mode="modal">
                  <GradientSlideButton className="flex items-center justify-center px-8 py-3.5 text-base font-semibold text-neutral-900 bg-white rounded-2xl shadow-lg shadow-black/5 transition-all hover:shadow-xl cursor-pointer">
                    Sign In
                  </GradientSlideButton>
                </SignInButton>

              </div>

            </div>
          </div>

          <div className="relative">

            <div className="mx-auto rounded-lg shadow-xl overflow-hidden  flex items-center justify-center">
              <ImageSplit src={dashboard} sections={9} />
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-black opacity-10 rounded-lg"></div>

          </div>

          <div className="mt-8 text-center">
            <p className="mt-4 text-base text-gray-700 font-semibold">
              All your files are Encrypted and stored securely with enterprise-grade security protocols.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;