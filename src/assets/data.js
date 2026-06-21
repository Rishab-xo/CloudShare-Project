export const features = [
  {
    iconName: "ArrowUpCircle",
    iconColor: "text-purple-500",
    title: "Easy File Upload",
    description: "Quickly upload your files with our intuitive drag-and-drop interface."
  },
  {
    iconName: "Shield",
    iconColor: "text-green-500",
    title: "Secure Storage",
    description: "Your files are encrypted and stored securely in our cloud infrastructure."
  },
  {
    iconName: "Share2",
    iconColor: "text-purple-500",
    title: "Simple Sharing",
    description: "Share files with anyone using secure links that you control."
  },
  {
    iconName: "CreditCard", 
    iconColor: "text-indigo-500",
    title: "Transaction History",
    description: "Keep track of all your credit purchases and usage."
  },
  // --- NEW FEATURES ADDED BELOW ---
  {
    iconName: "Users",
    iconColor: "text-blue-500",
    title: "Team Workspaces",
    description: "Create dedicated spaces for teams to collaborate and share files seamlessly."
  },
  {
    iconName: "Activity",
    iconColor: "text-rose-500",
    title: "Detailed Analytics",
    description: "Track who views and downloads your files with comprehensive activity logs."
  }
];

export const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "50 file uploads",
      "Basic file sharing",
      "7-day file retention",
      "Email support"
    ],
    cta: "Get Started",
    highlighted: false
  },
  {
    name: "Premium",
    price: "500", 
    description: "For individuals with larger needs",
    features: [
      "500 file uploads",
      "Advanced file sharing",
      "30-day file retention",
      "Priority email support",
      "File analytics"
    ],
    cta: "Go Premium",
    highlighted: true
  },
  {
    name: "Ultimate", 
    price: "2500",
    description: "For teams and businesses",
    features: [
      "5000 file uploads",
      "Team sharing capabilities",
      "Unlimited file retention",
      "24/7 priority support",
      "Advanced analytics",
      "API access"
    ],
    cta: "Go Ultimate",
    highlighted: false
  }
];

export const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "CreativeMinds Inc.",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    quote: "CloudShare has transformed how our team collaborates on creative assets. The secure sharing and tools are unmatched.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Freelance Designer",
    company: "Self-employed",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    quote: "As a freelancer, I need to share large design files with clients securely. CloudShare's simple interface does exactly that.",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Project Manager",
    company: "TechSolutions Ltd.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    quote: "Managing project files across multiple teams used to be a nightmare until we found CloudShare.",
    rating: 4
  },
  // --- NEW TESTIMONIALS ADDED BELOW ---
  {
    name: "David Lee",
    role: "Lead Developer",
    company: "DevSync",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "The API is incredibly robust. We integrated CloudShare into our internal tools in less than a day.",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Content Creator",
    company: "MediaFlow",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "I send large video files daily. CloudShare's upload speeds and reliability have been a total game-changer.",
    rating: 5
  }
];

// --- BRAND NEW ARRAY ADDED BELOW ---
export const faqs = [
  {
    question: "How secure is my data on CloudShare?",
    answer: "We use enterprise-grade end-to-end encryption for all files in transit and at rest. Your data is entirely private and accessible only by you and the people you share it with."
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer: "Absolutely. You can change your subscription plan from your dashboard at any moment. Prorated charges or credits will be applied automatically to your next billing cycle."
  },
  {
    question: "Is there a maximum file size limit for uploads?",
    answer: "Free users can upload files up to 2GB in size. Pro users enjoy an increased limit of 10GB per file, and Ultimate users can upload files as large as 50GB."
  }
];