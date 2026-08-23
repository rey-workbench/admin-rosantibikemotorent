<script lang="ts">
interface Option {
	value: string;
	label: string;
}

interface Props {
	id: string;
	label: string;
	value: string;
	options: Option[];
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	class?: string;
	onchange?: (e: Event) => void;
}

let {
	id,
	label,
	value = $bindable(),
	options,
	placeholder = 'Pilih...',
	required = false,
	disabled = false,
	class: className = '',
	onchange
}: Props = $props();
</script>

<div class="flex flex-col gap-1.5 {className}">
    <label for={id} class="text-sm font-medium text-text-secondary">
        {label}
        {#if required}<span class="text-danger">*</span>{/if}
    </label>
    <select
        {id}
        {required}
        {disabled}
        bind:value
        {onchange}
        class="w-full px-3.5 py-2.25 bg-input hover:bg-white border border-black/10 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm font-medium text-text-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
    >
        <option value="">{placeholder}</option>
        {#each options as opt}
            <option value={opt.value}>{opt.label}</option>
        {/each}
    </select>
</div>
