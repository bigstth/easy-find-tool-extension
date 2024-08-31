/* global chrome */

import React, { useState, useEffect } from 'react'
import './App.css'
const isExtensionEnvironment = () => {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
}

function App() {
    const [inputText, setInputText] = useState('')
    const [storedTexts, setStoredTexts] = useState([])

    useEffect(() => {
        if (isExtensionEnvironment()) {
            import('webextension-polyfill').then((browser) => {
                browser.storage.local.get(['texts']).then((result) => {
                    if (result.texts) {
                        setStoredTexts(result.texts)
                    }
                })
            })
        }
    }, [])

    const handleInputChange = (event) => {
        setInputText(event.target.value)
    }

    const handleAddText = () => {
        if (!isExtensionEnvironment() || inputText?.length === 0) return

        import('webextension-polyfill').then((browser) => {
            if (inputText.trim()) {
                const newStoredTexts = [...storedTexts, inputText.trim()]

                browser.storage.local.set({ texts: newStoredTexts }).then(() => {
                    setStoredTexts(newStoredTexts)
                })

                setInputText('')
            }
        })
    }

    const handleRemoveText = (index) => {
        const newStoredTexts = storedTexts.filter((_, i) => i !== index)

        chrome.storage.local.set({ texts: newStoredTexts }, () => {
            setStoredTexts(newStoredTexts)
        })
    }

    const handleSearchText = (text) => {
        if (!isExtensionEnvironment()) return
        import('webextension-polyfill').then((browser) => {
            browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                browser.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: (searchTerm) => window.find(searchTerm, false, false, true),
                    args: [text],
                })
            })
        })
    }

    return (
        <div style={{ padding: '20px', width: '300px' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <input type="text" value={inputText} onChange={handleInputChange} onKeyDown={(e) => e.key === 'Enter' && handleAddText()} className="Input" placeholder="keyword..." />
                <button onClick={handleAddText} className="Btn" style={{ width: '70px', margin: '0' }}>
                    Add
                </button>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: '100%', marginTop: '20px' }}>
                {storedTexts.map((text, index) => (
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <button key={index} onClick={() => handleSearchText(text)} className="Btn">
                            {text}
                        </button>
                        <button
                            onClick={() => handleRemoveText(index)}
                            style={{ cursor: 'pointer', background: '#fff', borderRadius: '100%', width: '30px', height: '30px', fontSize: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            <p style={{ color: 'white', marginTop: '8px' }}>Fast Open: (Crtl or Cmd)+Shift+F</p>
        </div>
    )
}

export default App
