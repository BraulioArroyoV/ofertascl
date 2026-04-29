# OfertasCL 🛍️

**Buscador de ofertas chilenas con links de afiliado automáticos**

> Proyecto de Braulio Arroyo | Affiliate: `ARROYOBRAULIO20230821195606`

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Estado | Zustand (con persistencia localStorage) |
| Backend | Express.js (proxy para APIs) |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Estructura del proyecto

```
ofertascl/
├── server/
│   └── index.js          ← Backend Express (proxy ML API)
├── src/
│   ├── api/client.js      ← Todas las llamadas a la API
│   ├── components/
│   │   ├── ProductCard.jsx ← Card de producto con link afiliado
│   │   ├── SearchBar.jsx   ← Buscador con historial
│   │   ├── BottomNav.jsx   ← Navegación móvil
│   │   ├── Skeleton.jsx    ← Loading states
│   │   └── Toast.jsx       ← Notificaciones
│   ├── pages/
│   │   ├── Home.jsx        ← Inicio con categorías y ofertas
│   │   ├── Search.jsx      ← Resultados de búsqueda
│   │   ├── Deals.jsx       ← Ofertas del día
│   │   ├── Favorites.jsx   ← Productos guardados
│   │   └── Dashboard.jsx   ← Stats y checklist
│   ├── store.js            ← Estado global (Zustand)
│   └── App.jsx             ← Rutas principales
└── .env.example            ← Variables de entorno
```

---

## Cómo correr localmente

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 3. Correr backend (Terminal 1)
```bash
node server/index.js
# Corre en http://localhost:3001
```

### 4. Correr frontend (Terminal 2)
```bash
npm run dev
# Corre en http://localhost:5173
```

---

## Deploy en producción (gratis)

### Frontend → Vercel
```bash
npm install -g vercel
vercel --prod
```
Agrega en Vercel > Settings > Environment Variables:
- `VITE_API_URL` = `https://tu-backend.railway.app/api`

### Backend → Railway
1. Ve a railway.app, crea proyecto desde GitHub
2. Agrega variables de entorno del `.env`
3. El comando de inicio es: `node server/index.js`

---

## Obtener credenciales MercadoLibre

1. Ve a https://developers.mercadolibre.cl
2. Crea una aplicación nueva
3. Copia `App ID` y `Secret Key` al `.env`
4. Para el token de acceso, sigue la guía OAuth en la doc de ML

**Sin token:** La app funciona igual pero con límite de 60 requests/hora.
**Con token:** Sin límites prácticamente.

---

## Integrar Soicos (Falabella, Ripley, Paris)

Soicos es la red de afiliados más grande de Chile.
1. Regístrate en https://www.soicos.com
2. Busca los programas de Falabella, Ripley, Paris
3. Obtén tus links de tracking
4. En `server/index.js` hay una sección comentada `FUTURA INTEGRACION`

---

## Próximas funcionalidades

- [ ] Integración Soicos (Falabella, Ripley, Paris)
- [ ] AliExpress API oficial
- [ ] Alertas de precio por WhatsApp/Telegram
- [ ] Comparador multi-tienda
- [ ] PWA (instalable en celular)
- [ ] Panel de analytics con ganancias reales
- [ ] Compartir directo a TikTok/Instagram Stories

---

## Tu ID de afiliado

```
ARROYOBRAULIO20230821195606
```

Todos los links generados por la app incluyen automáticamente:
```
?matt_tool=afiliados&matt_word=ARROYOBRAULIO20230821195606
```
