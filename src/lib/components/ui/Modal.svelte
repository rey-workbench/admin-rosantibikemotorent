<script lang="ts">
    import type { Snippet } from "svelte";
    import { X } from "lucide-svelte";

    interface Props {
        open: boolean;
        title: string;
        children: Snippet;
        onclose: () => void;
        size?: "sm" | "md" | "lg";
    }

    let { open, title, children, onclose, size = "md" }: Props = $props();

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
    };

    function handleBackdrop(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onclose();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            onclose();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <div
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onclick={handleBackdrop}
        onkeydown={handleKeydown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
    >
        <div
            class="bg-bg-secondary border border-border rounded-lg w-full {sizeClasses[
                size
            ]} shadow-2xl"
        >
            <div
                class="flex items-center justify-between px-5 py-4 border-b border-border"
            >
                <h2 class="text-lg font-semibold m-0">{title}</h2>
                <button
                    type="button"
                    class="p-1 rounded hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary"
                    onclick={onclose}
                >
                    <X size={20} />
                </button>
            </div>
            <div class="p-5">
                {@render children()}
            </div>
        </div>
    </div>
{/if}
