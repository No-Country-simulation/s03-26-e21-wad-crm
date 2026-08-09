import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { conversationsService, contactsService } from '../services/api';

// Cache para contactos: contactId -> {name, phone}
const contactCache = new Map();

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchContacts = useCallback(async () => {
    const response = await contactsService.getAll();
    const contacts = response.data?.content || response.data || [];
    contacts.forEach(c => contactCache.set(c.id, c));
  }, []);

  const fetchConversations = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await conversationsService.getAll(pageNum, 20);
      const data = response.data;
      setConversations(prev => pageNum === 0 ? data.content : [...prev, ...data.content]);
      setHasMore(!data.last);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cargar contactos al cache primero
    fetchContacts().then(() => fetchConversations(0));
  }, [fetchContacts, fetchConversations]);

  const getContactInfo = (contactId) => {
    const contact = contactCache.get(contactId);
    if (contact) {
      return { name: contact.name, phone: contact.phone };
    }
    return { name: 'Unknown', phone: '' };
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return d.toLocaleDateString('es-AR', { weekday: 'short' });
    }
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const channelLabel = (channel) => {
    return channel === 'WHATSAPP' ? 'WhatsApp' : channel === 'EMAIL' ? 'Email' : channel;
  };

  const channelColor = (channel) => {
    return channel === 'WHATSAPP' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchConversations(page + 1);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Conversaciones</h1>
        <p className="text-gray-500 mt-1">Gestiona tus conversaciones de WhatsApp y Email</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {conversations.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No hay conversaciones todavía</p>
            <p className="text-sm mt-2">Los mensajes recibidos aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const contact = getContactInfo(conv.contactId);
              return (
                <Link
                  key={conv.id}
                  to={`/conversations/${conv.id}`}
                  className="block bg-white rounded-lg border p-4 hover:border-blue-300 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {contact.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{contact.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${channelColor(conv.channel)}`}>
                            {channelLabel(conv.channel)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">
                        {formatDate(conv.lastMessageAt)}
                      </span>
                      <ArrowRight className="h-5 w-5 text-gray-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        {!loading && hasMore && (
          <div className="text-center py-4">
            <button
              onClick={loadMore}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Ver más conversaciones
            </button>
          </div>
        )}
      </div>
    </div>
  );
}