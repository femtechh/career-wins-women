'use client';

import { useEffect, useState } from 'react';
import { supabase, Win } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExportPage() {
  const router = useRouter();
  const [wins, setWins] = useState<Win[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<'resume' | 'review'>('resume');
  const [generatedText, setGeneratedText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWins();
  }, []);

  const loadWins = async () => {
    try {
      const { data, error } = await supabase
        .from('wins')
        .select('*')
        .order('win_date', { ascending: false });

      if (error) throw error;
      setWins(data || []);

      if (data && data.length > 0) {
        const oldestWin = data[data.length - 1];
        setStartDate(oldestWin.win_date);
      }
    } catch (error) {
      console.error('Error loading wins:', error);
    }
  };

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const filteredWins = wins.filter(
      (win) => win.win_date >= startDate && win.win_date <= endDate
    );

    if (filteredWins.length === 0) {
      setError('No wins found in the selected date range');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/export-wins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wins: filteredWins, format }),
      });

      if (!response.ok) throw new Error('Failed to generate export');

      const data = await response.json();
      setGeneratedText(data.text);
    } catch (err: any) {
      setError(err.message || 'Failed to generate export');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-700" />
            </div>
            <h1 className="text-xl font-bold text-stone-900">Export Wins</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            Select date range and format
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start-date"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Start date
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>

              <div>
                <label
                  htmlFor="end-date"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  End date
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="format"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Export format
              </label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">Resume bullets</SelectItem>
                  <SelectItem value="review">Performance review summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={generating || !startDate || !endDate}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate export'
              )}
            </Button>
          </div>
        </div>

        {generatedText && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900">
                Your {format === 'resume' ? 'resume bullets' : 'performance review'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="bg-stone-50 rounded-lg p-6 border border-stone-200">
              <pre className="whitespace-pre-wrap text-stone-800 font-sans leading-relaxed">
                {generatedText}
              </pre>
            </div>
          </div>
        )}

        {wins.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-stone-400" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900 mb-2">
              No wins yet
            </h2>
            <p className="text-stone-600 mb-6">
              Add some wins to your journal before exporting.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Go to dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
