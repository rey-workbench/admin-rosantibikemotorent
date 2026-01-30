<script lang="ts">
    interface Props {
        id: string;
        label?: string;
        type?:
            | "text"
            | "email"
            | "password"
            | "number"
            | "tel"
            | "date"
            | "time"
            | "datetime-local";
        value: string | number;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        min?: number | string;
        max?: number | string;
        class?: string;
        oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
        onkeydown?: (
            e: KeyboardEvent & { currentTarget: HTMLInputElement },
        ) => void;
    }

    let {
        id,
        label,
        type = "text",
        value = $bindable(),
        placeholder = "",
        required = false,
        disabled = false,
        min,
        max,
        class: className = "",
        oninput,
        onkeydown,
    }: Props = $props();
</script>

<div class="flex flex-col gap-1.5 {className}">
    {#if label}
        <label for={id} class="text-sm font-medium text-text-secondary">
            {label}
            {#if required}<span class="text-danger">*</span>{/if}
        </label>
    {/if}
    <input
        {type}
        {id}
        {placeholder}
        {required}
        {disabled}
        {min}
        {max}
        bind:value
        {oninput}
        {onkeydown}
        class="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    />
</div>
