"use client";
import React from 'react';
import { Link } from "react-router-dom";
import { Icons } from "./icons";
import { Button } from "./button";

function Footer() {
  return (
    <footer className="py-16 px-6 md:px-8 bg-white border-t border-gray-100">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center gap-2 text-purple-600">
              <Icons.logo className="icon-class w-8 text-purple-600" />
              <h2 className="text-xl font-bold tracking-tight text-gray-900">CloudShare</h2>
            </Link>

            <h1 className="text-gray-500 mt-4 text-sm">
              Secure file sharing and workspaces.
            </h1>
            <div className="mt-4">
              <Link to="/subscription">
                <Button variant='outline' className="border-gray-200 text-purple-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200">
                  Upgrade Plan
                  <Icons.logo className="icon-class ml-1 w-3.5" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-6">
              © {new Date().getFullYear()} CloudShare. All rights reserved.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Pages</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/my-files" className="text-gray-600 hover:text-purple-600 transition-colors">
                    My Files
                  </Link>
                </li>
                <li>
                  <Link to="/upload" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Upload
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Account</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/subscription" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Pricing Plans
                  </Link>
                </li>
                <li>
                  <Link to="/transactions" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Transactions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Large Watermark Text */}
        <div className="w-full flex mt-12 items-center justify-center">
          <h1 className="text-center text-5xl md:text-8xl lg:text-[8rem] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-purple-300 to-purple-500 select-none">
            CloudShare
          </h1>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
