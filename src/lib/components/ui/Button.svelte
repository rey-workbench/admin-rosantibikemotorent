<script lang="ts">
    import type { Snippet, Component } from "svelte";
    import { Loader2 } from "lucide-svelte";

    type Variant =
        | "primary"
        | "secondary"
        | "success"
        | "danger"
        | "warning"
        | "ghost";
    type Size = "sm" | "md" | "lg" | "icon";

    interface Props {
        children?: Snippet;
        variant?: Variant;
        size?: Size;
        type?: "button" | "submit" | "reset";
        disabled?: boolean;
        loading?: boolean;
        class?: string;
        href?: string;
        onclick?: (e: MouseEvent) => void;
    }

    let {
        children,
        variant = "primary",
        size = "md",
        type = "button",
        disabled = false,
        loading = false,
        class: className = "",
        href,
        onclick,
    }: Props = $props();

    const baseClasses =
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer no-underline disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variantClasses: Record<Variant, string> = {
        primary:
            "bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30",
        secondary:
            "bg-white border border-border/50 text-text-secondary hover:bg-bg-primary hover:text-text-primary shadow-sm hover:shadow-md",
        success:
            "bg-success text-white hover:bg-success/90 shadow-md shadow-success/25",
        danger: "bg-danger text-white hover:bg-danger/90 shadow-md shadow-danger/25",
        warning:
            "bg-warning text-white hover:bg-warning/90 shadow-md shadow-warning/25",
        ghost: "bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
    };

    const sizeClasses: Record<Size, string> = {
        sm: "px-3 py-1.5 text-sm rounded-xl",
        md: "px-5 py-2.5 text-sm rounded-2xl",
        lg: "px-6 py-3 text-base rounded-2xl",
        icon: "p-2 rounded-full",
    };

    const classes = $derived(
        `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`,
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
