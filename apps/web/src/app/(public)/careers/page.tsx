'use client';

import * as React from 'react';
import { Card, Badge, Button, Input } from '@hq/ui';
import { MapPin, Clock, X, Sparkles } from 'lucide-react';
import { toast } from '../../../components/toast';

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [portfolio, setPortfolio] = React.useState('');
  const [coverLetter, setCoverLetter] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const jobs = [
    {
      title: 'Senior Frontend Architect',
      type: 'Full-Time',
      location: 'London, UK / Remote',
      dept: 'Engineering',
    },
    {
      title: 'AI Research Scientist',
      type: 'Full-Time',
      location: 'London, UK',
      dept: 'AI Core',
    },
    {
      title: 'Executive Platform Security Engineer',
      type: 'Full-Time',
      location: 'Remote',
      dept: 'Security & Compliance',
    },
  ];

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/public/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          jobTitle: selectedJob,
          linkedinOrPortfolio: portfolio,
          coverLetter,
        }),
      });
      if (res.ok) {
        toast.success(`💼 Application for ${selectedJob} submitted! Logged to careers@netify.ng`);
        setSelectedJob(null);
        setName('');
        setEmail('');
        setPortfolio('');
        setCoverLetter('');
      } else {
        toast.error('Application failed. Please try again.');
      }
    } catch {
      toast.error('Network error submitting application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3.5 py-1 rounded-full text-xs tracking-widest font-bold"
        >
          WE ARE HIRING
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Build the Future of Autonomy
        </h1>
        <p className="text-foreground/50 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          Join our mission to democratize C-suite expertise. We value deep engineering capabilities,
          absolute transparency, and design excellence.
        </p>
      </div>

      {/* Roster of openings */}
      <div className="space-y-4">
        {jobs.map((j, idx) => (
          <Card
            key={idx}
            className="p-6 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left"
          >
            <div className="space-y-1.5">
              <span className="text-[9px] text-hq-purple font-bold uppercase tracking-wider">
                {j.dept}
              </span>
              <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">{j.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-foreground/45">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {j.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {j.type}
                </span>
              </div>
            </div>
            <Button
              onClick={() => setSelectedJob(j.title)}
              className="text-xs h-9 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold px-4 rounded-xl shrink-0"
            >
              Apply Now
            </Button>
          </Card>
        ))}
      </div>

      {/* Job Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A0A0C] border border-card-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <div>
                <span className="text-[10px] font-bold text-hq-purple uppercase tracking-wider">Applying For</span>
                <h3 className="text-sm font-black text-foreground">{selectedJob}</h3>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-foreground/40 hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-foreground/75 font-bold">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asad"
                  required
                  className="bg-slate-50 dark:bg-black/40 border-card-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-foreground/75 font-bold">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@company.com"
                  required
                  className="bg-slate-50 dark:bg-black/40 border-card-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-foreground/75 font-bold">LinkedIn / Portfolio URL</label>
                <Input
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="bg-slate-50 dark:bg-black/40 border-card-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-foreground/75 font-bold">Cover Letter / Executive Summary</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a fit for HQ AI OS?"
                  rows={3}
                  className="w-full rounded-xl bg-slate-50 dark:bg-black/40 border border-card-border p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-hq-blue"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold rounded-xl mt-2 flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                {loading ? 'Submitting Application...' : 'Submit Application to HR'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
