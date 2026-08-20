<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: className = "" }: Props = $props();
</script>

<div
    class="bg-white border border-black/6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-2xl md:rounded-[1.35rem] overflow-hidden {className}"
>
    {@render children()}
</div>
