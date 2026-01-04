'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  'https://fxzbqmhwnyhwqqfsymyt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4emJxbWh3bnlod3FxZnN5bXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzc0MDcsImV4cCI6MjA4Mjg1MzQwN30.sNNXO9SrmIuXPoRFPlMxAKX9dsVTaNsvwB_tWNiCxnE'
)

export default function Archive() {
  const [allEntries, setAllEntries] = useState([])
  const [loading, setLoading] = useState(true)
const [archiveData, setArchiveData] = useState([]);

async function fetchArchive() {
  // 1. Fetch all prompts
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .order('date', { ascending: false });

  // 2. Fetch all entries
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (prompts && entries) {
    // 3. Group entries under their specific prompts
    const grouped = prompts.map(p => ({
      ...p,
      haikus: entries.filter(e => e.prompt_id === p.id)
    })).filter(p => p.haikus.length > 0); // Only show days that have haikus
    
    setArchiveData(grouped);
  }
  setLoading(false);
}

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center italic opacity-60">
      Opening the vault...
    </div>
  )

 return (
  <main className="min-h-screen bg-[#1a1a1a] text-[#d1d1d1] font-[family-name:var(--font-geist-serif)] p-8 selection:bg-white/10">
    {/* Minimalist Top Nav */}
    <nav className="max-w-2xl mx-auto mb-20 flex justify-between items-center">
      <Link href="/" className="text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
        ← Today
      </Link>
      <span className="text-[10px] uppercase tracking-[0.3em] opacity-20">The Vault</span>
    </nav>

    <div className="max-w-2xl mx-auto space-y-32">
      {archiveData.map((day) => (
        <section key={day.id} className="animate-fade-in">
          {/* Day Metadata */}
          <div className="border-b border-white/5 pb-8 mb-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 mb-2">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h2 className="text-sm uppercase tracking-[0.2em] mb-1">{day.theme}</h2>
            <p className="text-xs italic opacity-40">"{day.prompt_text}"</p>
          </div>

          {/* Haikus for this day */}
          <div className="space-y-20">
            {day.haikus.map((haiku) => (
              <div key={haiku.id} className="text-center group">
                <p className="text-lg leading-relaxed italic mb-4 whitespace-pre-line group-hover:text-white transition-colors duration-700">
                  {haiku.content}
                </p>
                <p className="text-[9px] uppercase tracking-[0.3em] opacity-20 group-hover:opacity-40 transition-opacity">
                  — {haiku.author || 'Anon'}
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