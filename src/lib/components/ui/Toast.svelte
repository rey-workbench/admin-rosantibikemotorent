<script lang="ts">
    import { toast } from "$lib/stores/toast";
    import {
        X,
        CheckCircle,
        AlertCircle,
        Info,
        AlertTriangle,
    } from "lucide-svelte";
    import { fly } from "svelte/transition";
    import { flip } from "svelte/animate";

    function getIcon(type: string) {
        switch (type) {
            case "success":
                return CheckCircle;
            case "error":
                return AlertCircle;
            case "warning":
                return AlertTriangle;
            default:
                return Info;
        }
    }

    function getIconColorClass(type: string) {
        switch (type) {
            case "success":
                return "text-success";
            case "error":
                return "text-danger";
            case "warning":
                return "text-warning";
            default:
                return "text-info";
        }
    }

    function getBgColorClass(type: string) {
        switch (type) {
            case "success":
                return "bg-success/10";
            case "error":
                return "bg-danger/10";
            case "warning":
                return "bg-warning/10";
            default:
                return "bg-info/10";
        }
    }
</script>

<div
    class="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)]"
>
    {#each $toast as t (t.id)}
        <div
            animate:flip
            in:fly={{ x: 50, duration: 300 }}
            out:fly={{ x: 50, duration: 300 }}
            class="pointer-events-auto w-full md:min-w-[320px] max-w-sm rounded-lg shadow-lg flex items-start p-4 gap-3 bg-bg-secondary border border-border backdrop-blur-sm shadow-black/5"
            role="alert"
        >
            <div
                class={`p-1.5 rounded-full shrink-0 ${getBgColorClass(t.type)} ${getIconColorClass(t.type)}`}
            >
                <svelte:component this={getIcon(t.type)} size={18} />
            </div>
            <p
                class="text-sm font-medium text-text-primary flex-1 pt-1 break-words leading-tight"
            >
                {t.message}
            </p>
            <button
                class="text-text-muted hover:text-text-primary transition-colors pt-1 shrink-0"
                onclick={() => toast.remove(t.id)}
                aria-label="Close"
            >
                <X size={16} />
            </button>
        </div>
    {/each}
</div>
