export default function ConfigPanel({ config, onSave, onClear, crmConfig }) {
  const [form, setForm] = useState(config || {
    baseUrl: 'https://graph.facebook.com/v22.0',
    phoneNumberId: '',
    accessToken: '',
    appSecret: '',
    webhookVerifyToken: '',
    wabaId: '',
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [savingToCrm, setSavingToCrm] = useState(false)
  const [crmSaveResult, setCrmSaveResult] = useState(null)

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function testConnection() {
    if (!form.phoneNumberId || !form.accessToken) {
      setTestResult({ ok: false, msg: 'Completá phoneNumberId y accessToken' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await axios.get(`${form.baseUrl}/${form.phoneNumberId}`, {
        headers: { Authorization: `Bearer ${form.accessToken}` },
      })
      if (res.data.error) {
        setTestResult({ ok: false, msg: res.data.error.message })
      } else {
        setTestResult({ ok: true, msg: `Conectado — ${res.data.display_phone_number || form.phoneNumberId}` })
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message
      setTestResult({ ok: false, msg })
    } finally {
      setTesting(false)
    }
  }

  async function saveToCrmBackend() {
    if (!crmConfig?.token) {
      setCrmSaveResult({ ok: false, msg: 'Necesitás estar logueado en CRM para guardar' })
      return
    }
    if (!form.phoneNumberId || !form.accessToken || !form.appSecret || !form.webhookVerifyToken) {
      setCrmSaveResult({ ok: false, msg: 'Completá: phoneNumberId, accessToken, appSecret, webhookVerifyToken' })
      return
    }
    setSavingToCrm(true)
    setCrmSaveResult(null)
    try {
      const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:8080' : (crmConfig.baseUrl || '')
      const res = await axios.post(`${apiBase}/api/settings/integrations/whatsapp`, {
        phoneNumberId: form.phoneNumberId,
        accessToken: form.accessToken,
        appSecret: form.appSecret,
        webhookVerifyToken: form.webhookVerifyToken,
      }, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      setCrmSaveResult({ ok: true, msg: '✅ Guardado en el CRM Backend!' })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      setCrmSaveResult({ ok: false, msg: '❌ Error: ' + msg })
    } finally {
      setSavingToCrm(false)
    }
  }

  function handleSave() {
    saveConfig(form)
    onSave(form)
  }

  const fields = [
    { key: 'baseUrl', label: 'API Base URL', placeholder: 'https://graph.facebook.com/v22.0', type: 'text' },
    { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '1023265770876372', type: 'text' },
    { key: 'accessToken', label: 'Access Token', placeholder: 'EAAmC6O5Qmok...', type: 'password' },
    { key: 'appSecret', label: 'App Secret', placeholder: 'Para verificar firma del webhook', type: 'password' },
    { key: 'webhookVerifyToken', label: 'Webhook Verify Token', placeholder: 'Tu token personalizado', type: 'text' },
    { key: 'wabaId', label: 'WABA ID (opcional)', placeholder: '1842664289565674', type: 'text' },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-400" />
          Configuración de WhatsApp
        </h2>
        <div className="grid gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6 flex-wrap">
          <button onClick={testConnection} disabled={testing} className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors">
            {testing ? 'Probando...' : 'Probar Conexión'}
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors">
            Guardar en Local
          </button>
          <button onClick={saveToCrmBackend} disabled={savingToCrm || !crmConfig?.token} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors">
            {savingToCrm ? 'Guardando...' : 'Guardar en CRM Backend'}
          </button>
          <button onClick={() => { onClear(); setForm({ baseUrl: 'https://graph.facebook.com/v22.0', phoneNumberId: '', accessToken: '', appSecret: '', webhookVerifyToken: '', wabaId: '' }); setTestResult(null); setCrmSaveResult(null) }} className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${testResult.ok ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
            {testResult.ok ? '✅' : '❌'} {testResult.msg}
          </div>
        )}
        {crmSaveResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${crmSaveResult.ok ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
            {crmSaveResult.msg}
          </div>
        )}
        {!crmConfig?.token && (
          <div className="mt-4 p-3 rounded-lg text-sm bg-yellow-900/30 text-yellow-300 border border-yellow-700">
            ⚠️ Necesitás estar logueado en CRM para guardar en el backend
          </div>
        )}
      </div>
    </div>
  )
}
