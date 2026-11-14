// Service worker do app Formação Técnico iPhone.
// - Guarda o app, as imagens e os PDFs já abertos para abrir rápido e funcionar com internet fraca.
// - Página principal: busca a versão mais nova na rede e usa a guardada se estiver sem internet.
// - Vídeos do YouTube não são guardados (precisam de internet).
const VERSAO = "4889b4e1a7";
const CACHE = `tecnico-iphone-${VERSAO}`;
const ESSENCIAIS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icone-192.png",
  "./icone-512.png",
  "./hero-iphone.jpg",
  "./conhecendo-o-iphone.jpg",
  "./ferramentas-e-tecnicas.jpg",
  "./desmontagem-e-montagem.jpg",
  "./diagnostico.jpg",
  "./troca-de-tela.jpg",
  "./troca-de-bateria.jpg",
  "./outros-reparos.jpg",
  "./negocio.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith("tecnico-iphone-") && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Navegação (abrir o app): rede primeiro, para sempre pegar a versão nova.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((resp) => { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copia)); return resp; })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  // Imagens, ícones e PDFs: usa o guardado; se não tiver, baixa e guarda.
  e.respondWith(
    caches.match(req).then((guardado) => guardado || fetch(req).then((resp) => {
      if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return resp;
    })),
  );
});
