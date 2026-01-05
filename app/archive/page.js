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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center italic opacity-40 uppercase text-[10px] tracking-widest">Opening Vault...</div>

  return (
    <main className="min-h-screen bg-white text-black font-[family-name:var(--font-geist-serif)] p-8 md:p-24 flex flex-col items-center">
      <div className="w-full max-w-xl text-center">
        <nav className="mb-24">
          <Link href="/" className="text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
            ← Back Today
          </Link>
        </nav>

        <div className="space-y-40">
          {archiveData.map((group) => (
            <section key={group.id} className="space-y-16">
              <header className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#888888]">
                  {new Date(group.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </p>
                <h2 className="text-lg uppercase tracking-widest">{group.theme}</h2>
                <p className="italic opacity-60 text-xs">"{group.prompt_text}"</p>
              </header>

              <div className="space-y-20">
                {group.haikus.map((haiku) => (
                  <div key={haiku.id} className="space-y-2">
                    <p className="text-lg italic whitespace-pre-line">{haiku.content}</p>
                    <p className="text-[9px] uppercase tracking-widest text-[#888888]">
                       {haiku.name ? `— ${haiku.name}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}