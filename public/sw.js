const VERSION = "v31";

const CACHE_PAGINAS = `health-receitas-paginas-${VERSION}`;
const CACHE_RECURSOS = `health-receitas-recursos-${VERSION}`;
const CACHE_NEXT = `health-receitas-next-${VERSION}`;

const APP_SHELL = [
  "/",
  "/inicio",
  "/recepcao",
  "/favoritos",
  "/minha-receita",
  "/bookdigital",
  "/bookdigital/tema/offline",
  "/bookdigital/item/offline",
  "/listas-compras/offline",
  "/receita/offline",
  "/sounds/alarme-timer.wav",
];

// ==========================================
// INSTALAÇÃO E PREPARAÇÃO DO CACHE OFFLINE
// ==========================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // 1. Armazena as páginas principais.
      const cachePaginas = await caches.open(
        CACHE_PAGINAS
      );

      await cachePaginas.addAll(APP_SHELL);

      
      // 2. Recupera o HTML das páginas offline
      // dos Temas e Itens do BaúDigital.
      const paginasOffline = [
        "/bookdigital/tema/offline",
        "/bookdigital/item/offline",
      ];

      const arquivosEncontrados = new Set();

      for (const rota of paginasOffline) {
        const paginaOffline = await cachePaginas.match(rota);

        if (!paginaOffline || !paginaOffline.ok) {
          throw new Error(
            `Página offline indisponível: ${rota}`
          );
        }

        const html = await paginaOffline.text();

        // 3. Identifica os arquivos JavaScript
        // e CSS utilizados pela página.
        const arquivosPagina = Array.from(
          html.matchAll(
            /\/_next\/static\/[^"'<>\s]+?\.(?:js|css)/g
          ),
          (resultado) => resultado[0]
        );

        if (arquivosPagina.length === 0) {
          throw new Error(
            `Recursos estáticos não encontrados: ${rota}`
          );
        }

        arquivosPagina.forEach((arquivo) => {
          arquivosEncontrados.add(arquivo);
        });
      }

      // 4. Armazena os recursos das duas páginas
      // no cache da versão atual.
      const arquivos = Array.from(arquivosEncontrados);

      const cacheNext = await caches.open(CACHE_NEXT);

      await cacheNext.addAll(arquivos);

      // 5. Somente permite a ativação
      // após preparar os recursos essenciais.
      await self.skipWaiting();
    })()
  );
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
// IDENTIFICAÇÃO DAS ROTAS DO BAÚDIGITAL
// ==========================================
  const rotaTemaBookDigital =
    /^\/bookdigital\/tema\/[^/]+\/?$/.test(url.pathname) &&
    url.pathname !== "/bookdigital/tema/offline";


  const rotaItemBookDigital =
    /^\/bookdigital\/item\/[^/]+\/?$/.test(url.pathname) &&
    url.pathname !== "/bookdigital/item/offline";


  // ==========================================
  // 1. NAVEGAÇÃO NORMAL ENTRE PÁGINAS
  // ==========================================
 
  if (request.mode === "navigate") {

  // ==========================================
  // ENTRADA DO APP:
  // abre imediatamente pelo cache.
  // Se houver internet, atualiza em segundo plano.
  // ==========================================
 
  if (
  url.pathname === "/recepcao" ||
  url.pathname === "/" ||
  url.pathname === "/inicio" ||
  url.pathname === "/bookdigital" ||
  url.pathname === "/bookdigital/tema/offline" ||
  url.pathname === "/bookdigital/item/offline"
) {
    event.respondWith(
      (async () => {
        const paginaCache = await caches.match(url.pathname);

        if (paginaCache) {
          event.waitUntil(
            fetch(
              url.pathname === "/bookdigital/tema/offline"
                ? "/bookdigital/tema/offline"
                : request
            )
              .then(async (response) => {
                if (response && response.status === 200) {
                  const cache = await caches.open(CACHE_PAGINAS);
                  await cache.put(
                    url.pathname,
                    response.clone()
                  );
                }
              })
              .catch(() => {
                // Rede fraca ou indisponível:
                // o aplicativo já abriu pelo cache.
              })
          );

          return paginaCache;
        }

        try {
          const requisicaoPagina =
            url.pathname === "/bookdigital/tema/offline"
              ? "/bookdigital/tema/offline"
              : request;

          const response = await fetch(requisicaoPagina);

          if (response && response.status === 200) {
            const cache = await caches.open(CACHE_PAGINAS);

            await cache.put(
              url.pathname,
              response.clone()
            );
          }

          return response;
        } catch {
          return caches.match("/recepcao");
        }
      })()
    );

    return;
  }

  // ==========================================
  // DEMAIS NAVEGAÇÕES:
  // mantém o comportamento atual.
  // ==========================================
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

        // ==========================================
        // FALLBACK OFFLINE DOS TEMAS DO BAÚDIGITAL
        // ==========================================

        if (rotaTemaBookDigital) {
          const paginaTemaCache = await caches.match(request);

          if (paginaTemaCache) {
            return paginaTemaCache;
          }

          const paginaTemaPelaRota = await caches.match(
            url.pathname
          );

          if (paginaTemaPelaRota) {
            return paginaTemaPelaRota;
          }
        }

        // ==========================================
        // FALLBACK OFFLINE DOS ITENS DO BAÚDIGITAL
        // ==========================================
        if (rotaItemBookDigital) {
          const paginaItemCache = await caches.match(request);

          if (paginaItemCache) {
            return paginaItemCache;
          }

          const paginaItemPelaRota = await caches.match(
            url.pathname
          );

          if (paginaItemPelaRota) {
            return paginaItemPelaRota;
          }

          const paginaItemOffline = await caches.match(
            "/bookdigital/item/offline"
          );

          if (paginaItemOffline) {
            return paginaItemOffline;
          }
        }

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

        // Procura a página pela rota, sem parâmetros adicionais.
        const paginaPelaRota = await caches.match(url.pathname);

        if (paginaPelaRota) {
          return paginaPelaRota;
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

      if (url.pathname.startsWith("/_next/static/")) {
        event.respondWith(
          caches.open(CACHE_NEXT).then(async (cache) => {
            const cached = await cache.match(request);

            if (cached) {
              return cached;
            }

      const response = await fetch(request);

      if (response && response.ok) {
        await cache.put(request, response.clone());
      }

      return response;
    })
  );
  return;
}

if (url.pathname.startsWith("/_next/")) {
  event.respondWith(fetch(request));
  return;
}

// Manifest deve sempre vir da rede.
// Evita que o Chrome/WebAPK use uma versão antiga em cache.

if (url.pathname === "/manifest.webmanifest") {
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