<script lang="ts">
    type Variant = "success" | "warning" | "danger" | "info" | "default";

    interface Props {
        variant?: Variant;
        class?: string;
        text: string;
    }

    let { variant = "default", class: className = "", text }: Props = $props();

    const variantClasses: Record<Variant, string> = {
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
        warning: "bg-amber-50 text-amber-700 border border-amber-200/80",
        danger: "bg-red-50 text-red-700 border border-red-200/80",
        info: "bg-blue-50 text-[#0071e3] border border-blue-200/80",
        default: "bg-bg-tertiary text-text-secondary border border-black/6",
    };
</script>

<span
    class="inline-flex items-center px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider rounded-full {variantClasses[
        variant
    ]} {className}"
>
    {text}
</span>
