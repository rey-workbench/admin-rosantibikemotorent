<script lang="ts">
import { Loader2 } from '@lucide/svelte';
import type { Snippet } from 'svelte';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface Props {
	children?: Snippet;
	variant?: Variant;
	size?: Size;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
	loading?: boolean;
	class?: string;
	href?: string;
	onclick?: (e: MouseEvent) => void;
}

let {
	children,
	variant = 'primary',
	size = 'md',
	type = 'button',
	disabled = false,
	loading = false,
	class: className = '',
	href,
	onclick
}: Props = $props();

const baseClasses =
	'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-180 cursor-pointer no-underline disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

const variantClasses: Record<Variant, string> = {
	primary:
		'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20 hover:shadow-md',
	secondary: 'bg-white border border-black/10 text-text-primary hover:bg-bg-primary shadow-xs',
	success: 'bg-success text-white hover:bg-success/90 shadow-sm shadow-success/20',
	danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm shadow-danger/20',
	warning: 'bg-warning text-white hover:bg-warning/90 shadow-sm shadow-warning/20',
	ghost: 'bg-transparent text-text-secondary hover:bg-black/5 hover:text-text-primary'
};

const sizeClasses: Record<Size, string> = {
	sm: 'px-3 py-1.5 text-xs rounded-lg',
	md: 'px-4 py-2.25 text-sm rounded-xl',
	lg: 'px-5 py-2.75 text-base rounded-xl',
	icon: 'p-2 rounded-full'
};

const classes = $derived(
	`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
);
</script>

{#if href}
    <a {href} class={classes}>
        {#if loading}
            <Loader2 size={size === "sm" ? 14 : 18} class="animate-spin" />
        {/if}
        {#if children}
            {@render children()}
        {/if}
    </a>
{:else}
    <button {type} class={classes} disabled={disabled || loading} {onclick}>
        {#if loading}
            <Loader2 size={size === "sm" ? 14 : 18} class="animate-spin" />
        {/if}
        {#if children}
            {@render children()}
        {/if}
    </button>
{/if}
