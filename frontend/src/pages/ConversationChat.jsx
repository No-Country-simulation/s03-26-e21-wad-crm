import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Check, CheckCheck } from 'lucide-react';
import { conversationsService, contactsService } from '../services/api';

export default function ConversationChat() {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [msgsRes, convsRes, contactsRes] = await Promise.all([
        conversationsService.getMessages(id, 0, 100),
        conversationsService.getAll(0, 100),
        contactsService.getAll()
      ]);
      
      const convs = convsRes.data?.content || convsRes.data || [];
      const conv = convs.find(c => c.id === id);
      
      const contacts = contactsRes.data?.content || contactsRes.data || [];
      const contact = conv ? contacts.find(c => c.id === conv.contactId) : null;
      setConversation(contact);
      
      const msgs = msgsRes.data?.content || [];
      setMessages(msgs.reverse());
    } catch (err) {
      setError(err.message || 'Error al cargar conversación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      await conversationsService.sendMessage(id, newMessage.trim());
      setNewMessage('');
      await fetchData();
    } catch (err) {
      setError(err.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const statusIcon = (status) => {
    if (status === 'READ') return <CheckCheck className="h-4 w-4 text-blue-500" />;
    if (status === 'DELIVERED') return <CheckCheck className="h-4 w-4 text-gray-400" />;
    if (status === 'SENT') return <Check className="h-4 w-4 text-gray-400" />;
    return null;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Link to="/conversations" className="flex items-center gap-2 text-blue-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white flex items-center gap-4">
        <Link 
          to="/conversations" 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="font-semibold text-gray-900">
            {conversation?.name || 'Conversación'}
          </h1>
          <p className="text-sm text-gray-500">{conversation?.phone}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No hay mensajes todavía</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOutbound = msg.direction === 'OUTBOUND';
            return (
              <div
                key={msg.id}
                className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOutbound
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    isOutbound ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    <span>{formatTime(msg.sentAt)}</span>
                    {isOutbound && statusIcon(msg.status)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}