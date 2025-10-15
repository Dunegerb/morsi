const CACHE_NAME = 'morsi-cache-v2'; // Mude a versão do cache para forçar a atualização
const urlsToCache = [
  '/',
  // Páginas HTML
  '/index.html',
  '/login.html',
  '/onboarding.html',
  '/me.html',
  '/loading.html',

  // Arquivos de Configuração
  '/manifest.json',
  '/supabase-client.js', // Se você criou este arquivo

  // Ícones e Imagens Principais
  '/logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  
  // Fontes (Opcional, mas melhora o desempenho offline)
  'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap'
];

// Evento de Instalação: Salva os arquivos essenciais em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching essential assets');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Evento de Ativação: Limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento de Fetch: Serve do cache primeiro, depois da rede (estratégia "Cache First")
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET (ex: requisições para a API do Supabase)
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrarmos no cache, retornamos a resposta do cache
        if (response) {
          return response;
        }
        // Se não, buscamos na rede
        return fetch(event.request);
      }
    )
  );
});
