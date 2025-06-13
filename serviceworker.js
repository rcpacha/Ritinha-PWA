// Define um nome e uma versão para o nosso cache de arquivos
const CACHE_NAME = 'ritinha-cache-v1';

// Lista de arquivos essenciais para o funcionamento offline do app
// IMPORTANTE: O nome do arquivo .html deve ser exatamente o mesmo do seu arquivo principal.
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icone.png'
];

// Evento 'install': é disparado quando o Service Worker é instalado pela primeira vez.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pré-cacheando arquivos da aplicação para uso offline.');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Evento 'fetch': é disparado para cada requisição que a página faz (ex: imagens, scripts, etc.)
self.addEventListener('fetch', (event) => {
  // Nós só nos preocupamos com requisições GET para o cache
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Tenta pegar a resposta do cache primeiro.
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        // Se encontrou no cache, retorna a resposta do cache.
        // console.log(`[ServiceWorker] Servindo do cache: ${event.request.url}`);
        return cachedResponse;
      }

      // 2. Se não estiver no cache, tenta buscar na rede.
      try {
        const networkResponse = await fetch(event.request);
        // Se a busca na rede funcionou, guardamos uma cópia no cache para a próxima vez.
        // console.log(`[ServiceWorker] Buscando na rede e cacheando: ${event.request.url}`);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        // Se a busca na rede falhar (sem internet), a aplicação não quebra.
        console.error('[ServiceWorker] Falha na busca de um recurso não cacheado:', error);
      }
    })
  );
});
