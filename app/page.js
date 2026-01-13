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
  "“There is no place we cannot find \n flowers or think of the moon...” \n— Santōka Taneda",
  "“Meaning lies as much in the mind \n of the reader as in the haiku.” \n— Douglas R. Hofstadter",
  "“Haiku are meant to evoke an emotional response...” \n— Bukusai Ashagawa",
  "“The haiku reproduces the designating gesture of a child...” \n— Roland Barthes",
  "“Anything that is not actually present \n in one’s heart is not haiku.” \n— Santōka Taneda",
  "“Haiku is a snapshot in time. No veils, no mystery.” \n— Mestre",
  "“If death is like a sonnet then life would be a haiku.” \n— R.M. Engelhardt",
  "“You were almost like a haiku: \n said so little, but meant so much.” \n— Abraham Algahanem",
  "“Haiku is the deep breath of life.” \n— Santōka Taneda",
  "“The haiku is a moment, pure and unblemished.” \n— Mestre",
  "“The love of nature is religion, \n and that religion is poetry.” \n— R.H. Blyth"
];

const countSyllables = (str) => {
  if (!str) return 0;
  let word = str.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  // 1. Remove common silent endings
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  
  // 2. Handle 'y' at the beginning (consonant) vs end (vowel)
  word = word.replace(/^y/, '');

  // 3. Match vowel groups (this is the heart of the count)
  // This looks for 1 or 2 vowels together as a single sound
  const syllableMatches = word.match(/[aeiouy]{1,2}/g);
  let count = syllableMatches ? syllableMatches.length : 1;

  // 4. Fine-tuning for common poetic words
  if (word.endsWith('ia')) count++; // e.g., 'fuchsia', 'militia'
  if (word.endsWith('ier')) count++; // e.g., 'happier'
  
  return count;
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
const [buttonText, setButtonText] = useState('Share'); // New state for text
  const [isRotating, setIsRotating] = useState(false);  // New state for animation
  
  const poeticPhrases = ["Very nice", "Lovely", "Very poignant", "So poetic", "Beautiful", "Perfect"];
  useEffect(() => {
    const randomQuote = haikuQuotes[Math.floor(Math.random() * haikuQuotes.length)];
    setLoadingQuote(randomQuote);
    fetchPromptAndEntries()
  }, [])

async function fetchPromptAndEntries() {
    // 1. Create a "Timer" promise (e.g., 2500ms = 2 seconds)
    const timer = new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const now = new Date()
      const monthName = now.toLocaleString('default', { month: 'long' })
      const dayNum = now.getDate()
      setCurrentMonth(monthName)

      // 2. Start the database fetch
      const fetchTask = supabase
        .from('prompts')
        .select('*')
        .ilike('month', monthName)
        .eq('day', dayNum)
        .single()
      
      // 3. Wait for BOTH the database and the timer to finish
      const [promptResult] = await Promise.all([fetchTask, timer]);
      const promptData = promptResult.data;
      
      if (promptData) {
        setPrompt(promptData)
        const { data: entriesData } = await supabase
          .from('entries')
          .select('*')
          .eq('prompt_id', promptData.id)
          .order('created_at', { ascending: false })
        
        setEntries(entriesData || [])
      }
    } catch (err) {
      console.error('Error fetching:', err);
    } finally {
      // 4. This only runs once BOTH are done
      setLoading(false)
    }
  }
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!prompt || !prompt.id) return;

  // We removed the syllableCount check and setIsShaking(true) here

  const { error } = await supabase
    .from('entries')
    .insert([
      { 
        content: newHaiku, 
        author: newName || 'anon', 
        prompt_id: prompt.id 
      },
    ]);

  if (error) {
    console.error('Error details:', error);
    alert(`Submission Failed: ${error.message}`);
  } else {
    // Pick the random phrase
    const randomPhrase = poeticPhrases[Math.floor(Math.random() * poeticPhrases.length)];
    
    setButtonText(randomPhrase);
    setIsRotating(true);
    
    setNewHaiku('');
    setNewName('');
    setSyllableCount(0);
    
    // Reset button after 3 seconds
    setTimeout(() => {
      setIsRotating(false);
      setButtonText('Share');
    }, 3000);

    fetchPromptAndEntries();
  }
};

  const style = monthStyles[currentMonth] || monthStyles.January

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] p-8">
      <p className="max-w-md text-center font-serif italic opacity-60 leading-relaxed whitespace-pre-line animate-pulse">
        {loadingQuote}
      </p>
    </div>
  )
}

  return (
<main className={`min-h-screen ${style.bg} ${style.text} p-8 flex flex-col items-center transition-colors duration-1000 font-serif relative animate-fade-in`}>      
{/* --- LOGO SECTION --- */}
<div className="absolute top-6 left-4 opacity-40 hover:opacity-100 transition-opacity z-30">
  <a href="mailto:matt@ferebeelane.com?subject=Haiku%20Hi">
    <img 
      src="/logo.png" 
      alt="Contact"
      className="w-21 h-21 object-contain cursor-pointer"
      onError={(e) => e.target.style.display='none'} 
    />
  </a>
</div>

      <div className="absolute top-8 right-8 text-right z-20">
        <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2 font-sans">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        
        <Link 
          href="/archive" 
          className="block text-[10px] uppercase tracking-[0.3em] opacity-35 hover:opacity-100 transition-all duration-500 border-t border-black/5 pt-2 font-sans"
        >
          Archive —&gt;
        </Link>
      </div>
      
      {prompt && (
        <div className="max-w-xl w-full text-center mt-24 mb-20 animate-fade-in">
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-70 mb-2 font-sans">Theme // Prompt</p>
          <p className="text-[10px] uppercase tracking-[0.6em] opacity-80 mb-2 font-sans italic">
            {prompt.vibe}
          </p>
          <h1 className="text-5xl md:text-6xl font-light italic mb-4 tracking-tight">
            {prompt.theme}
          </h1>
          <div className={`w-8 h-[1px] ${style.accent} border-b mx-auto opacity-50`}></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-6 mb-15 bg-white/30 backdrop-blur-md p-8 rounded-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <textarea 
          placeholder="Your Haiku with Prompt" 
          value={newHaiku}
          onChange={(e) => {
            const text = e.target.value;
            setNewHaiku(text);
            setSyllableCount(countSyllables(text));
          }}
          rows="3"
          className="w-full bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black/30 transition-colors italic leading-relaxed text-center placeholder:opacity-70"
        />

        <div className="flex justify-between items-center mt-[-15px] mb-4">
          <span className={`text-[10px] uppercase tracking-widest ${syllableCount > 17 ? 'text-cyan-800 font-bold' : 'opacity-60'} font-sans`}>
            ~{syllableCount} / 17 Syllables
          </span>
        </div>

        <input 
          type="text" 
          placeholder="Your initials" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={5}
          className="w-full bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black/30 transition-colors text-center text-sm tracking-widest uppercase placeholder:normal-case placeholder:italic placeholder:opacity-70 font-sans"
        />

<button 
  type="submit" 
  className={`w-full py-2 border border-black/20 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 font-sans
    ${isRotating ? 'animate-confirm bg-black text-white' : 'hover:bg-black hover:text-white'}
  `}
>
  {buttonText}
</button>
      </form>

      <div className="max-w-2xl w-full space-y-20 mb-40">
        <h2 className="text-center text-[10px] uppercase tracking-[0.4em] opacity-60 border-b border-black/5 pb-4 font-sans">Today's Haikus</h2>

        <div className="space-y-12 mt-8">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <div 
                key={entry.id} 
                className="text-center animate-slide-up mx-auto max-w-sm"
                style={{ animationDelay: `${0.8 + (index * 0.2)}s` }}
              >
                <p className="text-lg italic whitespace-pre-line leading-relaxed">
                  {entry.content}
                </p>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-2 font-sans">
                  — {entry.author || "anon"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-xs italic font-sans">No haikus yet today.</p>
          )}
        </div>
      </div>
      {/* --- FOOTER SECTION --- */}
      <footer className="w-full max-w-2xl mx-auto pb-12 pt-20 text-center space-y-4">
        <div className="w-4 h-[1px] bg-black/10 mx-auto mb-8"></div>
        <p className="text-[9px] uppercase tracking-[0.3em] opacity-30 leading-loose px-4">
          all submissions belong to the universe — haiku any questions or site issues{' '}
          <a 
            href="mailto:matt@ferebeelane.com?subject=Haiku%20Hi" 
            className="underline underline-offset-4 hover:opacity-100 transition-opacity"
          >
            here
          </a>
        </p>
      </footer>
    </main>
  )
}