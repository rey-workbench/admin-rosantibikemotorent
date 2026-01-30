<script lang="ts">
    import type { Snippet } from "svelte";

    interface Column {
        key: string;
        label: string;
        class?: string;
    }

    interface Props {
        columns: Column[];
        data: Record<string, any>[];
        renderCell?: Snippet<
            [{ row: Record<string, any>; column: Column; value: any }]
        >;
        emptyMessage?: string;
    }

    let {
        columns,
        data,
        renderCell,
        emptyMessage = "Tidak ada data",
    }: Props = $props();
</script>

<div class="overflow-x-auto">
    <table class="w-full border-collapse">
        <thead>
            <tr class="bg-bg-tertiary/30">
                {#each columns as column}
                    <th
                        class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border {column.class ||
                            ''}"
                    >
                        {column.label}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#if data.length === 0}
                <tr>
                    <td
                        colspan={columns.length}
                        class="px-4 py-8 text-center text-text-muted"
                    >
                        {emptyMessage}
                    </td>
                </tr>
            {:else}
                {#each data as row}
                    <tr
                        class="border-b border-border hover:bg-bg-tertiary/20 transition-colors"
                    >
                        {#each columns as column}
                            <td class="px-4 py-3 text-sm {column.class || ''}">
                                {#if renderCell}
                                    {@render renderCell({
                                        row,
                                        column,
                                        value: row[column.key],
                                    })}
                                {:else}
                                    {row[column.key] ?? "-"}
                                {/if}
                            </td>
                        {/each}
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
