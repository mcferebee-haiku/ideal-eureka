'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

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
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
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
  
  // NEW STATES FOR YOUR IDEAS
  const [loadingQuote, setLoadingQuote] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  useEffect(() => {
    // Pick the random quote immediately when the site opens
    const randomQuote = haikuQuotes[Math.floor(Math.random() * haikuQuotes.length)];
    setLoadingQuote(randomQuote);
    
    fetchPromptAndEntries()
  }, [])

  async function fetchPromptAndEntries() {
    const now = new Date()
    const monthName = now.toLocaleString('default', { month: 'long' })
    const dayNum = now.getDate()
    setCurrentMonth(monthName)

    const { data: promptData } = await supabase
      .from('prompts')
      .select('*')
      .ilike('month', monthName)
      .eq('day', dayNum)
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

  // THE BOUNCER LOGIC
  if (syllableCount !== 17) {
    setIsShaking(true);
    // This turns the shaking off after 0.4s so it can shake again later
    setTimeout(() => setIsShaking(false), 400); 
    return; // STOP HERE
  }

  // ... (Your existing code to save to Supabase goes here)
};

if (loading) return (
  <div className="min-h-screen flex items-center justify-center p-8 text-center italic">
    {/* Notice 'whitespace-pre-line' added below */}
    <p className="max-w-xs animate-pulse opacity-60 text-sm tracking-wide leading-relaxed whitespace-pre-line">
      {loadingQuote}
    </p>
  </div>
);

  const style = monthStyles[currentMonth] || monthStyles.January

  return (
    <main className={`min-h-screen ${style.bg} ${style.text} p-8 flex flex-col items-center transition-colors duration-1000 font-serif relative`}>
      
      {/* --- LOGO SECTION --- */}
      <div className="absolute top-6 left-4 opacity-40 hover:opacity-100 transition-opacity">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-23 h-23 object-contain"
          onError={(e) => e.target.style.display='none'} 
        />
      </div>

      {/* --- DATE SECTION --- */}
      <div className="absolute top-8 right-8 text-[10px] uppercase tracking-[0.3em] opacity-40 font-sans">
        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
      
      {/* 1. Theme Word Section */}
      {prompt && (
        <div className="max-w-xl w-full text-center mt-24 mb-20 animate-fade-in">
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4 font-sans">Today's Theme</p>
          <p className="text-[10px] uppercase tracking-[0.6em] opacity-50 mb-6 font-sans italic">
            {prompt.vibe}
          </p>
          <h1 className="text-5xl md:text-6xl font-light italic mb-6 tracking-tight">
            {prompt.theme}
          </h1>
          <div className={`w-8 h-[1px] ${style.accent} border-b mx-auto opacity-50`}></div>
        </div>
      )}

      {/* 2. Submission Form */}
   <form onSubmit={handleSubmit} className="max-w-md w-full space-y-6 mb-20 bg-white/30 backdrop-blur-md p-8 rounded-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
  
  {/* The Text Area */}
  <textarea 
    placeholder="Your 17 Syllables For The Day" 
    value={newHaiku}
    onChange={(e) => {
      const text = e.target.value;
      setNewHaiku(text);
      setSyllableCount(countSyllables(text)); // This makes the number dance!
    }}
    rows="3"
    className="w-full bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black/30 transition-colors italic leading-relaxed text-center placeholder:opacity-40"
  />

  {/* The Counter - Now safely outside the textarea */}
  <div className="flex justify-between items-center mt-[-15px] mb-4">
    <span className={`text-[10px] uppercase tracking-widest ${syllableCount > 17 ? 'text-red-500 font-bold' : 'opacity-40'}`}>
      {syllableCount} / 17 Syllables
    </span>
  </div>

  {/* The Initials Input */}
  <input 
    type="text" 
    placeholder="Your initials" 
    value={newName}
    onChange={(e) => setNewName(e.target.value)}
    maxLength={5}
    className="w-full bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black/30 transition-colors text-center text-sm tracking-widest uppercase placeholder:normal-case placeholder:italic placeholder:opacity-40"
  />

  {/* The Button */}
 <button 
  type="submit" 
  className={`w-full py-2 border border-black/20 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 
    ${isShaking ? 'animate-shake border-red-500 text-red-500' : 'hover:bg-black hover:text-white'}`}
>
  {syllableCount === 17 ? 'Submit' : 'Must be 17 syllables'}
</button>
</form>
      {/* 3. Community Entries */}
      <div className="max-w-2xl w-full space-y-20 mb-40">
        <h2 className="text-center text-[10px] uppercase tracking-[0.4em] opacity-40 border-b border-black/5 pb-4 font-sans">Today's Haikus</h2>
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <div 
              key={entry.id} 
              className="text-left animate-fade-in mx-auto max-w-sm" 
              style={{ animationDelay: `${0.8 + (index * 0.2)}s` }}
            >
              <pre className="italic text-xl leading-loose whitespace-pre-wrap opacity-90 font-serif">
                {entry.content}
              </pre>
              <p className="mt-4 text-[10px] uppercase tracking-[0.3em] opacity-40">— {entry.name}</p>
            </div>
          ))
        ) : (
          <p className="text-center italic opacity-30 text-sm">Silence, for now.</p>
        )}
      </div>
    </main>
  )
}