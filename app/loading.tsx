export default function Loading() {
  return (
    <div className="space-y-6 p-6 bg-black min-h-screen">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 rounded-xl bg-zinc-800 animate-pulse"
        />
      ))}
    </div>
  );
}