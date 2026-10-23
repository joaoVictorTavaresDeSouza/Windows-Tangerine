
import { useRef, useState } from 'react'
import './App.css'
import tangerineLogo from './assets/tangerine-logo-transparent.png'

type MenuItem = {
  id: string
  label: string
  icon: string
  description?: string
}

const mainItems: MenuItem[] = [
  { id: 'image', label: 'Imagem', icon: '▧' },
  { id: 'video', label: 'Vídeo', icon: '▶' },
  { id: 'audio', label: 'Áudio', icon: '♫' },
  { id: 'pdf', label: 'PDF', icon: '▤' },
  { id: 'archive', label: 'Compactar', icon: '⇩' },
  { id: 'other', label: 'Outros', icon: '···' },
]

const submenus: Record<string, MenuItem[]> = {
  image: [
    { id: 'png', label: 'PNG', icon: '▧', description: 'Imagem sem perdas' },
    { id: 'jpg', label: 'JPG', icon: '▧', description: 'Imagem compacta' },
    { id: 'webp', label: 'WebP', icon: '◈', description: 'Formato para web' },
    { id: 'avif', label: 'AVIF', icon: '◇', description: 'Alta eficiência' },
    { id: 'resize', label: 'Redimensionar', icon: '⤢' },
    { id: 'compress', label: 'Comprimir', icon: '⇲' },
  ],
  video: [
    { id: 'mp4', label: 'MP4', icon: '▶' },
    { id: 'webm', label: 'WebM', icon: '▷' },
    { id: 'gif', label: 'GIF', icon: '▧' },
    { id: 'extract-audio', label: 'Extrair áudio', icon: '♫' },
  ],
  audio: [
    { id: 'mp3', label: 'MP3', icon: '♫' },
    { id: 'wav', label: 'WAV', icon: '〰' },
    { id: 'flac', label: 'FLAC', icon: '♬' },
    { id: 'ogg', label: 'OGG', icon: '♪' },
  ],
  pdf: [
    { id: 'pdf-merge', label: 'Unir PDFs', icon: '⊕' },
    { id: 'pdf-split', label: 'Separar', icon: '⫽' },
    { id: 'pdf-images', label: 'Para imagens', icon: '▧' },
    { id: 'pdf-compress', label: 'Comprimir', icon: '⇲' },
  ],
  archive: [
    { id: 'zip', label: 'ZIP', icon: '▣' },
    { id: '7z', label: '7Z', icon: '▤' },
    { id: 'tar', label: 'TAR', icon: '▧' },
  ],
  other: [
    { id: 'rename', label: 'Renomear', icon: '✎' },
    { id: 'info', label: 'Informações', icon: 'ⓘ' },
    { id: 'organize', label: 'Organizar', icon: '☷' },
  ],
}

function App() {
  const [category, setCategory] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<MenuItem | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const items = category ? submenus[category] ?? [] : mainItems
  const activeCategory = mainItems.find((item) => item.id === category)

  function addFiles(incoming: FileList | File[]) {
    const added = Array.from(incoming)
    if (added.length === 0) return

    setFiles((current) => {
      const combined = [...current, ...added]
      return combined.filter(
        (file, index) =>
          combined.findIndex(
            (candidate) =>
              candidate.name === file.name &&
              candidate.size === file.size &&
              candidate.lastModified === file.lastModified,
          ) === index,
      )
    })
    setMessage('')
  }

  function goBack() {
    if (selectedTool) {
      setSelectedTool(null)
      setMessage('')
    } else if (files.length > 0) {
      setFiles([])
      setMessage('')
    } else {
      setCategory(null)
      setMessage('')
    }
  }

  function chooseItem(item: MenuItem) {
    if (!category) {
      setCategory(item.id)
      setSelectedTool(null)
      setMessage('')
      return
    }

    setSelectedTool(item)
    setMessage('')
  }

  function runAction() {
    if (files.length === 0) {
      inputRef.current?.click()
      return
    }

    setMessage(
      'Ação selecionada. A conversão real será conectada ao Electron na próxima etapa.',
    )
  }

  return (
    <main
      className={`radial-app ${dragging ? 'is-dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragging(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        addFiles(event.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <div className="radial-stage">
        <div className="orbit orbit-outer" />
        <div className="orbit orbit-inner" />

        <div className="radial-center">
          <button
            className={`center-button ${selectedTool ? 'center-selected' : ''}`}
            onClick={goBack}
            title={selectedTool ? 'Voltar às opções' : category ? 'Voltar ao menu' : 'Tangerine'}
            aria-label={selectedTool ? 'Voltar às opções' : category ? 'Voltar ao menu' : 'Tangerine'}
          >
            {selectedTool ? (
            <span className="center-back">↶</span>
            ) : (
            <img
              className="center-logo-image"
              src={tangerineLogo}
              alt="Tangerine"
            />
            )}
            <span className="center-caption">
              {selectedTool ? 'VOLTAR' : category ? 'VOLTAR' : 'QUICK'}
            </span>
            {!category && !selectedTool && (
              <span className="center-caption">ACTIONS</span>
            )}
            {category && !selectedTool && (
              <span className="center-caption">MENU</span>
            )}
          </button>
        </div>

        {items.map((item, index) => {
          const angle = -90 + (360 / items.length) * index
          const radius = category ? 35 : 35
          const selected = selectedTool?.id === item.id

          return (
            <button
              key={`${category ?? 'main'}-${item.id}`}
              className={`radial-item ${selected ? 'is-selected' : ''}`}
              style={{
                left: `${50 + Math.cos((angle * Math.PI) / 180) * radius}%`,
                top: `${50 + Math.sin((angle * Math.PI) / 180) * radius}%`,
                transitionDelay: `${index * 35}ms`,
              }}
              onClick={() => chooseItem(item)}
              title={item.description ?? item.label}
              aria-pressed={selected}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
            </button>
          )
        })}

        <div className={`radial-status ${category ? 'status-visible' : ''}`}>
          {selectedTool ? (
            <>
              <span className="status-title">{selectedTool.label}</span>
              <span className="status-subtitle">
                {files.length > 0
                  ? `${files.length} arquivo(s) selecionado(s)`
                  : 'Escolha ou solte um arquivo'}
              </span>
              {files.length > 0 && (
                <button className="status-action" onClick={runAction}>
                  Continuar <span>↗</span>
                </button>
              )}
              {message && <span className="status-message">{message}</span>}
            </>
          ) : category ? (
            <>
              <span className="status-title">{activeCategory?.label}</span>
              <span className="status-subtitle">
                {files.length > 0
                  ? `${files.length} arquivo(s) adicionado(s)`
                  : 'Escolha uma opção'}
              </span>
              {files.length > 0 && (
                <button
                  className="status-action"
                  onClick={() => inputRef.current?.click()}
                >
                  Adicionar arquivo <span>+</span>
                </button>
              )}
            </>
          ) : (
            <span className="status-hint">ESC para voltar</span>
          )}
        </div>

        {files.length > 0 && (
          <button
            className="file-chip"
            onClick={() => {
              setSelectedTool(null)
              setMessage('')
            }}
            title={files.map((file) => file.name).join('\n')}
          >
            <span className="file-chip-dot" />
            {files.length} ARQUIVO(S)
            <span
              className="file-chip-remove"
              onClick={(event) => {
                event.stopPropagation()
                setFiles([])
                setMessage('')
              }}
            >
              ×
            </span>
          </button>
        )}

        <div className="drop-hint">
          {dragging ? 'SOLTE PARA ADICIONAR' : 'ARRASTE UM ARQUIVO'}
        </div>
      </div>
    </main>
  )
}

export default App