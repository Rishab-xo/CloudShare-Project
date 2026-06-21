"use client"

import React, { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { motion, useAnimation, useInView } from "framer-motion"

export function TestimonialsSection({
  title = "Loved by Developers",
  subtitle = "See what others are saying about our premium starter template",
  testimonials = [],
  autoRotateInterval = 6000,
  showVerifiedBadge = true,
  trustedCompanies = [],
  trustedCompaniesTitle = "Trusted by teams at these companies and more",
  className,
}) {
  // State for active testimonial
  const [activeIndex, setActiveIndex] = useState(0)

  // Refs for scroll animations
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const controls = useAnimation()

  // Automatically cycle through testimonials
  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [testimonials.length, autoRotateInterval])

  // Trigger animations when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  // Handlers for navigation
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="testimonials-alt"
      className={cn("py-16 md:py-32 relative overflow-hidden flex justify-center", className)}
    >
      <div className="container items-center px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center mb-12 space-y-4"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
            {title}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-gray-500 max-w-[700px] mx-auto md:text-xl/relaxed">
            {subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="md:grid md:grid-cols-[1fr_auto] gap-8 items-center max-w-[800px] mx-auto"
        >
          <motion.div variants={itemVariants} className="relative w-full">
            <div className="absolute -top-6 -left-6 z-10">
              <Quote className="h-12 w-12 text-purple-200" strokeWidth={1} />
            </div>

            {/* Testimonial cards */}
            <div className="relative h-[340px] md:h-[260px] w-full">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={testimonial.id}
                  className={cn(
                    "absolute inset-0 transition-all duration-500 border bg-white rounded-2xl",
                    index === activeIndex
                      ? "opacity-100 translate-x-0 shadow-lg"
                      : "opacity-0 translate-x-[100px] pointer-events-none",
                  )}
                >
                  <CardContent className="p-6 md:p-8 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-purple-100">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">
                            {testimonial.role}, {testimonial.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    <Separator className="my-4 bg-gray-100" />

                    <p className="flex-1 italic text-base/relaxed text-gray-700">"{testimonial.content}"</p>

                    {showVerifiedBadge && (
                      <div className="mt-4 text-xs text-right text-gray-400">Verified Customer</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Navigation buttons */}
          <motion.div variants={itemVariants} className="flex md:flex-col gap-4 justify-center mt-8 md:mt-0 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-10 w-10 border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 flex items-center justify-center"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex md:flex-col gap-2 items-center justify-center">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors cursor-pointer",
                    index === activeIndex ? "bg-purple-600" : "bg-gray-300",
                  )}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveIndex(index)
                    }
                  }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-10 w-10 border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 flex items-center justify-center"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Logo cloud */}
        {trustedCompanies.length > 0 && (
          <motion.div variants={itemVariants} className="mt-20 pt-10 border-t border-gray-100 max-w-4xl mx-auto">
            <h3 className="text-sm font-medium text-gray-400 text-center mb-8">{trustedCompaniesTitle}</h3>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
              {trustedCompanies.map((company) => (
                <div key={company} className="text-2xl font-semibold text-gray-400/50 hover:text-purple-600/50 transition-colors cursor-default">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
