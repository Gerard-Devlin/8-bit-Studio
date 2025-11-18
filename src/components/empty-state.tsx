export function EmptyState({
    message,
    spinning = false,
}: {
    message: string;
    spinning?: boolean;
}) {
    return (
        <div className="flex flex-col items-center text-sm text-white/60">
            {spinning && (
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {message}
        </div>
    );
}
