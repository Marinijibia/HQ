'use client';

import * as React from 'react';
import { Card, Badge, Button, Input } from '@hq/ui';
import { Mail, Calendar } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          CONTACT SALES & SUPPORT
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Get in Touch
        </h1>
        <p className="text-foreground/50 text-sm leading-relaxed max-w-xl mx-auto">
          Schedule a live product walkthrough, ask compliance questions, or request assistance from
          developer support channels.
        </p>
      </div>

      {/* Form and info split */}
      <div className="grid gap-8 md:grid-cols-2 text-left">
        {/* Info list */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#1A1A1E] dark:text-white">How can we help?</h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Our team typically responds to incoming queries in under 2 hours during normal business
            operations.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-xs text-foreground/75">
              <Mail className="h-4 w-4 text-hq-blue" />
              <span>sales@hq.corp</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-foreground/75">
              <Calendar className="h-4 w-4 text-hq-purple" />
              <span>Schedule a Demo</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="p-6 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm font-semibold text-[#1A1A1E] dark:text-white">
                Message sent successfully!
              </p>
              <p className="text-xs text-foreground/50">Our team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5 text-left">
                <label className="font-semibold text-foreground/75">Your Name</label>
                <Input
                  placeholder="Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white dark:bg-[#0A0A0C] border-black/10 dark:border-[#1E1E24] text-[#1A1A1E] dark:text-white focus-visible:ring-hq-blue"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="font-semibold text-foreground/75">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white dark:bg-[#0A0A0C] border-black/10 dark:border-[#1E1E24] text-[#1A1A1E] dark:text-white focus-visible:ring-hq-blue"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="font-semibold text-foreground/75">Message</label>
                <textarea
                  placeholder="Describe your request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="h-24 w-full rounded-md border border-black/10 dark:border-[#1E1E24] bg-white dark:bg-[#0A0A0C] px-3 py-2 text-sm text-[#1A1A1E] dark:text-white focus:outline-none focus:ring-1 focus:ring-hq-blue"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-hq-blue hover:bg-hq-blue/90 text-white font-semibold text-sm transition-all"
              >
                Send Message
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
