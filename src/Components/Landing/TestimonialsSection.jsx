import React from 'react'
import { TestimonialsSection as TestimonialsUI } from '../ui/simple-animated-testimonials'
import { testimonials } from '@/assets/data'

const TestimonialsSection = () => {
  // Map standard database/data properties to schema expected by TestimonialsUI
  const formattedTestimonials = testimonials.map((t, idx) => ({
    id: idx + 1,
    name: t.name,
    role: t.role,
    company: t.company,
    content: t.quote,
    rating: t.rating || 5,
    avatar: t.image
  }))

  return (
    <TestimonialsUI
      title="Trusted by Creators Worldwide"
      subtitle="Hear how CloudShare simplifies secure file storage, sharing, and team workspaces for professionals."
      testimonials={formattedTestimonials}
    />
  )
}

export default TestimonialsSection
