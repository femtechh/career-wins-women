'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface AddWinFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddWinForm({ onSuccess, onCancel }: AddWinFormProps) {
  const [textRaw, setTextRaw] = useState('');
  const [tag, setTag] = useState<string>('');
  const [winDate, setWinDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textRaw.trim()) {
      setError('Please describe your win');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('wins').insert({
        text_raw: textRaw.trim(),
        tag: tag || null,
        win_date: winDate,
      });

      if (insertError) throw insertError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save win');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">Add a win</h2>
        <button
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="win-text"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            What did you accomplish?
          </label>
          <Textarea
            id="win-text"
            value={textRaw}
            onChange={(e) => setTextRaw(e.target.value)}
            placeholder="Led the product launch that increased user engagement by 25%..."
            rows={4}
            disabled={loading}
            className="w-full resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="win-tag"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              Category (optional)
            </label>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Impact">Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="win-date"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              Date
            </label>
            <Input
              id="win-date"
              type="date"
              value={winDate}
              onChange={(e) => setWinDate(e.target.value)}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            {loading ? 'Saving...' : 'Save win'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
