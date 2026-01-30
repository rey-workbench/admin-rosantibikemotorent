<script lang="ts">
    import { Modal, Button } from "./";
    import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";

    interface Props {
        open: boolean;
        title: string;
        message: string;
        type?: "info" | "warning" | "danger" | "success";
        confirmText?: string;
        cancelText?: string;
        loading?: boolean;
        onconfirm: () => void;
        oncancel: () => void;
    }

    let {
        open,
        title,
        message,
        type = "info",
        confirmText = "Konfirmasi",
        cancelText = "Batal",
        loading = false,
        onconfirm,
        oncancel,
    }: Props = $props();

    const icons = {
        info: { component: Info, color: "text-blue-500", bg: "bg-blue-50" },
        warning: {
            component: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-50",
        },
        danger: { component: XCircle, color: "text-red-500", bg: "bg-red-50" },
        success: {
            component: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
        },
    };

    const confirmVariants = {
        info: "primary",
        warning: "warning",
        danger: "danger",
        success: "success",
    } as const;

    const currentIcon = $derived(icons[type]);
</script>

{#if open}
    <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        onclick={oncancel}
        onkeydown={(e) => e.key === "Escape" && oncancel()}
        role="button"
        tabindex="0"
    >
        <div
            class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            transition:scale={{ duration: 200, start: 0.95 }}
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
        >
            <div class="p-8 flex flex-col items-center text-center">
                <!-- Icon -->
                <div
                    class="w-16 h-16 {currentIcon.bg} rounded-full flex items-center justify-center mb-6"
                >
                    <currentIcon.component
                        size={32}
                        class={currentIcon.color}
                    />
                </div>

                <!-- Content -->
                <h3 class="text-xl font-bold text-text-primary mb-2">
                    {title}
                </h3>
                <p class="text-text-muted leading-relaxed">
                    {message}
                </p>

                <!-- Actions -->
                <div class="flex flex-col w-full gap-3 mt-8">
                    <Button
                        variant={confirmVariants[type]}
                        size="lg"
                        {loading}
                        onclick={onconfirm}
                        class="w-full"
                    >
                        {confirmText}
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        disabled={loading}
                        onclick={oncancel}
                        class="w-full"
                    >
                        {cancelText}
                    </Button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Custom styles if needed, but mostly using tailwind-like classes defined in app.css or inline utility classes */
</style>
