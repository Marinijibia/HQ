'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
} from '@hq/ui';
import {
  Save,
  Sliders,
  Copy,
  CheckCircle,
  Sparkles,
  Download,
  Edit2,
  Trash2,
  FolderOpen,
  History,
  CornerUpLeft,
  FileCheck,
} from 'lucide-react';

interface FileVersion {
  version: number;
  label: string;
  body: string;
  updatedAt: string;
  author: string;
}

interface CopyDoc {
  id: string;
  title: string;
  body: string;
  tone: string;
  updatedAt: string;
  fileSize: string;
  sha256: string;
  versions: FileVersion[];
}

export default function ContentStudioPage() {
  const [docs, setDocs] = React.useState<CopyDoc[]>([
    {
      id: 'doc-1',
      title: 'Q3 Petroleum Strategic Proposal',
      body: 'Dear Board of Directors, we present the strategic B2B trade logistics proposal covering petroleum shipping corridors across West African corridors, optimizing for low-risk regional compliance controls and maximum credit-spent yields...',
      tone: 'Professional & Direct',
      updatedAt: '2 hours ago',
      fileSize: '14.2 KB',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      versions: [
        {
          version: 3,
          label: 'Tone adjustments and corporate alignment',
          body: 'Dear Board of Directors, we present the strategic B2B trade logistics proposal covering petroleum shipping corridors across West African corridors, optimizing for low-risk regional compliance controls and maximum credit-spent yields...',
          updatedAt: '10 mins ago',
          author: 'Alistair Thorne (Strategy Director)',
        },
        {
          version: 2,
          label: 'Legal review and regulatory additions',
          body: 'Dear Board of Directors, we present the B2B logistics proposal covering petroleum shipping corridors. Verified under zero-trust regulatory constraints.',
          updatedAt: '1 hour ago',
          author: 'Fiona Gallagher (Legal Director)',
        },
        {
          version: 1,
          label: 'Initial strategic outline draft',
          body: 'Petroleum shipping corridors proposal outline.',
          updatedAt: '2 hours ago',
          author: 'Elena Rostova (CEO)',
        },
      ],
    },
    {
      id: 'doc-2',
      title: 'HQ Enterprise Release Campaign',
      body: 'Say hello to HQ, the first AI Executive Operating System designed to automate and orchestrate corporate growth. Let your board work! 🚀 Now with automated PGVector memory systems and multi-agent failovers.',
      tone: 'Playful & Creative',
      updatedAt: '1 day ago',
      fileSize: '8.4 KB',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      versions: [
        {
          version: 2,
          label: 'Feature additions and emojis parameters',
          body: 'Say hello to HQ, the first AI Executive Operating System designed to automate and orchestrate corporate growth. Let your board work! 🚀 Now with automated PGVector memory systems and multi-agent failovers.',
          updatedAt: '12 hours ago',
          author: 'Linus Kovacs (Creative Director)',
        },
        {
          version: 1,
          label: 'Initial PR copy release draft',
          body: 'Say hello to HQ OS, the executive agent platform.',
          updatedAt: '1 day ago',
          author: 'Sophia Sterling (Marketing Director)',
        },
      ],
    },
  ]);

  const [selectedId, setSelectedId] = React.useState<string>('doc-1');
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [tone, setTone] = React.useState('Professional & Direct');

  const [isCopied, setIsCopied] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [rollbackAlert, setRollbackAlert] = React.useState<string | null>(null);

  // Sync editor fields with selected document
  React.useEffect(() => {
    const doc = docs.find((d) => d.id === selectedId);
    if (doc) {
      setTitle(doc.title);
      setBody(doc.body);
      setTone(doc.tone);
    }
  }, [selectedId, docs]);

  const activeDoc = docs.find((d) => d.id === selectedId);

  const handleSave = () => {
    setDocs((prev) =>
      prev.map((d) => {
        if (d.id === selectedId) {
          const nextVersionNumber = d.versions.length + 1;
          const newVersion: FileVersion = {
            version: nextVersionNumber,
            label: `Manual draft save: Version ${nextVersionNumber}`,
            body,
            updatedAt: 'Just now',
            author: 'Corporate Administrator',
          };
          return {
            ...d,
            title,
            body,
            tone,
            updatedAt: 'Just now',
            versions: [newVersion, ...d.versions],
          };
        }
        return d;
      }),
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCreateNew = () => {
    const newDoc: CopyDoc = {
      id: `doc-${Date.now()}`,
      title: 'Untitled Document',
      body: '',
      tone: 'Professional & Direct',
      updatedAt: 'Just now',
      fileSize: '0.1 KB',
      sha256: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
      versions: [
        {
          version: 1,
          label: 'Blank canvas initial layout',
          body: '',
          updatedAt: 'Just now',
          author: 'System',
        },
      ],
    };
    setDocs((prev) => [newDoc, ...prev]);
    setSelectedId(newDoc.id);
  };

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) {
      setSelectedId(docs[0]?.id || '');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(body);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRollback = (ver: FileVersion) => {
    setBody(ver.body);
    setRollbackAlert(`Rolled back editor pane content to: Version ${ver.version}`);
    setTimeout(() => setRollbackAlert(null), 3000);
  };

  return (
    <div className="space-y-8 select-none text-white">
      {/* Title */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-hq-blue" />
            Asset Explorer & Version Control
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Navigate generated corporate artifacts, inspect cryptographical SHA-256 hashes, and
            restore historical drafts.
          </p>
        </div>
        <Button
          variant="accent"
          className="flex items-center gap-1.5 text-xs h-9"
          onClick={handleCreateNew}
        >
          <Sparkles className="h-4 w-4" />
          Create Copy Template
        </Button>
      </div>

      {rollbackAlert && (
        <div className="bg-hq-blue/20 border border-hq-blue/40 text-hq-cyan text-xs p-3 rounded-md flex items-center gap-2 animate-bounce">
          <CornerUpLeft className="h-4 w-4" />
          {rollbackAlert}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Left Side: Documents Directory File Explorer */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground/50 flex items-center gap-1">
                <FolderOpen className="h-3.5 w-3.5" />
                Files Directory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {docs.map((doc) => {
                const isActive = doc.id === selectedId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedId(doc.id)}
                    className={`flex items-start justify-between p-2.5 rounded-md cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-hq-blue/10 border-hq-blue/30 text-white'
                        : 'bg-transparent border-transparent hover:bg-hq-graphite/10 text-foreground/75'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <p className="text-xs font-bold truncate">{doc.title || 'Untitled'}</p>
                      <div className="flex gap-1.5 items-center mt-0.5">
                        <span className="text-[8px] bg-hq-graphite/40 px-1 rounded text-foreground/60">
                          {doc.fileSize}
                        </span>
                        <span className="text-[9px] text-foreground/45">
                          Saved: {doc.updatedAt}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="text-foreground/40 hover:text-red-400 p-0.5 shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* SHA-256 metadata hash code verification widget */}
          {activeDoc && (
            <Card className="border border-hq-graphite/40 bg-hq-graphite/20 p-4 text-xs space-y-2">
              <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1">
                <FileCheck className="h-3.5 w-3.5 text-hq-cyan" />
                File Integrity Metadata
              </p>
              <div className="space-y-1 font-mono text-[9px] text-foreground/70 bg-[#0A0A0C] p-2 rounded border border-hq-graphite/15">
                <p>
                  <span className="text-foreground/40">Size:</span> {activeDoc.fileSize}
                </p>
                <p className="break-all">
                  <span className="text-foreground/40">SHA-256 Checksum:</span>
                </p>
                <p className="text-hq-cyan break-all">{activeDoc.sha256}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Center: Copywriting Editor & Document Previews */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20 flex flex-col h-[520px]">
            <CardHeader className="border-b border-hq-graphite/20 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Edit2 className="h-4 w-4 text-hq-blue" />
                  Editor Pane
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground/60"
                    onClick={handleCopyText}
                  >
                    {isCopied ? (
                      <CheckCircle className="h-4 w-4 text-hq-cyan animate-pulse" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <a
                    href={`https://storage.googleapis.com/hq-assets-bucket/mockups/${selectedId}.pdf`}
                    download
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-hq-graphite/10 text-foreground/60"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
                  Document Title
                </label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9" />
              </div>

              <div className="flex-1 flex flex-col space-y-1.5">
                <label className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
                  Body Text Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="flex-1 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-hq-blue text-foreground font-sans resize-none"
                  placeholder="Enter copywriting text content..."
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-hq-graphite/20 p-4 flex justify-between items-center bg-hq-graphite/10">
              <span className="text-[10px] text-foreground/50 font-mono">
                {body.length} characters | {body.split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-[10px] text-hq-cyan font-semibold animate-pulse">
                    ✓ Saved
                  </span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1"
                  onClick={handleSave}
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Version Ledger Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Version ledger timeline control */}
          {activeDoc && (
            <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <History className="h-4 w-4 text-hq-purple" />
                  Version Control
                </CardTitle>
                <CardDescription>Track revisions and rollback edits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
                {activeDoc.versions.map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded border border-hq-graphite/30 bg-hq-graphite/10 text-[11px] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Version {ver.version}</span>
                      <span className="text-[9px] text-foreground/45">{ver.updatedAt}</span>
                    </div>
                    <p className="text-[10px] text-foreground/75 italic">"{ver.label}"</p>
                    <p className="text-[9px] text-foreground/50">Author: {ver.author}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRollback(ver)}
                      className="w-full text-[10px] h-7 flex items-center justify-center gap-1 hover:text-hq-cyan hover:bg-hq-cyan/5 text-foreground/60 border border-hq-graphite/20 mt-1"
                    >
                      <CornerUpLeft className="h-3 w-3" />
                      Restore Draft
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tone preseting configurations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-hq-blue" />
                Tone Preset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                >
                  <option value="Professional & Direct">Professional & Direct</option>
                  <option value="Analytical & Technical">Analytical & Technical</option>
                  <option value="Playful & Creative">Playful & Creative</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
