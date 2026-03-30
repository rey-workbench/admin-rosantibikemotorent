<script lang="ts">
    import type { Snippet } from "svelte";

    interface Tab {
        id: string;
        label: string;
    }

    interface Props {
        tabs: Tab[];
        activeTab: string;
        onchange?: (tabId: string) => void;
        children?: Snippet;
    }

    let { tabs, activeTab, onchange, children }: Props = $props();
</script>

<div class="flex gap-2">
    <div class="flex p-1 bg-bg-surface border border-border-color rounded-lg">
        {#each tabs as tab}
            <button
                class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors {activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}"
                onclick={() => onchange?.(tab.id)}
            >
                {tab.label}
            </button>
        {/each}
    </div>
</div>

{#if children}
    {@render children()}
{/if}