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

  useEffect(() => {
    fetchAllEntries()
  }, [])

  async function fetchAllEntries() {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false }) // Newest first

    if (!error && data) {
      setAllEntries(data)
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center italic opacity-60">
      Opening the vault...
    </div>
  )

  return (
    <main className="min-h-screen bg-[#f7f3f0] text-stone-800 font-[family-name:var(--font-geist-serif)] p-8">
      {/* Navigation */}
      <nav className="max-w-2xl mx-auto mb-20">
        <Link href="/" className="text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
          ← Back to Today
        </Link>
      </nav>

      <header className="max-w-2xl mx-auto mb-20 text-center">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-4">The Archive</h1>
        <p className="text-xs opacity-40 uppercase tracking-[0.2em]">Every syllable recorded.</p>
      </header>

      <section className="max-w-2xl mx-auto space-y-24 pb-40">
        {allEntries.map((entry) => (
          <div key={entry.id} className="text-center animate-fade-in">
            <p className="text-lg leading-relaxed italic mb-4 whitespace-pre-line">
              {entry.content}
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-30">
              — {entry.author || 'Anonymous'}
            </p>
          </div>
        ))}
      </section>
    </main>
  )
}