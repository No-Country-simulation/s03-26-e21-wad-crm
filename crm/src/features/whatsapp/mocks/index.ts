import { Message } from '../types'

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Hola, ¿cómo estás?',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'read',
  },
  {
    id: '2',
    content: '¡Hola! Todo bien, gracias. ¿En qué puedo ayudarte?',
    direction: 'outbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9),
    status: 'read',
  },
  {
    id: '3',
    content: 'Quería consultarte sobre el presupuesto que me enviaste',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'read',
  },
  {
    id: '4',
    content: 'Claro, te envío la información actualizada en un momento',
    direction: 'outbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    status: 'read',
  },
  {
    id: '5',
    content: 'Perfecto, quedo atento al presupuesto',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'delivered',
  },
]
