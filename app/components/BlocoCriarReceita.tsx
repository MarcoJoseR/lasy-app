type BlocoCriarReceitaProps = {
  children?: React.ReactNode;
  editando?: boolean;
};

export default function BlocoCriarReceita({
  children, 
  editando,
}: BlocoCriarReceitaProps) {
  
  return (
  <section className="mb-2">
    <div className="mb-2 rounded-lg bg-green-600 p-4 text-white">
      <h2 className="mb-2 text-xl font-bold">
        {editando ? "✏️ Editar Receita" : "🍳 Criar Receita"}
      </h2>

      <p>
        {editando
          ? "Faça as alterações necessárias na sua receita."
          : "Preencha sua receita do seu jeito."}
      </p>

      <p className="mt-1 text-sm">
        {editando
          ? "Revise os dados e salve quando terminar."
          : "Você pode salvar agora e continuar depois."}
      </p>
    </div>

    {children}
  </section>
);
}