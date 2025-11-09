'use client';

import { PremiumButton } from '@/components/ui/premium/button';
import { PremiumCard, PremiumCardContent, PremiumCardTitle, PremiumCardDescription, PremiumCardFooter } from '@/components/ui/premium/card';
import { PremiumInput } from '@/components/ui/premium/input';
import { PremiumBadge } from '@/components/ui/premium/badge';
import { Star, Users, Brain, Dumbbell, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function NewDesignSystemPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen antialiased overflow-x-hidden text-white bg-neutral-950">
      {/* Fixed Background with Parallax Blur - from HTML */}
      <div
        className="fixed top-0 w-full -z-10 h-screen bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop)',
          filter: 'blur(0px)',
        }}
      />

      {/* Gradient Overlay */}
      <div
        className="fixed top-0 w-full -z-10 h-screen"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 0.95))',
        }}
      />

      {/* Header - from HTML */}
      <header
        className="relative z-50"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.5), transparent)' }}
      >
        <div className="lg:px-8 max-w-7xl mx-auto px-6">
          <div className="flex pt-6 pb-6 items-center justify-between">
            <div className="text-xl font-bold text-white">
              DERRIMUT 24:7
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#" className="text-sm font-normal text-white/80 hover:text-white/90 transition">
                Programs
              </a>
              <a href="#" className="text-sm font-normal text-white/80 hover:text-white/90 transition">
                Coaches
              </a>
              <a href="#" className="text-sm font-normal text-white/80 hover:text-white/90 transition">
                Pricing
              </a>
              <PremiumButton variant="primary">
                Join Now
              </PremiumButton>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32">
        <div className="lg:px-8 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <PremiumBadge className="mb-6">Premium Wellness Design System</PremiumBadge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Your Goals,
              <br />
              <span className="text-white/90">Your Fitness Journey</span>
            </h1>

            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Experience the new premium wellness lifestyle platform with sophisticated glassmorphism,
              elegant typography, and smooth animations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <PremiumButton variant="primary" className="px-8 py-3">
                <Brain className="w-5 h-5" />
                Get Started
              </PremiumButton>
              <PremiumButton variant="outline" className="px-8 py-3">
                View Components
                <ArrowRight className="w-4 h-4" />
              </PremiumButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Brain, label: 'AI Generations', value: '300+' },
                { icon: Users, label: 'Expert Trainers', value: '30+' },
                { icon: Star, label: 'Community', value: '1000+' },
                { icon: Dumbbell, label: 'Gym Access', value: '24/7' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <stat.icon className="w-6 h-6 text-white/80 mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Component Showcase */}
      <section className="relative z-10 py-24 bg-neutral-950/50">
        <div className="lg:px-8 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Design System Components
            </h2>
            <p className="text-white/70 text-lg">
              Glassmorphism, typography, and premium aesthetics from the HTML references
            </p>
          </div>

          {/* Buttons Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-white mb-8">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <PremiumButton variant="primary">Primary Button</PremiumButton>
              <PremiumButton variant="ghost">Ghost Button</PremiumButton>
              <PremiumButton variant="outline">Outline Button</PremiumButton>
              <PremiumButton variant="primary" fullWidth className="sm:w-auto">
                <Calendar className="w-4 h-4" />
                With Icon
              </PremiumButton>
            </div>
          </div>

          {/* Badges Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-white mb-8">Badges</h3>
            <div className="flex flex-wrap gap-3">
              <PremiumBadge>Default Badge</PremiumBadge>
              <PremiumBadge variant="success">Success</PremiumBadge>
              <PremiumBadge variant="warning">Warning</PremiumBadge>
              <PremiumBadge variant="error">Error</PremiumBadge>
            </div>
          </div>

          {/* Input Section */}
          <div className="mb-16 max-w-md">
            <h3 className="text-2xl font-semibold text-white mb-8">Form Inputs</h3>
            <PremiumInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              helpText="We'll never share your email with anyone else."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PremiumInput
              label="Password"
              type="password"
              placeholder="Enter your password"
            />
            <PremiumInput
              label="Error Example"
              type="text"
              placeholder="This field has an error"
              error="This field is required"
            />
          </div>

          {/* Cards Grid */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-white mb-8">Premium Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Strength Training',
                  description: 'Build muscle and increase your overall strength with progressive overload',
                  category: 'Strength',
                  duration: '8 weeks',
                  rating: 4.8,
                },
                {
                  title: 'HIIT Cardio',
                  description: 'High-intensity interval training for maximum fat burn and endurance',
                  category: 'Cardio',
                  duration: '6 weeks',
                  rating: 4.9,
                },
                {
                  title: 'Yoga & Flexibility',
                  description: 'Improve flexibility, balance, and mindfulness through yoga practice',
                  category: 'Flexibility',
                  duration: '4 weeks',
                  rating: 4.7,
                },
              ].map((program) => (
                <PremiumCard key={program.title} hover>
                  <PremiumCardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <PremiumBadge>{program.category}</PremiumBadge>
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span>{program.rating}</span>
                      </div>
                    </div>

                    <PremiumCardTitle>{program.title}</PremiumCardTitle>
                    <PremiumCardDescription>{program.description}</PremiumCardDescription>

                    <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
                      <Calendar className="w-3 h-3" />
                      <span>{program.duration}</span>
                    </div>
                  </PremiumCardContent>

                  <PremiumCardFooter>
                    <PremiumButton variant="primary" fullWidth>
                      View Program
                    </PremiumButton>
                  </PremiumCardFooter>
                </PremiumCard>
              ))}
            </div>
          </div>

          {/* Glassmorphism Examples */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-white mb-8">Glassmorphism Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-2">Subtle Glass</h4>
                <p className="text-sm text-white/70">bg-white/5 + backdrop-blur-sm</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-lg p-6 backdrop-blur-md">
                <h4 className="text-lg font-semibold text-white mb-2">Medium Glass</h4>
                <p className="text-sm text-white/70">bg-white/10 + backdrop-blur-md</p>
              </div>
              <div className="bg-white/15 border border-white/20 rounded-lg p-6 backdrop-blur-lg">
                <h4 className="text-lg font-semibold text-white mb-2">Strong Glass</h4>
                <p className="text-sm text-white/70">bg-white/15 + backdrop-blur-lg</p>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-white mb-8">Typography System</h3>
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Hero Heading</h1>
                <p className="text-sm text-white/50">text-5xl font-bold</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Section Heading</h2>
                <p className="text-sm text-white/50">text-3xl font-bold</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Card Title</h3>
                <p className="text-sm text-white/50">text-xl font-semibold</p>
              </div>
              <div>
                <p className="text-base text-white/80 mb-2">Body text with good readability</p>
                <p className="text-sm text-white/50">text-base text-white/80</p>
              </div>
              <div>
                <p className="text-sm text-white/70 mb-2">Secondary text for descriptions</p>
                <p className="text-sm text-white/50">text-sm text-white/70</p>
              </div>
            </div>
          </div>

          {/* Color System */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-white mb-8">Color System</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-white/5 border border-white/10 rounded-lg"></div>
                <p className="text-sm text-white/70">Glass Subtle</p>
                <code className="text-xs text-white/50">bg-white/5</code>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-white/10 border border-white/15 rounded-lg"></div>
                <p className="text-sm text-white/70">Glass Medium</p>
                <code className="text-xs text-white/50">bg-white/10</code>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-white/15 border border-white/20 rounded-lg"></div>
                <p className="text-sm text-white/70">Glass Strong</p>
                <code className="text-xs text-white/50">bg-white/15</code>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-neutral-950 border border-white/10 rounded-lg"></div>
                <p className="text-sm text-white/70">Background</p>
                <code className="text-xs text-white/50">bg-neutral-950</code>
              </div>
            </div>
          </div>

          {/* Features Grid - Real Example */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-8">Features Showcase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: 'AI-Powered Plans',
                  description: 'Personalized workout and nutrition plans generated by advanced AI algorithms',
                  features: ['Custom routines', 'Nutrition guidance', 'Goal tracking'],
                },
                {
                  icon: Users,
                  title: 'Expert Trainers',
                  description: '30+ certified trainers ready to guide you on your fitness journey',
                  features: ['Real-time booking', 'Video sessions', '4.8+ ratings'],
                },
                {
                  icon: Dumbbell,
                  title: '24/7 Access',
                  description: 'Premium equipment and facilities available around the clock',
                  features: ['State-of-art gym', 'All locations', 'Premium equipment'],
                },
              ].map((feature) => (
                <PremiumCard key={feature.title} hover elevated>
                  <PremiumCardContent>
                    <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white/80" />
                    </div>

                    <PremiumCardTitle>{feature.title}</PremiumCardTitle>
                    <PremiumCardDescription>{feature.description}</PremiumCardDescription>

                    <ul className="space-y-2">
                      {feature.features.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </PremiumCardContent>
                </PremiumCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="lg:px-8 max-w-7xl mx-auto px-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-md">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Experience Premium Wellness?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Join 1000+ members who are already crushing their fitness goals with our
              sophisticated platform and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton variant="primary" className="px-8 py-3">
                Start Your Journey
              </PremiumButton>
              <PremiumButton variant="outline" className="px-8 py-3">
                View Documentation
              </PremiumButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - from HTML */}
      <footer className="bg-neutral-950 border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">About</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Locations</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Programs</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Training</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Nutrition</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Coaches</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Blog</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Recipes</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Privacy</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white/90 transition">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/50">
              © 2025 Derrimut 24:7. All rights reserved. Premium Wellness Design System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
