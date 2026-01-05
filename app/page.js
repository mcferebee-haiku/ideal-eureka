'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  'https://fxzbqmhwnyhwqqfsymyt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4emJxbWh3bnlod3FxZnN5bXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzc0MDcsImV4cCI6MjA4Mjg1MzQwN30.sNNXO9SrmIuXPoRFPlMxAKX9dsVTaNsvwB_tWNiCxnE'
)

const monthStyles = {
  January: { bg: 'bg-[#f0f4f8]', text: 'text-slate-800', accent: 'border-slate-300' },
  February: { bg: 'bg-[#fdf2f2]', text: 'text-rose-900', accent: 'border-rose-200' },
  March: { bg: 'bg-[#f2f8f2]', text: 'text-emerald-900', accent: 'border-emerald-200' },
  April: { bg: 'bg-[#f0f7f9]', text: 'text-sky-900', accent: 'border-sky-200' },
  May: { bg: 'bg-[#fbfcf0]', text: 'text-lime-900', accent: 'border-lime-200' },
  June: { bg: 'bg-[#fffdf0]', text: 'text-amber-900', accent: 'border-amber-200' },
  July: { bg: 'bg-[#fffaf0]', text: 'text-orange-900', accent: 'border-orange-200' },
  August: { bg: 'bg-[#fdfbf7]', text: 'text-yellow-800', accent: 'border-yellow-200' },
  September: { bg: 'bg-[#f7f3f0]', text: 'text-stone-800', accent: 'border-stone-300' },
  October: { bg: 'bg-[#fdf7f2]', text: 'text-orange-950', accent: 'border-orange-300' },
  November: { bg: 'bg-[#f4f4f4]', text: 'text-slate-900', accent: 'border-slate-300' },
  December: { bg: 'bg-[#f9f9fb]', text: 'text-indigo-900', accent: 'border-indigo-200' },
}

const haikuQuotes = [
  "“There is no place we cannot find flowers or think of the moon...” \n— Santōka Taneda",
  "“Meaning lies as much in the mind of the reader as in the haiku.” \n— Douglas R. Hofstadter",
  "“Haiku are meant to evoke an emotional response...” \n— Bukusai Ashagawa",
  "“The haiku reproduces the designating gesture of a child...” \n— Roland Barthes",
  "“Anything that is not actually present in one’s heart is not haiku.” \n— Santōka Taneda",
  "“Haiku is a snapshot in time. No veils, no mystery.” \n— Mestre",
  "“If death is like a sonnet then life would be a haiku.” \n— R.M. Engelhardt",
  "“You were almost like a haiku: said so little, but meant so much.” \n— Abraham Algahanem",
  "“Haiku is the deep breath of life.” \n— Santōka Taneda",
  "“The haiku is a moment, pure and unblemished.” \n— Mestre",
  "“The love of nature is religion, and that religion is poetry.” \n— R.H. Blyth"
];

const countSyllables = (str) => {
  const text = str.toLowerCase().replace(/[^a-z ]/g, "");
  if (text.length === 0) return 0;
  const words = text.split(/\s+/);
  return words.reduce((acc, word) => {
    if (word.length <= 3) return acc + 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$ Elizabeth/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return acc + (syllables ? syllables.length : 1);
  }, 0);
};

