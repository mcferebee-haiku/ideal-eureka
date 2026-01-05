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
  const [isShaking, setIsShaking] = useState(false)

  useEffect(() => {
    fetchPromptAndEntries()
  }, [])

  async function fetchPromptAndEntries() {
    const { data: promptData } = await supabase.from('prompts').select('*').order('day', { ascending: false }).limit(1).single()
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

  const handleTextChange = (e) => {
    const text = e.target.value
    setNewHaiku(text)
    setSyllableCount(countSyllables(text))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (syllableCount !== 17) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      return
    }

    const { error } = await supabase
      .from('entries')
      .insert([{ 
        content: newHaiku, 
        author: newName, 
        prompt_id: prompt.id 
      }])

    if (!error) {
      setNewHaiku('')
      setNewName('')
      setSyllableCount(0)
      fetchPromptAndEntries()
    }
  }

  if (!prompt) return <div className="min-h-screen bg-white flex items-center justify-center italic opacity-40">Loading the sanctuary...</div>

  return (
    <main className="min-h-screen bg-white text-black font-[family-name:var(--font-geist-serif)] p-8 md:p-16">
      
      {/* Fixed Navigation */}
      <nav className="fixed top-8 left-8 right-8 flex justify-between items-center z-50">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#888888]">
          Seventeen Syllables
        </span>
        <Link href="/archive" className="text-[10px] uppercase tracking-[0.3em] text-[#888888] hover:text-black transition-colors duration-500">
          Archive →
        </Link>
      </nav>

      <div className="max-w-xl mx-auto mt-32">
        {/* Prompt Header - Left Aligned */}
        <header className="mb-24">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#888888] mb-4">
            {prompt.day}
          </p>
          <div className="border-l border-black/10 pl-6">
            <h1 className="text-sm uppercase tracking-[0.2em] mb-1">{prompt.theme}</h1>
            <p className="text-xs italic opacity-40">"{prompt.prompt_text}"</p>
          </div>
        </header>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className={`mb-32 space-y-8 ${isShaking ? 'animate-shake' : ''}`}>
          <textarea
            value={newHaiku}
            onChange={handleTextChange}
            placeholder="Write your haiku..."
            className="w-full bg-transparent border-none focus:ring-0 text-lg italic resize-none placeholder:opacity-20 min-h-[120px]"
          />
          <div className="flex justify-between items-end border-t border-black/5 pt-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Your Initials"
              className="bg-transparent border-none focus:ring-0 text-[10px] uppercase tracking-widest p-0 w-32 placeholder:opacity-30"
            />
            <div className="flex items-center gap-6">
              <span className={`text-[10px] tracking-widest ${syllableCount === 17 ? 'text-black' : 'text-red-400 opacity-40'}`}>
                {syllableCount}/17
              </span>
              <button type="submit" className="text-[10px] uppercase tracking-[0.3em] hover:opacity-100 opacity-40 transition-opacity">
                Share
              </button>
            </div>
          </div>
        </form>

        {/* Community Entries - Left Aligned */}
        <div className="space-y-24 pl-6 border-l border-black/5">
          {entries.map((haiku) => (
            <div key={haiku.id} className="group">
              <p className="text-lg leading-relaxed italic mb-3 whitespace-pre-line">
                {haiku.content}
              </p>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#888888] opacity-60">
                {haiku.author ? `— ${haiku.author}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}