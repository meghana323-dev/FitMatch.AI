import { useState, useRef } from 'react'
import styles from './App.module.css'

const OCCASION_COLORS = {
  'casual': '#7dd3a8',
  'date night': '#f4a7b9',
  'work': '#93c5fd',
  'weekend': '#fbbf24',
  'party': '#c4b5fd',
  'beach': '#67e8f9',
  'default': '#e8c4a0'
}

export default function App() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const analyze = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('image', image)
    try {
      const res = await fetch('http://localhost:3001/api/analyze', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.logoText}>FitMatch<span className={styles.logoAi}>.AI</span></span>
          </div>
          <p className={styles.tagline}>Upload your piece. We'll style the rest.</p>
        </div>
      </header>

      <main className={styles.main}>
        {!result ? (
          <div className={styles.uploadSection}>
            <div
              className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${preview ? styles.hasImage : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !preview && fileRef.current.click()}
            >
              {preview ? (
                <div className={styles.previewWrapper}>
                  <img src={preview} alt="Uploaded clothing" className={styles.previewImg} />
                  <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); reset() }}>✕</button>
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <div className={styles.dropIcon}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className={styles.dropTitle}>Drop your outfit piece here</p>
                  <p className={styles.dropSub}>or click to browse · JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files[0])} />

            {error && <p className={styles.error}>⚠ {error}</p>}

            {preview && (
              <button className={styles.analyzeBtn} onClick={analyze} disabled={loading}>
                {loading ? (
                  <><span className={styles.spinner} /> Styling your look…</>
                ) : (
                  <><span>✦</span> Get Style Inspiration</>
                )}
              </button>
            )}

            <div className={styles.howItWorks}>
              <p className={styles.howTitle}>How it works</p>
              <div className={styles.steps}>
                <div className={styles.step}><span className={styles.stepNum}>01</span><span>Upload a photo of any clothing item</span></div>
                <div className={styles.step}><span className={styles.stepNum}>02</span><span>AI analyzes style, color & vibe</span></div>
                <div className={styles.step}><span className={styles.stepNum}>03</span><span>Get 6 curated outfit inspirations</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <div className={styles.uploadedItem}>
                <img src={preview} alt="Your item" className={styles.thumbImg} />
                <div className={styles.itemInfo}>
                  <p className={styles.itemLabel}>Your piece</p>
                  <h2 className={styles.itemTitle}>{result.item.type}</h2>
                  <div className={styles.itemMeta}>
                    <span className={styles.tag}>{result.item.style}</span>
                    <span className={styles.tag}>{result.item.season}</span>
                  </div>
                  <div className={styles.colorDots}>
                    {result.item.colors.map((c, i) => (
                      <span key={i} className={styles.colorLabel}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button className={styles.newBtn} onClick={reset}>← Try another piece</button>
            </div>

            {result.styleNotes && (
              <div className={styles.styleNotes}>
                <h3 className={styles.sectionTitle}>✦ Stylist Notes</h3>
                <div className={styles.notesList}>
                  {result.styleNotes.map((note, i) => (
                    <div key={i} className={styles.noteItem}>
                      <span className={styles.noteNum}>{String(i + 1).padStart(2, '0')}</span>
                      <p>{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.outfitsSection}>
              <h3 className={styles.sectionTitle}>✦ Style Inspirations</h3>
              <div className={styles.grid}>
                {result.outfits.map((outfit, i) => (
                  <OutfitCard key={i} outfit={outfit} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>FitMatch.AI — Powered by Claude AI</p>
      </footer>
    </div>
  )
}

function OutfitCard({ outfit, index }) {
  const occasionColor = OCCASION_COLORS[outfit.occasion?.toLowerCase()] || OCCASION_COLORS.default

  return (
    <div className={styles.card}>
      <div className={styles.cardPalette}>
        {outfit.colorPalette?.map((color, i) => (
          <div key={i} className={styles.paletteBlock} style={{ background: color }} title={color} />
        ))}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <span className={styles.cardOccasion} style={{ color: occasionColor, borderColor: occasionColor + '44' }}>
            {outfit.occasion}
          </span>
          <span className={styles.cardMood}>{outfit.mood}</span>
        </div>
        <h3 className={styles.cardTitle}>{outfit.title}</h3>
        <p className={styles.cardDesc}>{outfit.description}</p>
        <div className={styles.pieces}>
          <p className={styles.piecesLabel}>Style with</p>
          <ul className={styles.piecesList}>
            {outfit.pieces.map((piece, i) => (
              <li key={i} className={styles.piece}>
                <span className={styles.pieceDot} />
                {piece}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
