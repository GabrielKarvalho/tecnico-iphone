// Service worker do app Formação Técnico iPhone.
// - Guarda o app, as imagens e os PDFs já abertos para abrir rápido e funcionar com internet fraca.
// - Página principal: busca a versão mais nova na rede e usa a guardada se estiver sem internet.
// - Vídeos do YouTube não são guardados (precisam de internet).
const VERSAO = "6a38afe56d";
const CACHE = `tecnico-iphone-${VERSAO}`;
const ESSENCIAIS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
  "./img/hero-iphone.jpg",
  "./img/modulos/conhecendo-o-iphone.jpg",
  "./img/modulos/ferramentas-e-tecnicas.jpg",
  "./img/modulos/desmontagem-e-montagem.jpg",
  "./img/modulos/diagnostico.jpg",
  "./img/modulos/troca-de-tela.jpg",
  "./img/modulos/troca-de-bateria.jpg",
  "./img/modulos/outros-reparos.jpg",
  "./img/modulos/negocio.jpg"
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
