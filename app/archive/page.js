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
      // Sorting by created_at descending so newest is always first
      const { data: prompts } = await supabase.from('prompts').select('*').order('created_at', { ascending: false });
      const { data: entries } = await supabase.from('entries').select('*').order('created_at', { ascending: false });

      if (prompts && entries) {
        const grouped = prompts.map(p => ({
          ...p,
          haikus: entries.filter(e => String(e.prompt_id) === String(p.id))
        })).filter(p => p.haikus.length > 0);
        
        setArchiveData(grouped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center italic opacity-40 uppercase text-[10px] tracking-widest text-white">
      Opening Vault...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-[#d1d1d1] font-[family-name:var(--font-geist-serif)] p-8 md:p-24 flex flex-col items-center">
      <div className="w-full max-w-xl text-center">
        
        <nav className="mb-32">
          <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-[#888888] hover:text-white transition-opacity">
            ← Back to Today
          </Link>
        </nav>

        <div className="space-y-48">
          {archiveData.map((group) => (
            <section key={group.id} className="space-y-16 animate-fade-in">
              <header className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#888888]">
                  {/* Robust Date Formatting */}
                  {group.created_at 
                    ? new Date(group.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() 
                    : "DATELINE MISSING"}
                </p>
                <div className="space-y-2">
                  <h2 className="text-xl uppercase tracking-[0.2em] text-white">{group.theme}</h2>
                  <p className="italic opacity-40 text-sm">"{group.prompt_text}"</p>
                </div>
                <div className="w-8 h-[1px] bg-white/10 mx-auto"></div>
              </header>

              <div className="space-y-24">
                {group.haikus.map((haiku) => (
                  <div key={haiku.id} className="group">
                    <pre className="text-lg italic whitespace-pre-wrap font-serif leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                      {haiku.content}
                    </pre>
                    <p className="mt-4 text-[9px] uppercase tracking-[0.3em] text-[#888888]">
                       {haiku.name ? `— ${haiku.name}` : "— anon"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-40 mb-20 opacity-20 text-[10px] uppercase tracking-widest">
          End of Records
        </footer>
      </div>
    </main>
  )
}