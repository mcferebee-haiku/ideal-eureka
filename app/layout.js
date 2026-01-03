import './globals.css'

export const metadata = {
  title: '575x365',
  description: 'Seventeen syllables. Seven days a week.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}