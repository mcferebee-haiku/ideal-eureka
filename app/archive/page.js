'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  'https://fxzbqmhwnyhwqqfsymyt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4emJxbWh3bnlod3FxZnN5bXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzc0MDcsImV4cCI6MjA4Mjg1MzQwN30.sNNXO9SrmIuXPoRFPlMxAKX9dsVTaNsvwB_tWNiCxnE'
)

export default function Archive() {
  const [archiveData, setArchiveData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArchive()
  }, [])

  async function fetchArchive() {
    try {
      const { data: prompts } = await supabase.from('prompts').select('*').order('created_at', { ascending: false });
      const { data: entries } = await supabase.from('entries').select('*').order('created_at', { ascending: false });

      if (prompts && entries) {
        let grouped = prompts.map(p => ({
          ...p,
          haikus: entries.filter(e => String(e.prompt_id) === String(p.id))
        })).filter(p => p.haikus.length > 0);

        const linkedIds = prompts.map(p => String(p.id));
        const orphans = entries.filter(e => !e.prompt_id || !linkedIds.includes(String(e.prompt_id)));

        if (orphans.length > 0) {
          grouped.push({
            id: 'orphans',
            created_at: new Date().toISOString(),
            theme: 'Community Gallery',
            prompt_text: 'Syllables captured in the wild.',
            haikus: orphans
          });
        }
        setArchiveData(grouped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center italic text-[#888888]">
      Opening the vault...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-[#d1d1d1] font-[family-name:var(--font-geist-serif)] p-8 md:p-16">
      
      {/* Pinned Navigation */}
      <nav className="fixed top-8 left-8 right-8 flex justify-between items-center z-50">
        <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-[#888888] hover:text-white transition-colors duration-500">
          ← Today
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#888888] opacity-50">
          Archive
        </span>
      </nav>

      <div className="max-w-xl mx-auto mt-32 space-y-40">
        {archiveData.map((group) => (
          <section key={group.id} className="animate-fade-in text-left">
            {/* Group Header */}
            <div className="mb-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#888888] mb-4">
                {group.created_at ? new Date(group.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() : "RECENT"}
              </p>
              <div className="border-l border-white/10 pl-6">
                <h2 className="text-sm uppercase tracking-[0.2em] mb-1">{group.theme}</h2>
                <p className="text-xs italic opacity-40">"{group.prompt_text}"</p>
              </div>
            </div>

            {/* Group Haikus */}
            <div className="space-y-20 pl-6">
              {group.haikus.map((haiku) => (
                <div key={haiku.id} className="group">
                  <p className="text-lg leading-relaxed italic mb-3 whitespace-pre-line group-hover:text-white transition-colors duration-700">
                    {haiku.content}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#888888] opacity-40">
                     {haiku.name ? `— ${haiku.name}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}