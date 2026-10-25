
import { useRef, useState } from 'react'
import './App.css'
import tangerineLogo from './assets/tangerine-logo-transparent.png'
import RadialMenu, { type MenuItem } from './RadialMenu'

type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'document'
  | 'mixed'
  | 'other'

function getFileKind(files: File[]): FileKind | null {
  if (files.length === 0) return null

  function getKind(file: File): Exclude<FileKind, 'mixed'> {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

    const extensions: Record<string, Exclude<FileKind, 'mixed'>> = {
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      webp: 'image',
      gif: 'image',
      avif: 'image',
      bmp: 'image',
      tif: 'image',
      tiff: 'image',
      svg: 'image',
      heic: 'image',
      heif: 'image',

      mp4: 'video',
      mov: 'video',
      mkv: 'video',
      webm: 'video',
      avi: 'video',
      m4v: 'video',
      wmv: 'video',
      mpg: 'video',
      mpeg: 'video',

      mp3: 'audio',
      wav: 'audio',
      flac: 'audio',
      ogg: 'audio',
      m4a: 'audio',
      aac: 'audio',
      wma: 'audio',
      opus: 'audio',

      pdf: 'pdf',

      zip: 'archive',
      rar: 'archive',
      '7z': 'archive',
      tar: 'archive',
      gz: 'archive',
      bz2: 'archive',
      xz: 'archive',

      doc: 'document',
      docx: 'document',
      txt: 'document',
      rtf: 'document',
      odt: 'document',
      xls: 'document',
      xlsx: 'document',
      csv: 'document',
      ppt: 'document',
      pptx: 'document',
      ods: 'document',
      odp: 'document',
    }

    return extensions[extension] ?? 'other'
  }

  const kinds = files.map(getKind)
  const firstKind = kinds[0]

  return kinds.every((kind) => kind === firstKind)
    ? firstKind
    : 'mixed'
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

function FileTypeIcon({ kind }: { kind: FileKind }) {
  const common = {
    viewBox: '0 0 48 48',
    width: 46,
    height: 46,
    fill: 'none',
    stroke: '#ff8737',
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (kind) {
    case 'image':
      return (
        <svg {...common}>
          <rect x="5" y="7" width="38" height="34" rx="6" />
          <circle cx="17" cy="18" r="3" />
          <path d="M7 34l11-11 8 8 6-6 9 9" />
        </svg>
      )

    case 'video':
      return (
        <svg {...common}>
          <rect x="4" y="10" width="28" height="28" rx="5" />
          <path d="M32 19l12-7v24l-12-7z" />
          <path d="M15 18l10 6-10 6z" />
        </svg>
      )

    case 'audio':
      return (
        <svg {...common}>
          <path d="M5 25h7l5-12 8 23 6-17 4 6h8" />
          <circle cx="24" cy="24" r="20" opacity=".35" />
        </svg>
      )

    case 'pdf':
    case 'document':
      return (
        <svg {...common}>
          <path d="M12 4h16l9 9v31H12z" />
          <path d="M28 4v10h9M18 23h13M18 29h13M18 35h9" />
          {kind === 'pdf' && (
            <text
              x="24"
              y="42"
              fill="#ff8737"
              stroke="none"
              fontSize="7"
              textAnchor="middle"
            >
              PDF
            </text>
          )}
        </svg>
      )

    case 'archive':
      return (
        <svg {...common}>
          <rect x="5" y="8" width="38" height="33" rx="5" />
          <path d="M5 16h38M20 8v8h8V8M20 23h8m-8 6h8m-8 6h8" />
        </svg>
      )

    case 'mixed':
      return (
        <svg {...common}>
          <rect x="5" y="13" width="25" height="29" rx="4" />
          <rect
            x="18"
            y="5"
            width="25"
            height="29"
            rx="4"
            fill="#211d19"
          />
          <path d="M23 24l5-6 5 5 3-3 4 5M24 12h13" />
        </svg>
      )

    default:
      return (
        <svg {...common}>
          <path d="M12 4h16l9 9v31H12z" />
          <path d="M28 4v10h9M18 24h13M18 30h13" />
        </svg>
      )
  }
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

  // Identifica o tipo dos arquivos recebidos.
  const fileKind = getFileKind(files)

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
        <div className="radial-center">
          
<button
  
className={`center-button ${selectedTool ? 'center-selected' : ''} ${fileKind ? 'center-has-file' : ''}`}
  onClick={goBack}
  title={
    fileKind
      ? 'Arquivos recebidos — clique para voltar ou limpar a seleção'
      : selectedTool
        ? 'Voltar às opções'
        : category
          ? 'Voltar ao menu'
          : 'Tangerine'
  }
  aria-label={
    fileKind
      ? 'Arquivos recebidos'
      : selectedTool
        ? 'Voltar às opções'
        : category
          ? 'Voltar ao menu'
          : 'Tangerine'
  }
>
  {fileKind ? (
    <FileTypeIcon kind={fileKind} />
  ) : (
    <img
      className="center-logo-image"
      src={tangerineLogo}
      alt="Tangerine"
    />
  )}

  
  {fileKind && category && (
    <button
      type="button"
      className="center-back-small"
      onClick={(event) => {
        event.stopPropagation()
        setSelectedTool(null)
        setCategory(null)
        setMessage('')
      }}
      title="Voltar ao menu principal"
      aria-label="Voltar ao menu principal"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    </button>
  )}


  {!fileKind && (
    <>
      <span className="center-caption">
        {category ? 'VOLTAR' : 'SOLTE UM'}
      </span>

      {!category && !selectedTool && (
        <span className="center-caption">ARQUIVO</span>
      )}

      {category && !selectedTool && (
        <span className="center-caption">MENU</span>
      )}
    </>
  )}
</button>

        </div>

        <RadialMenu
          key={category ?? 'main'}
          items={items}
          selectedId={selectedTool?.id}
          onSelect={chooseItem}
        />

        
{!fileKind || selectedTool ? (
  <div className={`radial-status ${category ? 'status-visible' : ''}`}>
    {!category ? null : selectedTool ? (
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
    ) : (
      <>
        <span className="status-title">{activeCategory?.label}</span>

        <span className="status-subtitle">
          Escolha uma opção
        </span>
      </>
    )}
  </div>
) : null}


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