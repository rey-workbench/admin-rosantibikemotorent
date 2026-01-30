<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: className = "" }: Props = $props();
</script>

<div
    class="bg-bg-secondary border border-border/40 shadow-sm rounded-3xl overflow-hidden {className}"
>
    {@render children()}
</div>
