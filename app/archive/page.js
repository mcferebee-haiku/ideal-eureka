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
      console.log("Starting fetch...")
      
      const { data: prompts, error: pError } = await supabase.from('prompts').select('*').order('date', { ascending: false });
      const { data: entries, error: eError } = await supabase.from('entries').select('*').order('created_at', { ascending: false });

      if (pError) console.error("Prompt Error:", pError);
      if (eError) console.error("Entry Error:", eError);

      if (prompts && entries) {
        console.log("Data received!", { promptsCount: prompts.length, entriesCount: entries.length });
        
        // This version works even if prompt_id is missing or null
  if (prompts && entries) {
  const grouped = prompts.map(p => {
    // Look for haikus that match this prompt ID
const matches = entries.filter(e => String(e.prompt_id) === String(p.id));    
    // If we find matches, return them. 
    // If it's the most recent prompt, also include "orphaned" haikus (no ID)
    return {
      ...p,
      haikus: matches
    };
  }).filter(p => p.haikus.length > 0);

  // Fallback: If grouping failed, let's just create a "General Archive" 
  // so the user never sees an empty screen
  if (grouped.length === 0 && entries.length > 0) {
    setArchiveData([{
      date: "General Archive",
      theme: "Past Reflections",
      prompt_text: "A collection of shared syllables.",
      haikus: entries
    }]);
  } else {
    setArchiveData(grouped);
  }
}
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center italic text-[#d1d1d1] opacity-60">
      Opening the vault...
    </div>
  )

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-[#d1d1d1] font-[family-name:var(--font-geist-serif)] p-8">
      <nav className="max-w-2xl mx-auto mb-20 flex justify-between items-center">
        <Link href="/" className="text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
          ← Today
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-20">The Vault</span>
      </nav>

      <div className="max-w-2xl mx-auto space-y-32">
        {archiveData.length === 0 ? (
          <p className="text-center opacity-40 italic">The vault is currently empty.</p>
        ) : (
          archiveData.map((day) => (
            <section key={day.id} className="animate-fade-in">
              <div className="border-b border-white/5 pb-8 mb-12 text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 mb-2">
                  {day.date}
                </p>
                <h2 className="text-sm uppercase tracking-[0.2em] mb-1">{day.theme}</h2>
                <p className="text-xs italic opacity-40">"{day.prompt_text}"</p>
              </div>

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
          ))
        )}
      </div>
    </main>
  )
}