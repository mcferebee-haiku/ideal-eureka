'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  'https://fxzbqmhwnyhwqqfsymyt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4emJxbWh3bnlod3FxZnN5bXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzc0MDcsImV4cCI6MjA4Mjg1MzQwN30.sNNXO9SrmIuXPoRFPlMxAKX9dsVTaNsvwB_tWNiCxnE'
)

export default function Home() {
  const [prompt, setPrompt] = useState(null)
  const [entries, setEntries] = useState([])
  const [newHaiku, setNewHaiku] = useState('')
  const [newName, setNewName] = useState('')
  const [syllableCount, setSyllableCount] = useState(0)

  useEffect(() => {
    fetchPromptAndEntries()
  }, [])

  async function fetchPromptAndEntries() {
    // Sort by created_at since 'day' column was causing issues
    const { data: promptData } = await supabase.from('prompts').select('*').order('created_at', { ascending: false }).limit(1).single()
    setPrompt(promptData)

    if (promptData) {
      const { data: entriesData } = await supabase
        .from('entries')
        .select('*')
        .eq('prompt_id', promptData.id)
        .order('created_at', { ascending: false })
      setEntries(entriesData || [])
    }
  }

  const countSyllables = (text) => {
    if (!text) return 0
    const words = text.toLowerCase().split(/\s+/)
    return words.reduce((acc, word) => {
      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$ Elizabeth/, '')
      word = word.replace(/^y/, '')
      const vowels = word.match(/[aeiouy]{1,2}/g)
      return acc + (vowels ? vowels.length : 0)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (syllableCount !== 17) return

    const { error } = await supabase
      .from('entries')
      .insert([{ 
        content: newHaiku, 
        name: newName, // Uses 'name' column
        prompt_id: prompt.id 
      }])

    if (!error) {
      setNewHaiku('')
      setNewName('')
      setSyllableCount(0)
      fetchPromptAndEntries()
    }
  }

  if (!prompt) return <div className="min-h-screen bg-white flex items-center justify-center italic opacity-40">Loading...</div>

  return (
    <main className="min-h-screen bg-white text-black font-[family-name:var(--font-geist-serif)] p-8 md:p-24 flex flex-col items-center">
      <div className="w-full max-w-xl text-center space-y-16">
        
        {/* Header Section */}
        <header className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#888888]">
            {prompt.created_at ? new Date(prompt.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() : ""}
          </p>
          <h1 className="text-xl uppercase tracking-[0.1em]">{prompt.theme}</h1>
          <p className="italic opacity-60 text-sm">"{prompt.prompt_text}"</p>
        </header>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <textarea
            value={newHaiku}
            onChange={(e) => {
              setNewHaiku(e.target.value)
              setSyllableCount(countSyllables(e.target.value))
            }}
            placeholder="Seventeen syllables..."
            className="w-full bg-transparent border-none focus:ring-0 text-center text-lg italic resize-none placeholder:opacity-20 h-32"
          />
          <div className="flex flex-col items-center gap-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Initials"
              className="bg-transparent border-none focus:ring-0 text-center text-[10px] uppercase tracking-widest w-24 placeholder:opacity-30"
            />
            <div className="flex items-center gap-4">
              <span className={`text-[10px] ${syllableCount === 17 ? 'opacity-100' : 'opacity-20'}`}>
                {syllableCount}/17
              </span>
              <button type="submit" className="text-[10px] uppercase tracking-widest hover:opacity-100 opacity-40 transition-opacity">
                Share
              </button>
            </div>
          </div>
        </form>

        {/* Community List */}
        <div className="pt-16 space-y-24">
          {entries.map((haiku) => (
            <div key={haiku.id} className="space-y-2">
              <p className="text-lg italic whitespace-pre-line">{haiku.content}</p>
              <p className="text-[9px] uppercase tracking-widest text-[#888888]">
                {haiku.name ? `— ${haiku.name}` : ""}
              </p>
            </div>
          ))}
        </div>

        <footer className="pt-24 pb-8">
          <Link href="/archive" className="text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
            The Archive
          </Link>
        </footer>
      </div>
    </main>
  )
}