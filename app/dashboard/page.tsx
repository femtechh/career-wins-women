'use client';

import { useEffect, useState } from 'react';
import { supabase, Win } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Award, Plus, FileDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddWinForm from '@/components/add-win-form';
import WinCard from '@/components/win-card';

export default function DashboardPage() {
  const router = useRouter();
  const [wins, setWins] = useState<Win[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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
    } catch (error) {
      console.error('Error loading wins:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleWinAdded = () => {
    setShowAddForm(false);
    loadWins();
  };

  const handleWinUpdated = () => {
    loadWins();
  };

  const handleWinDeleted = async (id: string) => {
    try {
      const { error } = await supabase.from('wins').delete().eq('id', id);
      if (error) throw error;
      loadWins();
    } catch (error) {
      console.error('Error deleting win:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-700" />
              </div>
              <h1 className="text-xl font-bold text-stone-900">
                Career Wins Journal
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/export')}
              className="hidden sm:flex"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            This counts
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-8">
            <AddWinForm
              onSuccess={handleWinAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {wins.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-stone-400" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900 mb-2">
              Your wins belong here.
            </h2>
            <p className="text-stone-600 mb-6">
              Start logging your achievements. Every win counts.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Add your first win
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {wins.map((win) => (
              <WinCard
                key={win.id}
                win={win}
                onUpdate={handleWinUpdated}
                onDelete={handleWinDeleted}
              />
            ))}
          </div>
        )}

        {wins.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/export')}
              className="w-full sm:w-auto"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export my wins
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
