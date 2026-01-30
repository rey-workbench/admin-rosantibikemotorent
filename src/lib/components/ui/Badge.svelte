<script lang="ts">
    type Variant = "success" | "warning" | "danger" | "info" | "default";

    interface Props {
        variant?: Variant;
        class?: string;
        text: string;
    }

    let { variant = "default", class: className = "", text }: Props = $props();

    const variantClasses: Record<Variant, string> = {
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
        info: "bg-info/10 text-info",
        default: "bg-bg-tertiary text-text-secondary",
    };
</script>

<span
    class="inline-flex items-center px-2.5 py-1 text-xs font-bold tracking-wide rounded-lg {variantClasses[
        variant
    ]} {className}"
>
    {text}
</span>
