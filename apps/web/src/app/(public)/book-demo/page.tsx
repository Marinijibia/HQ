'use client';

import * as React from 'react';
import { Card, Badge, Button, Input } from '@hq/ui';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from '../../../components/toast';

export default function BookDemoPage() {
  const [selectedDate, setSelectedDate] = React.useState('2026-07-13');
  const [selectedTime, setSelectedTime] = React.useState('');
  const [name, setName] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [booked, setBooked] = React.useState(false);

  const timeSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'];
  const dates = [
    { label: 'Mon, Jul 13', value: '2026-07-13' },
    { label: 'Tue, Jul 14', value: '2026-07-14' },
    { label: 'Wed, Jul 15', value: '2026-07-15' },
    { label: 'Thu, Jul 16', value: '2026-07-16' },
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/public/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Executive Guest',
          email,
          companyName,
          selectedDate,
          selectedTime,
        }),
      });
      if (res.ok) {
        setBooked(true);
        toast.success(`📅 Demo meeting confirmed! Email sent to ${email}`);
      } else {
        toast.error('Booking failed. Please try again.');
      }
    } catch {
      toast.error('Network error booking demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-5xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="ai"
          className="px-3.5 py-1.5 rounded-full text-xs tracking-widest font-bold"
        >
          SCHEDULE A DEMO MEETING
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Meet Your AI Boardroom
        </h1>
        <p className="text-foreground/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Book a 15-minute operational walkthrough to configure specialist AI directors tailored to
          your corporate taxonomy.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 text-left">
        {/* Left: Meeting Specs */}
        <Card className="p-7 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-hq-blue/10 flex items-center justify-center text-hq-blue">
                <Users className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                  HQ Sales & Ops
                </h3>
                <p className="text-xs text-foreground/45">15 Min Walkthrough</p>
              </div>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed">
              We will set up a live courtroom sandbox, load target CSV sample sheets, and
              demonstrate how inter-agent evaluation loops check prompts in real-time.
            </p>
          </div>
          <div className="space-y-3 pt-4 border-t border-card-border">
            <div className="flex items-center space-x-2 text-sm text-foreground/75">
              <Clock className="h-4 w-4 text-hq-blue" />
              <span>15 Minutes Duration</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-foreground/75">
              <Sparkles className="h-4 w-4 text-hq-purple" />
              <span>Live Workspace Sandboxing</span>
            </div>
          </div>
        </Card>

        {/* Center/Right: Interactive Calendar Scheduler Form */}
        <Card className="md:col-span-2 p-7 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition flex flex-col justify-between">
          {booked ? (
            <div className="text-center py-16 space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto border border-green-500/20">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1E] dark:text-white">
                Meeting Confirmed!
              </h3>
              <p className="text-sm text-foreground/50 max-w-sm mx-auto leading-relaxed">
                A calendar invitation for <strong>{selectedDate}</strong> at{' '}
                <strong>{selectedTime}</strong> has been sent to <strong>{email}</strong>.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setBooked(false);
                  setSelectedTime('');
                  setEmail('');
                }}
                className="mt-4 border-card-border"
              >
                Schedule Another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-6 text-sm">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="font-bold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-hq-blue" />
                  Select a Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {dates.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setSelectedDate(d.value)}
                      className={`h-11 rounded-lg border text-xs font-semibold transition-all ${
                        selectedDate === d.value
                          ? 'border-hq-blue bg-hq-blue/5 text-hq-blue'
                          : 'border-card-border hover:border-black/20 dark:hover:border-white/20'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="font-bold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-hq-purple" />
                  Select a Time (GMT)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`h-11 rounded-lg border text-xs font-semibold transition-all ${
                        selectedTime === slot
                          ? 'border-hq-purple bg-hq-purple/5 text-hq-purple'
                          : 'border-card-border hover:border-black/20 dark:hover:border-white/20'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Email Info Input */}
              <div className="space-y-2.5 pt-4 border-t border-card-border">
                <label className="font-bold text-[#1A1A1E] dark:text-white">Email Address</label>
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white dark:bg-[#0A0A0C] border-card-border text-[#1A1A1E] dark:text-white flex-1 focus-visible:ring-hq-blue"
                  />
                  <Button
                    type="submit"
                    disabled={!selectedTime}
                    className="bg-hq-blue hover:bg-hq-blue/90 text-white font-bold h-10 px-6 transition-all disabled:opacity-50"
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
