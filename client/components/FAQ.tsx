"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "What is Homyvo?",
    answer: [
      "Homyvo is a premium rental platform in Tamil Nadu.",
      "It connects tenants with verified property owners directly.",
      "We focus on PGs, Apartments, and Commercial Spaces."
    ]
  },
  {
    question: "How is it different from other platforms?",
    answer: [
      "Direct owner-tenant connection with zero brokerage.",
      "AI-driven recommendations tailored to your preferences.",
      "Radar and GPS-based 'Nearest to Me' property discovery."
    ]
  },
  {
    question: "How do I search for a property near me?",
    answer: [
      "Navigate to any category and use the Sort by 'Nearest to Me' filter.",
      "Grant location access to let the system automatically detect distance.",
      "Or use the search bar to enter specific localities."
    ]
  },
  {
    question: "Are the listings verified?",
    answer: [
      "Yes, we highly prioritize verified listings.",
      "Owners submit documents for trust verification.",
      "Verified properties carry a distinct blue badge on their cards."
    ]
  },
  {
    question: "Is it completely free for tenants?",
    answer: [
      "Browsing properties and viewing basic details is free.",
      "You do not pay any brokerage commissions.",
      "Unlocking direct owner contact numbers might require a small platform fee depending on the property."
    ]
  },
  {
    question: "Can I list my PG or Commercial space here?",
    answer: [
      "Absolutely. We have dedicated categories for Student PGs and Commercial Spaces.",
      "Simply create an Owner account and click 'Add Property'.",
      "Listings go live instantly after you fill out the details."
    ]
  },
  {
    question: "How does the matching algorithm work?",
    answer: [
      "It evaluates your preferences, budget, and location.",
      "It cross-references the amenities you care about most.",
      "The highest scoring properties are shown first in 'Recommended' views."
    ]
  },
  {
    question: "Can I save a property for later?",
    answer: [
      "Yes, simply click the Heart icon on any property card.",
      "This adds it to your personal Wishlist.",
      "You can review your saved properties at any time from the bottom navigation."
    ]
  },
  {
    question: "How do I contact the property owner?",
    answer: [
      "Open the property details page by tapping the card.",
      "Click the 'Contact Owner' button at the bottom.",
      "Depending on the property, you'll immediately see the contact numbers."
    ]
  },
  {
    question: "What areas do you cover?",
    answer: [
      "Currently, we have strong coverage across Tamil Nadu.",
      "Major cities include Coimbatore, Chennai, and Madurai.",
      "We are constantly expanding to new areas every week."
    ]
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mb-6">
      <div className="mb-3 mt-4">
        <h2 className="text-lg font-bold text-[#111827]">Frequently Asked Questions</h2>
        <p className="text-sm text-[#6B7280]">Everything you need to know about Homyvo</p>
      </div>
      <div className="flex flex-col gap-2">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden transition-all duration-300"
          >
            <button 
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            >
              <span className="font-semibold text-sm text-[#111827] pr-4">{faq.question}</span>
              <div className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-4 pt-0 text-sm text-[#6B7280]">
                <ul className="list-disc list-outside ml-4 space-y-1.5">
                  {faq.answer.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
