export default function TemplatesPanel() {
  const [templates, setTemplates] = useState(() => loadTemplates())
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [previewTpl, setPreviewTpl] = useState(null)

  // Wizard state
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 4

  // Step 1: Basic info
  const [name, setName] = useState('')
  const [category, setCategory] = useState('UTILITY')
  const [language, setLanguage] = useState('en')

  // Step 2: Header
  const [hasHeader, setHasHeader] = useState(false)
  const [headerText, setHeaderText] = useState('')

  // Step 3: Body (the message)
  const [bodyText, setBodyText] = useState('')

  // Step 4: Footer + buttons
  const [hasFooter, setHasFooter] = useState(false)
  const [footerText, setFooterText] = useState('')

  function resetForm() {
    setStep(1)
    setName('')
    setCategory('UTILITY')
    setLanguage('en')
    setHasHeader(false)
    setHeaderText('')
    setBodyText('')
    setHasFooter(false)
    setFooterText('')
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(tpl) {
    const headerComp = tpl.components.find(c => c.type === 'header')
    const bodyComp = tpl.components.find(c => c.type === 'body')
    const footerComp = tpl.components.find(c => c.type === 'footer')

    setName(tpl.name)
    setCategory(tpl.category)
    setLanguage(tpl.language)
    setHasHeader(!!headerComp)
    setHeaderText(headerComp?.text || '')
    setBodyText(bodyComp?.text || '')
    setHasFooter(!!footerComp)
    setFooterText(footerComp?.text || '')
    setEditing(tpl.id)
    setStep(1)
    setShowForm(true)
  }

  function handleSave() {
    if (!name.trim() || !bodyText.trim()) return

    const components = []
    if (hasHeader && headerText.trim()) {
      components.push({ type: 'header', text: headerText.trim() })
    }
    components.push({ type: 'body', text: bodyText.trim() })
    if (hasFooter && footerText.trim()) {
      components.push({ type: 'footer', text: footerText.trim() })
    }

    const tplData = {
      name: name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      category,
      language,
      components,
    }

    if (editing) {
      const updated = templates.map(t =>
        t.id === editing ? { ...t, ...tplData, updatedAt: new Date().toISOString() } : t
      )
      setTemplates(updated)
      saveTemplates(updated)
    } else {
      const newTpl = { id: generateId(), ...tplData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const updated = [...templates, newTpl]
      setTemplates(updated)
      saveTemplates(updated)
    }
    resetForm()
  }

  function handleDelete(id) {
    const updated = templates.filter(t => t.id !== id)
    setTemplates(updated)
    saveTemplates(updated)
    if (previewTpl?.id === id) setPreviewTpl(null)
  }

  function exportTemplates() {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `whatsapp-templates-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importTemplates(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        if (Array.isArray(imported)) {
          const merged = [...templates]
          imported.forEach(tpl => {
            if (!merged.find(existing => existing.id === tpl.id)) {
              merged.push(tpl)
            }
          })
          setTemplates(merged)
          saveTemplates(merged)
        }
      } catch { alert('Archivo JSON inválido') }
    }
    reader.readAsText(file)
  }

  function canNext() {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return true // header is optional
    if (step === 3) return bodyText.trim().length > 0
    if (step === 4) return true // footer is optional
    return false
  }

  const stepLabels = ['Info Básica', 'Encabezado', 'Mensaje', 'Pie + Guardar']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            Templates ({templates.length})
          </h2>
          <div className="flex gap-2">
            <button onClick={exportTemplates} disabled={templates.length === 0} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 disabled:opacity-40 transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar JSON
            </button>
            <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" /> Importar
              <input type="file" accept=".json" onChange={importTemplates} className="hidden" />
            </label>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-500 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nuevo Template
            </button>
          </div>
        </div>

        {/* Template list */}
        {templates.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">No hay templates guardados</p>
            <p className="text-sm">Creá uno nuevo o importá un archivo JSON</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {templates.map(tpl => {
              const cat = TEMPLATE_CATEGORIES.find(c => c.value === tpl.category)
              const bodyText = tpl.components.find(c => c.type === 'body')?.text || ''
              const varCount = countVariables(bodyText)

              return (
                <div key={tpl.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${cat?.color || 'bg-slate-600'}`}>
                        {tpl.category}
                      </span>
                      <span className="text-xs text-slate-500">{tpl.language}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setPreviewTpl(previewTpl?.id === tpl.id ? null : tpl)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Vista previa">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleEdit(tpl)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(tpl.id)} className="p-1.5 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors" title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">{bodyText || 'Sin texto'}</p>
                  {varCount > 0 && <span className="text-xs text-green-400">{varCount} variable{varCount > 1 ? 's' : ''}</span>}

                  {previewTpl?.id === tpl.id && (
                    <div className="mt-3 p-3 rounded bg-slate-950 border border-slate-700">
                      <div className="text-xs text-slate-500 mb-2">Vista previa:</div>
                      {tpl.components.filter(c => c.type === 'header').map((c, i) => (
                        <div key={i} className="text-xs text-slate-400 font-medium mb-1 pb-1 border-b border-slate-700">{c.text}</div>
                      ))}
                      {tpl.components.filter(c => c.type === 'body').map((c, i) => (
                        <div key={i} className="text-sm text-white whitespace-pre-wrap mb-2" dangerouslySetInnerHTML={{ __html: renderPreview(c.text) }} />
                      ))}
                      {tpl.components.filter(c => c.type === 'footer').map((c, i) => (
                        <div key={i} className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">{c.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="p-6 pb-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editing ? 'Editar Template' : 'Nuevo Template'}
                </h3>
                <button onClick={resetForm} className="p-1.5 rounded hover:bg-slate-700 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1">
                {stepLabels.map((label, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${i + 1 < step ? 'bg-green-600 text-white' :
                      i + 1 === step ? 'bg-green-600 text-white' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                      {i + 1 < step ? '✓' : i + 1}
                    </div>
                    <div className={`hidden sm:block text-xs ml-1 ${i + 1 === step ? 'text-green-400' : 'text-slate-500'}`}>
                      {label}
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i + 1 < step ? 'bg-green-600' : 'bg-slate-700'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="p-6">
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-300">Paso 1: Información Básica</h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Template *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                      placeholder="order_confirmation"
                      className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Solo minúsculas, números y guiones bajos</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                        {TEMPLATE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Idioma</label>
                      <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Header */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-300">Paso 2: Encabezado (opcional)</h4>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} className="rounded border-slate-600 bg-slate-950 text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-slate-300">Incluir encabezado</span>
                  </label>

                  {hasHeader && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Texto del encabezado</label>
                      <input
                        type="text"
                        value={headerText}
                        onChange={e => setHeaderText(e.target.value)}
                        placeholder="Confirmación de Pedido"
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Body */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-300">Paso 3: Cuerpo del Mensaje *</h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Texto del mensaje</label>
                    <textarea
                      value={bodyText}
                      onChange={e => setBodyText(e.target.value)}
                      placeholder="Hola {'{{1}}'}, tu pedido {'{{2}}'} fue enviado por {'{{3}}'}."
                      rows={6}
                      className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Usá {'{{1}}'}, {'{{2}}'}, etc. para variables dinámicas
                    </p>
                    {countVariables(bodyText) > 0 && (
                      <p className="text-xs text-green-400 mt-1">
                        {countVariables(bodyText)} variable{countVariables(bodyText) > 1 ? 's' : ''} detectada{countVariables(bodyText) > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Live preview */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-700">
                    <div className="text-xs text-slate-500 mb-2">Vista previa:</div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      {hasHeader && headerText && (
                        <div className="text-xs text-slate-400 font-medium mb-1 pb-1 border-b border-slate-700">{headerText}</div>
                      )}
                      <div className="text-sm text-white whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderPreview(bodyText) }} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Footer + Save */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-300">Paso 4: Pie y Guardar</h4>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hasFooter} onChange={e => setHasFooter(e.target.checked)} className="rounded border-slate-600 bg-slate-950 text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-slate-300">Incluir pie de mensaje</span>
                  </label>

                  {hasFooter && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Texto del pie</label>
                      <input
                        type="text"
                        value={footerText}
                        onChange={e => setFooterText(e.target.value)}
                        placeholder="Reply STOP to opt out"
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  )}

                  {/* Final preview */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-700">
                    <div className="text-xs text-slate-500 mb-2">Vista previa final:</div>
                    <div className="bg-slate-800 rounded-lg p-3 max-w-sm mx-auto">
                      {hasHeader && headerText && (
                        <div className="text-xs text-slate-400 font-medium mb-1 pb-1 border-b border-slate-700">{headerText}</div>
                      )}
                      <div className="text-sm text-white whitespace-pre-wrap mb-1" dangerouslySetInnerHTML={{ __html: renderPreview(bodyText) }} />
                      {hasFooter && footerText && (
                        <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700">{footerText}</div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-400">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500">Nombre:</span> {name || '(vacío)'}</div>
                      <div><span className="text-slate-500">Categoría:</span> {category}</div>
                      <div><span className="text-slate-500">Idioma:</span> {language}</div>
                      <div><span className="text-slate-500">Variables:</span> {countVariables(bodyText)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer navigation */}
            <div className="p-6 pt-0 flex items-center justify-between">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <span className="text-xs text-slate-500">Paso {step} de {TOTAL_STEPS}</span>

              {step < TOTAL_STEPS ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !bodyText.trim()}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editing ? 'Guardar Cambios' : 'Crear Template'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CRM Config Panel ────────────────────────────────────────────────────────

