import './globals.css'

export const metadata = {
  title: 'Daily Haiku Sanctuary',
  description: 'One word, one vibe, every day.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}