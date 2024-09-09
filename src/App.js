/* global chrome */

import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [inputText, setInputText] = useState('')
    const [storedTexts, setStoredTexts] = useState([])

    useEffect(() => {
        chrome.storage.local.get('texts').then(({ texts }) => {
            if (texts) setStoredTexts(texts)
        })
    }, [])

    const handleInputChange = (event) => setInputText(event.target.value)

    const handleAddText = () => {
        if (!inputText.trim()) return

        const newStoredTexts = [...storedTexts, inputText.trim()]
        chrome.storage.local.set({ texts: newStoredTexts }).then(() => {
            setStoredTexts(newStoredTexts)
            setInputText('')
        })
    }

    const handleRemoveText = (index) => {
        const newStoredTexts = storedTexts.filter((_, i) => i !== index)
        chrome.storage.local.set({ texts: newStoredTexts }, () => setStoredTexts(newStoredTexts))
    }

    const handleSearchText = (text) => {
        chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: (searchTerm) => window.find(searchTerm, false, false, true),
                args: [text],
            })
        })
    }

    return (
        <div style={{ padding: '20px', width: '300px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
                    className="Input"
                    placeholder="keyword..."
                    style={{ borderRadius: '10px', border: '2px solid white' }}
                />
                <button onClick={handleAddText} className="Btn" style={{ width: '70px', margin: '0' }}>
                    Add
                </button>
            </div>
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    width: '100%',
                    marginTop: '20px',
                }}
            >
                {storedTexts?.map((text, index) => (
                    <div key={index} style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleSearchText(text)} className="Btn">
                            {text}
                        </button>
                        <button
                            onClick={() => handleRemoveText(index)}
                            style={{
                                cursor: 'pointer',
                                background: '#fff',
                                borderRadius: '100%',
                                width: '30px',
                                height: '30px',
                                fontSize: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            <p style={{ color: 'white', marginTop: '8px' }}>Fast Open: (Ctrl or Cmd)+Shift+F</p>
        </div>
    )
}

export default App
