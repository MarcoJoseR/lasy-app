import Header from "../components/Header";

export default function Sobre() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto p-6 text-gray-800">
        <h1 className="text-2xl font-bold mb-4">Sobre o Projeto</h1>
        <p className="leading-relaxed">
          O App de Receitas é parte do <strong>Projeto Lasy</strong>, desenvolvido para oferecer uma
          experiência moderna, organizada e futuramente integrada com inteligência artificial
          para geração automática de conteúdo, recomendações e personalização.
        </p>
      </main>
    </div>
  );
}
