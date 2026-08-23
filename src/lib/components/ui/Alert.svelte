<script lang="ts">
type Variant = 'success' | 'danger' | 'warning' | 'info';

interface Props {
	variant?: Variant;
	message: string;
	class?: string;
}

let { variant = 'info', message, class: className = '' }: Props = $props();

const variantClasses: Record<Variant, string> = {
	success: 'bg-emerald-50 border border-emerald-200/80 text-emerald-800',
	danger: 'bg-red-50 border border-red-200/80 text-red-800',
	warning: 'bg-amber-50 border border-amber-200/80 text-amber-800',
	info: 'bg-blue-50 border border-blue-200/80 text-blue-800'
};
</script>

<div
    class="px-4 py-3 rounded-xl border text-xs font-medium {variantClasses[
        variant
    ]} {className}"
>
    {message}
</div>
