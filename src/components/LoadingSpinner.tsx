export function LoadingSpinner({
  size = "md",
  text = "Loading..."
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
}) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-red-500 ${sizeClasses[size]} mb-4`}></div>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading page..." />
    </div>
  );
}

export function ComponentLoader({ text = "Loading component..." }: { text?: string }) {
  return (
    <div className="w-full py-12">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}
