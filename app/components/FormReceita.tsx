interface FormReceitaProps {
  children: React.ReactNode;
}

export default function FormReceita({
  children,
}: FormReceitaProps) {
  return (
    <div className="p-4 rounded bg-white text-black">
      {children}
    </div>
  );
}