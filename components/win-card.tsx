'use client';

import { useState, useEffect } from 'react';
import { Win } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sparkles, Trash2, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface WinCardProps {
  win: Win;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export default function WinCard({ win, onUpdate, onDelete }: WinCardProps) {
  const [polishing, setPolishing] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [localWin, setLocalWin] = useState<Win>(win);

  useEffect(() => {
    setLocalWin(win);
  }, [win]);

  const handlePolish = async (style: 'resume' | 'review' | 'linkedin') => {
    setPolishing(style);
    try {
      const response = await fetch('/api/polish-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winId: win.id, style }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to polish win');
      }

      if (!result.polishedText) {
        throw new Error('No polished text received from server');
      }

      setLocalWin({
        ...localWin,
        text_polished: result.polishedText,
        polish_style: result.style,
      });

      toast({
        title: 'Success!',
        description: 'Your win has been polished and is ready to use.',
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error polishing win:', error);
    } finally {
      setPolishing(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (showDelete) {
      onDelete(win.id);
    } else {
      setShowDelete(true);
      setTimeout(() => setShowDelete(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {win.tag && (
            <Badge variant="secondary" className="text-xs">
              {win.tag}
            </Badge>
          )}
          <div className="flex items-center text-sm text-stone-500">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(win.win_date), 'MMM d, yyyy')}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className={`text-stone-400 hover:text-red-600 transition-colors ${
            showDelete ? 'text-red-600' : ''
          }`}
          title={showDelete ? 'Click again to confirm' : 'Delete win'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-stone-800 leading-relaxed">{localWin.text_raw}</p>
        </div>

        {polishing && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Polishing your win...</span>
            </div>
            <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        )}

        {!polishing && localWin.text_polished && (
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm font-medium text-emerald-900">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Polished version
                </div>
                {localWin.polish_style && (
                  <Badge variant="outline" className="text-xs bg-white border-emerald-200 text-emerald-700">
                    {localWin.polish_style === 'resume' && 'Resume-ready'}
                    {localWin.polish_style === 'review' && 'Performance review'}
                    {localWin.polish_style === 'linkedin' && 'LinkedIn-style'}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => handleCopy(localWin.text_polished!)}
                className="text-emerald-700 hover:text-emerald-800"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-stone-800 leading-relaxed">{localWin.text_polished}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePolish('resume')}
            disabled={polishing !== null}
            className="text-xs"
          >
            {polishing === 'resume' ? 'Polishing...' : 'Make resume-ready'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePolish('review')}
            disabled={polishing !== null}
            className="text-xs"
          >
            {polishing === 'review'
              ? 'Polishing...'
              : 'Make performance-review ready'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePolish('linkedin')}
            disabled={polishing !== null}
            className="text-xs"
          >
            {polishing === 'linkedin' ? 'Polishing...' : 'Make LinkedIn-style'}
          </Button>
        </div>
      </div>
    </div>
  );
}
