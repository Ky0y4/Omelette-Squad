import { useState } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setText(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="app">
      <h1>Gang War Data Analyzer</h1>
      <input
        type="file"
        accept=".txt,.csv,.json,.md"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default App