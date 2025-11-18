export function EmptyPlaceholder({
    message,
    spinning = false,
}: {
    message: string;
    spinning?: boolean;
}) {
    return (
        <div className="flex h-[360px] items-center justify-center rounded-2xl border border-transparent bg-#020618 text-sm text-white/60">
            <div className="flex items-center gap-3">
                {spinning && (
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                <span>{message}</span>
            </div>
        </div>
    );
}
