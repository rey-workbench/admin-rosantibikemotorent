<script lang="ts">
    interface Props {
        id: string;
        label: string;
        value: string;
        rows?: number;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        class?: string;
    }

    let {
        id,
        label,
        value = $bindable(),
        rows = 4,
        placeholder = "",
        required = false,
        disabled = false,
        class: className = "",
    }: Props = $props();
</script>

<div class="flex flex-col gap-1.5 {className}">
    <label for={id} class="text-sm font-medium text-text-secondary">
        {label}
        {#if required}<span class="text-danger">*</span>{/if}
    </label>
    <textarea
        {id}
        {rows}
        {placeholder}
        {required}
        {disabled}
        bind:value
        class="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-y"
    ></textarea>
</div>
