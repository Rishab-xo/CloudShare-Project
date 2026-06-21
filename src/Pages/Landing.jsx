import React from 'react'
import HeroSection from '../Components/Landing/HeroSection'
import FeaturesSection from '../Components/Landing/FeaturesSection'
import PricingSection from '../Components/Landing/PricingSection'
import TestimonialsSection from '../Components/Landing/TestimonialsSection'
import CTASection from '../Components/Landing/CTASection'
import Footer from '../Components/Landing/Footer'
import CardNav from '../Components/Landing/CardNav'
import { features } from '@/assets/data'


const Landing = () => {
  const navItems = [
    {
      label: "Workspace",
      bgColor: "#1B1722",
      textColor: "#fff",
      links: [
        { label: "Dashboard", href: "/dashboard", ariaLabel: "Dashboard" },
        { label: "My Files", href: "/my-files", ariaLabel: "My Files" },
        { label: "Upload File", href: "/upload", ariaLabel: "Upload" }
      ]
    },
    {
      label: "Billing", 
      bgColor: "#2F293A",
      textColor: "#fff",
      links: [
        { label: "Subscription", href: "/subscription", ariaLabel: "Subscription Plans" },
        { label: "Transactions", href: "/transactions", ariaLabel: "Transaction History" }
      ]
    }
  ];

  return (

    <div className='landing-page relative'>
      {/* Top Navigation */}
      <CardNav
        items={navItems}
        baseColor="#ffffff"
        menuColor="#6b21a8"
        buttonBgColor="#6b21a8"
        buttonTextColor="#ffffff"
        ease="power3.out"
      />

      {/* Hero Section */}
      <HeroSection />


      {/* Features Section */}
      <FeaturesSection features={features} />


      {/* Pricing Section */}
      <PricingSection />


      {/* Testimonials Section */}
      <TestimonialsSection />


      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>

  )
}

export default Landing
