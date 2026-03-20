 **Webhooks** en Render te permiten recibir notificaciones cuando ocurren eventos específicos en tus servicios.[(1)](https://render.com/docs/webhooks)

Para configurar webhooks (requiere plan Professional o superior):[(1)](https://render.com/docs/webhooks)

**1. Configura un endpoint HTTPS** que reciba las notificaciones POST de Render.[(1)](https://render.com/docs/webhooks)

**2. Crea el webhook** desde el [Render Dashboard](https://dashboard.render.com) en **Integrations > Webhooks**.[(1)](https://render.com/docs/webhooks)

**3. Selecciona los eventos** que activarán notificaciones, como:[(1)](https://render.com/docs/webhooks)
- `deploy_started` / `deploy_ended`[(1)](https://render.com/docs/webhooks)
- `build_started` / `build_ended`[(1)](https://render.com/docs/webhooks)
- `server_failed`[(1)](https://render.com/docs/webhooks)
- `autoscaling_started` / `autoscaling_ended`[(1)](https://render.com/docs/webhooks)

El payload incluye:[(1)](https://render.com/docs/webhooks)

```json
{
  "type": "deploy_ended",
  "timestamp": "2025-02-25T16:22:19.979294509Z",
  "data": {
    "id": "evt-cuuuses015js70180jk0",
    "serviceId": "srv-cukouhrtq21c73e9scng",
    "serviceName": "my-service",
    "status": "succeeded"
  }
}
```
[(1)](https://render.com/docs/webhooks)

**WebSockets** están soportados en web services de Render.[(2)](https://render.com/docs/web-services)

Tu servicio debe vincularse al puerto especificado en la variable de entorno `PORT` en el host `0.0.0.0`.[(2)](https://render.com/docs/web-services)
 **WebSockets** están completamente soportados en Render web services.[(1)](https://render.com/docs/websocket)

Tu servicio debe vincularse al puerto `0.0.0.0` (usa la variable `PORT`).[(2)](https://render.com/docs/web-services)

**Ejemplo con Express (Node.js):**[(1)](https://render.com/docs/websocket)

```javascript
const express = require('express')
const { createServer } = require('http')
const WebSocket = require('ws')

const app = express()
const server = createServer(app)
const port = process.env.PORT || 10000

// Sirve WebSocket en /ws
const wss = new WebSocket.Server({ server, path: '/ws' })

// Rutas HTTP
app.get('/', (req, res) => {
  res.send('Hello over HTTP!')
})

// Conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('WebSocket client connected')
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString())
    ws.send(`Hello over WebSocket!`)
  })
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
```
[(1)](https://render.com/docs/websocket)

**Conectar desde clientes:**[(1)](https://render.com/docs/websocket)

Usa el protocolo `wss` para conexiones públicas:

```javascript
const WebSocket = require('ws')
const ws = new WebSocket('wss://example-app.onrender.com/ws')

ws.onopen = () => {
  ws.send('Hello from the client!')
}

ws.onmessage = (event) => {
  console.log('Received:', event.data)
}
```
[(1)](https://render.com/docs/websocket)