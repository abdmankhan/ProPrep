import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-md flex items-center justify-center text-white font-bold shadow-sm">
                <i className="fas fa-code"></i>
              </div>
              <span className="text-xl font-bold text-gray-900">
                PrepGenius
              </span>
            </div>
            <p className="mb-6 text-gray-600">
              Your all-in-one AI-powered platform for placement preparation,
              helping students land their dream jobs.
            </p>
            <div className="flex space-x-4">
              {["fa-twitter", "fa-facebook", "fa-linkedin", "fa-instagram"].map(
                (icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer text-gray-600 hover:text-indigo-600"
                  >
                    <i className={`fab ${icon}`}></i>
                  </a>
                )
              )}
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                "Home",
                "Features",
                "Pricing",
                "Testimonials",
                "Blog",
                "About Us",
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                "Learning Paths",
                "Community Forum",
                "Help Center",
                "API Documentation",
                "Career Resources",
                "FAQ",
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">
              Subscribe
            </h3>
            <p className="mb-4 text-gray-600">
              Get the latest updates and offers.
            </p>
            <div className="flex mb-4">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-gray-50 border-gray-200 text-gray-900 w-full rounded-l-md rounded-r-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-l-none !rounded-r-md text-white shadow-sm">
                Subscribe
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <i className="fas fa-shield-alt text-indigo-600 mr-2"></i>
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-lock text-indigo-600 mr-2"></i>
                <span className="text-sm text-gray-600">Privacy</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              {[
                "fa-cc-visa",
                "fa-cc-mastercard",
                "fa-cc-paypal",
                "fa-cc-apple-pay",
              ].map((icon, index) => (
                <i
                  key={index}
                  className={`fab ${icon} text-xl text-gray-400`}
                ></i>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © 2025 PrepGenius. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
