<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        columns: { key: string; label: string; class?: string }[];
        children: Snippet;
    }

    let { columns, children }: Props = $props();
</script>

<div class="overflow-x-auto">
    <table class="w-full">
        <thead>
            <tr class="bg-bg-tertiary/30">
                {#each columns as col}
                    <th class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border {col.class || ''}">
                        {col.label}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {@render children()}
        </tbody>
    </table>
</div>
