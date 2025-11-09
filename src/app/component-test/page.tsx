'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ComponentTestPage() {
  return (
    <div className="min-h-screen bg-neutral-950 p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-semibold text-white mb-4">Component Migration Test</h1>
          <p className="text-white/60">Testing migrated components with new design system</p>
        </div>

        {/* Button Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="tertiary">Tertiary Button</Button>
            <Button variant="primary" size="sm">Small Primary</Button>
            <Button variant="secondary" size="lg">Large Secondary</Button>
          </div>
        </section>

        {/* Card Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="standard">
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>This is a standard card with basic glassmorphism</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">Standard card content with bg-white/5 and border-white/10</p>
              </CardContent>
              <CardFooter>
                <Button variant="tertiary">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="premium">
              <CardHeader>
                <CardTitle>Premium Card</CardTitle>
                <CardDescription>This is a premium card with border-gradient effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">Premium card content with border-gradient utility class</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Badge Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Badge Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="standard">Standard Badge</Badge>
            <Badge variant="premium">Premium Badge</Badge>
            <Badge variant="accent">Accent Badge</Badge>
            <Badge variant="standard">Feature</Badge>
            <Badge variant="accent">Success</Badge>
          </div>
        </section>

        {/* Form Components */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Form Components</h2>
          <Card variant="premium">
            <CardHeader>
              <CardTitle>Form Example</CardTitle>
              <CardDescription>Testing migrated form components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter your message" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="primary">Submit</Button>
              <Button variant="tertiary">Cancel</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Combined Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Combined Example</h2>
          <Card variant="premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Premium Feature Card</CardTitle>
                  <CardDescription>Showcasing all migrated components together</CardDescription>
                </div>
                <Badge variant="accent">New</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70">
                This card demonstrates the new design system with premium glassmorphism effects,
                border gradients, and consistent spacing.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="standard">Tag 1</Badge>
                <Badge variant="standard">Tag 2</Badge>
                <Badge variant="accent">Featured</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="tertiary">Learn More</Button>
              <Button variant="primary">Get Started</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
}

