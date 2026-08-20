<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        columns: { key: string; label: string; class?: string }[];
        children: Snippet;
    }

    let { columns, children }: Props = $props();
</script>

<div class="overflow-x-auto w-full">
    <table class="w-full text-left border-collapse">
        <thead>
            <tr class="border-b border-border/50 bg-bg-tertiary/40">
                {#each columns as col}
                    <th class="px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider {col.class || ''}">
                        {col.label}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody class="divide-y divide-border/30">
            {@render children()}
        </tbody>
    </table>
</div>
