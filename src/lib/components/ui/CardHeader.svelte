<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: className = "" }: Props = $props();
</script>

<div class="px-6 py-5 border-b border-black/6 {className}">
    {@render children()}
</div>
