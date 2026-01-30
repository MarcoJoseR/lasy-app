export default function Loading() {
  return (
    <div className="space-y-6 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 rounded-lg bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );
}
