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
async function fetchArchive() {
    try {
      console.log("Starting fetch with 'day' column...");
      
      // We are now specifically asking for 'day' instead of 'date'
      const { data: prompts, error: pError } = await supabase.from('prompts').select('*').order('day', { ascending: false });
      const { data: entries, error: eError } = await supabase.from('entries').select('*').order('created_at', { ascending: false });

      if (pError) {
        console.error("Prompt Error (Check table column names):", pError);
      }

      if (prompts && entries) {
        console.log("Data successfully loaded from Supabase");
        
        // 1. Grouping logic using 'day'
        let grouped = prompts.map(p => ({
          ...p,
          haikus: entries.filter(e => String(e.prompt_id) === String(p.id))
        })).filter(p => p.haikus.length > 0);

        // 2. Identify entries not linked to a prompt
        const linkedIds = prompts.map(p => String(p.id));
        const orphans = entries.filter(e => !e.prompt_id || !linkedIds.includes(String(e.prompt_id)));

        // 3. Add Orphans using the 'day' key so the UI can find it
        if (orphans.length > 0) {
          grouped.push({
            id: 'orphans',
            day: 'Past Syllables', // Changed from date to day
            theme: 'Community Gallery',
            prompt_text: 'A collection of shared moments.',
            haikus: orphans
          });
        }

        setArchiveData(grouped);
      }
    } catch (err) {
      console.error("System Error:", err);
    } finally {
      setLoading(false);
    }
  }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center italic text-[#d1d1d1] opacity-60">
      Opening the vault...
    </div>
  )

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

    <div className="max-w-xl mx-auto mt-24 space-y-40">
      {archiveData.map((day) => (
        <section key={day.id} className="animate-fade-in">
          
          {/* Day Metadata - Left Aligned */}
          <div className="mb-12 border-l border-white/10 pl-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#888888] mb-3">
              {day.day}
            </p>
            <h2 className="text-sm uppercase tracking-[0.2em] mb-1">{day.theme}</h2>
            <p className="text-xs italic opacity-40">"{day.prompt_text}"</p>
          </div>

          {/* Haikus - Left Aligned */}
          <div className="space-y-24">
            {day.haikus.map((haiku) => (
              <div key={haiku.id} className="group">
                <p className="text-lg leading-relaxed italic mb-4 whitespace-pre-line group-hover:text-white transition-colors duration-700">
                  {haiku.content}
                </p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#888888] opacity-40 group-hover:opacity-100 transition-opacity">
                   {haiku.author ? `— ${haiku.author}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </main>
)