<script lang="ts">
    type Variant = "success" | "danger" | "warning" | "info";

    interface Props {
        variant?: Variant;
        message: string;
        class?: string;
    }

    let { variant = "info", message, class: className = "" }: Props = $props();

    const variantClasses: Record<Variant, string> = {
        success: "bg-success/10 border-success/30 text-success",
        danger: "bg-danger/10 border-danger/30 text-danger",
        warning: "bg-warning/10 border-warning/30 text-warning",
        info: "bg-info/10 border-info/30 text-info",
    };
</script>

<div
    class="px-4 py-3 rounded-md border text-sm {variantClasses[
        variant
    ]} {className}"
>
    {message}
</div>