export default function Home() {
  const [prompt, setPrompt] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [syllableCount, setSyllableCount] = useState(0)
  const [newHaiku, setNewHaiku] = useState('')
  const [currentMonth, setCurrentMonth] = useState('January')
  const [loadingQuote, setLoadingQuote] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  useEffect(() => {
    const randomQuote = haikuQuotes[Math.floor(Math.random() * haikuQuotes.length)];
    setLoadingQuote(randomQuote);
    fetchPromptAndEntries()
  }, [])

  async function fetchPromptAndEntries() {
    const now = new Date()
    const monthName = now.toLocaleString('default', { month: 'long' })
    const dayNum = now.getDate()
    setCurrentMonth(monthName)

    // Using created_at for sorting to be safe
    const { data: promptData } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (promptData) {
      setPrompt(promptData)
      const { data: entriesData } = await supabase
        .from('entries')
        .select('*')
        .eq('prompt_id', promptData.id)
        .order('created_at', { ascending: false })
      
      setEntries(entriesData || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (syllableCount !== 17) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400); 
      return; 
    }

    const { error } = await supabase
      .from('entries')
      .insert([
        { 
          content: newHaiku, 
          name: newName, // FIXED: Changed 'author' to 'name' to match your DB
          prompt_id: prompt.id 
        },
      ]);

    if (!error) {
      setNewHaiku('');
      setNewName('');
      setSyllableCount(0);
      fetchPromptAndEntries();
    }
  };

  const style = monthStyles[currentMonth] || monthStyles.January

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
      <p className="italic text-lg opacity-80 whitespace-pre-wrap max-w-md">{loadingQuote}</p>
      <div className="w-4 h-4 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
    </div>
  )

  return (
    <main className={`min-h-screen ${style.bg} ${style.text} p-8 flex flex-col items-center transition-colors duration-1000 font-serif relative`}>
      
      {/* --- PINNED NAVIGATION --- */}
      <div className="fixed top-8 left-8 z-50">
        <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">Seventeen Syllables</span>
      </div>

      <div className="fixed top-8 right-8 text-right z-50">
        <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">
          {prompt?.created_at ? new Date(prompt.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ""}
        </div>
        <Link 
          href="/archive" 
          className="block text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all duration-500 border-t border-black/5 pt-2"
        >
          Archive —&gt;
        </Link>
      </div>
      
      {/* Theme Section */}
      {prompt && (
        <div className="max-w-xl w-full text-center mt-32 mb-20 animate-fade-in">
          <p className="text-[10px] uppercase tracking-[0.6em] opacity-50 mb-6 font-sans italic">
            {prompt.vibe}
          </p>
          <h1 className="text-5xl md:text-6xl font-light italic mb-6 tracking-tight">
            {prompt.theme}
          </h1>
          <p className="italic opacity-60 text-sm mb-6 max-w-sm mx-auto">"{prompt.prompt_text}"</p>
          <div className={`w-8 h-[1px] ${style.accent} border-b mx-auto opacity-50`}></div>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-6 mb-32 bg-white/20 backdrop-blur-md p-8 rounded-sm animate-fade-in">
        <textarea 
          placeholder="Your 17 Syllables..." 
          value={newHaiku}
          onChange={(e) => {
            setNewHaiku(e.target.value);
            setSyllableCount(countSyllables(e.target.value));
          }}
          rows="3"
          className="w-full bg-transparent border-none focus:ring-0 py-2 italic leading-relaxed text-center placeholder:opacity-30 text-lg"
        />

        <div className="flex flex-col items-center gap-6 border-t border-black/5 pt-6">
          <input 
            type="text" 
            placeholder="Initials" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={5}
            className="bg-transparent border-none focus:ring-0 text-center text-[10px] uppercase tracking-widest w-24 placeholder:opacity-40"
          />
          <div className="flex items-center gap-6">
            <span className={`text-[10px] uppercase tracking-widest ${syllableCount === 17 ? 'opacity-100' : 'opacity-20'}`}>
              {syllableCount} / 17
            </span>
            <button 
              type="submit" 
              className={`text-[10px] uppercase tracking-[0.3em] transition-all duration-500 ${isShaking ? 'text-red-500' : 'opacity-40 hover:opacity-100'}`}
            >
              {syllableCount === 17 ? 'Share' : 'Syllables'}
            </button>
          </div>
        </div>
      </form>

      {/* Community List */}
      <div className="max-w-md w-full space-y-24 mb-40 text-center">
        {entries.map((entry, index) => (
          <div key={entry.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <pre className="italic text-xl leading-relaxed whitespace-pre-wrap font-serif opacity-80">
              {entry.content}
            </pre>
            <p className="mt-4 text-[9px] uppercase tracking-[0.3em] opacity-30">
              — {entry.name || 'anon'}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}