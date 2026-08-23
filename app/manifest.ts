export default function manifest() {
  return {
    name: "Receitas Health",
    short_name: "Receitas Health",
    description: "Receitas e organização para o dia a dia.",
    start_url: "/recepcao",
    display: "standalone",
    background_color: "#18181b",
    theme_color: "#166534",

    icons: [
      {
        src: "/icons/health-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/health-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    // ===== INÍCIO - COMPARTILHAMENTO ANDROID =====
    share_target: {
      action: "/importar-receita",
      method: "get",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
    // ===== FIM - COMPARTILHAMENTO ANDROID =====
  };
}