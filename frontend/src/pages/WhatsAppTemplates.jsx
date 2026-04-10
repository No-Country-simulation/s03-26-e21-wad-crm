import { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { whatsappService } from '../services/api';

const STATUS_CONFIG = {
  APPROVED: { label: 'Aprobado',   color: '#16a34a' },
  PENDING:  { label: 'Pendiente',  color: '#d97706' },
  REJECTED: { label: 'Rechazado', color: '#dc2626' },
  PAUSED:   { label: 'Pausado',    color: '#6b7280' },
};

const STATUS_ICON = {
  APPROVED: CheckCircle,
  PENDING:  Clock,
  REJECTED: AlertCircle,
  PAUSED:   AlertCircle,
};

export default function WhatsAppTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await whatsappService.getTemplates();
      setTemplates(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los templates de WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: '#25D366' }}>
            <MessageCircle className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              WhatsApp Templates
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Templates aprobados por Meta — solo lectura
            </p>
          </div>
        </div>
        <button
          onClick={loadTemplates}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-lg p-4 mb-6 flex items-start gap-3" style={{ background: '#7c3aed22', border: '1px solid #7c3aed' }}>
        <AlertCircle size={18} style={{ color: '#a855f7', flexShrink: 0, marginTop: 2 }} />
        <p className="text-sm" style={{ color: '#e2d9f3' }}>
          Los templates de WhatsApp son creados y aprobados directamente en{' '}
          <a href="https://business.facebook.com/wa/manage/message-templates/" target="_blank" rel="noreferrer"
            className="underline font-medium" style={{ color: '#a855f7' }}>
            Meta Business Manager
          </a>
          . Aquí solo puedes consultarlos para usarlos al enviar mensajes.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          <p className="mt-2" style={{ color: 'var(--color-muted)' }}>Cargando templates...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <AlertCircle className="mx-auto mb-3" size={40} style={{ color: '#dc2626' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>No se pudieron cargar los templates</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>{error}</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Asegúrate de haber configurado WhatsApp en Settings con credenciales válidas.
          </p>
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <MessageCircle className="mx-auto mb-4" size={48} style={{ color: '#25D366' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>Sin templates</h3>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Crea templates en Meta Business Manager y aparecerán aquí una vez aprobados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const statusCfg = STATUS_CONFIG[tpl.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = STATUS_ICON[tpl.status] || Clock;
            return (
              <div key={tpl.id || tpl.name} className="rounded-xl p-5"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                    {tpl.name}
                  </h3>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: statusCfg.color + '22', color: statusCfg.color }}>
                    <StatusIcon size={12} />
                    {statusCfg.label}
                  </span>
                </div>

                {tpl.category && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-3"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                    {tpl.category}
                  </span>
                )}

                {tpl.components?.map((comp, i) => (
                  comp.type === 'BODY' && (
                    <p key={i} className="text-sm line-clamp-3" style={{ color: 'var(--color-muted)' }}>
                      {comp.text}
                    </p>
                  )
                ))}

                <div className="mt-3 pt-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid var(--color-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {tpl.language || 'es'}
                  </span>
                  {tpl.status === 'APPROVED' && (
                    <span className="text-xs font-medium" style={{ color: '#a855f7' }}>
                      Listo para usar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
