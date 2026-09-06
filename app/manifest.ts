export default function manifest() {
  return {
    name: "Health",
    short_name: "Health",
    description: "Receitas organizadas",
    start_url: "/recepcao",
    display: "standalone",
    background_color: "#18181b",
    theme_color: "#166534",

    icons: [
  {
    src: "/icons/health-192-v2.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any maskable",
  },
  {
    src: "/icons/health-512-v2.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any maskable",
  },
],

    // ===== INÍCIO - COMPARTILHAMENTO ANDROID =====
    share_target: {
      action: "/importar-receita",
      method: "GET",
      enctype: "application/x-www-form-urlencoded",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
    // ===== FIM - COMPARTILHAMENTO ANDROID =====
  };
}