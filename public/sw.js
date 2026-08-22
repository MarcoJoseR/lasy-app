const VERSION = "v23";

const CACHE_PAGINAS = `health-receitas-paginas-${VERSION}`;
const CACHE_RECURSOS = `health-receitas-recursos-${VERSION}`;
const CACHE_NEXT = `health-receitas-next-${VERSION}`;

const APP_SHELL = [
  "/",
  "/recepcao",
  "/favoritos",
  "/minha-receita",
  "/listas-compras/offline",
  "/receita/offline",
  "/manifest.webmanifest",
  "/sounds/alarme-timer.wav",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_PAGINAS).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("health-receitas-") &&
              ![
                CACHE_PAGINAS,
                CACHE_RECURSOS,
                CACHE_NEXT,
              ].includes(key)
          )
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "CACHE_RECEITAS") {
    const urls = event.data.urls;

    if (!Array.isArray(urls) || urls.length === 0) {
      return;
    }

    event.waitUntil(
      caches.open(CACHE_PAGINAS).then(async (cache) => {
        for (const url of urls) {
          try {
            const response = await fetch(url);

            if (response && response.status === 200) {
              await cache.put(url, response.clone());
            }
          } catch {
            // Se alguma receita falhar, continua com as demais.
          }
        }
      })
    );
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Não interfere em recursos de outros domínios.
  if (url.origin !== self.location.origin) return;

  // ==========================================
  // 1. NAVEGAÇÃO NORMAL ENTRE PÁGINAS
  // ==========================================
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copia = response.clone();

            caches.open(CACHE_PAGINAS).then((cache) => {
              cache.put(request, copia);
            });
          }

          return response;
        })
        .catch(async () => {
          if (url.pathname === "/listas-compras/offline") {
            const listaOffline = await caches.match(
              "/listas-compras/offline"
            );

            if (listaOffline) {
              return listaOffline;
            }
          }

          if (url.pathname === "/receita/offline") {
            const receitaOffline = await caches.match(
              "/receita/offline"
            );

            if (receitaOffline) {
              return receitaOffline;
            }
          }

          if (url.pathname === "/minha-receita") {
              const minhaReceitaOffline = await caches.match(
                "/minha-receita"
              );

              if (minhaReceitaOffline) {
                return minhaReceitaOffline;
              }
            }

          const paginaCache = await caches.match(request);

          if (paginaCache) {
            return paginaCache;
          }

          const recepcao = await caches.match("/recepcao");

          if (recepcao) {
            return recepcao;
          }

          return caches.match("/");
        })
    );

    return;
  }

  // ==========================================
// 2. NAVEGAÇÃO INTERNA DO NEXT.JS / APP ROUTER
// ==========================================
const requisicaoNext =
  url.searchParams.has("_rsc") ||
  request.headers.get("RSC") === "1";

if (requisicaoNext) {
  event.respondWith(fetch(request));
  return;
}

if (url.pathname.startsWith("/_next/")) {
  event.respondWith(fetch(request));
  return;
}

  // ==========================================
  // 3. IMAGENS, JS, CSS E DEMAIS RECURSOS
  // ==========================================
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200
        ) {
          return networkResponse;
        }

        const copia = networkResponse.clone();

        caches.open(CACHE_RECURSOS).then((cache) => {
          cache.put(request, copia);
        });

        return networkResponse;
      });
    })
  );
});