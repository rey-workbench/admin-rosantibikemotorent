<script lang="ts">
    import type { Snippet } from 'svelte';
    import { ArrowLeft } from 'lucide-svelte';
    import { Button } from '../ui';

    interface Props {
        title: string;
        subtitle?: string;
        backHref?: string;
        children?: Snippet;
    }

    let { title, subtitle, backHref, children }: Props = $props();
</script>

<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div class="flex items-center gap-3">
        {#if backHref}
            <Button href={backHref} variant="secondary" size="icon" class="rounded-full">
                <ArrowLeft size={18} />
            </Button>
        {/if}
        <div>
            <h1 class="text-2xl font-bold text-text-primary">{title}</h1>
            {#if subtitle}
                <p class="text-text-secondary text-sm mt-1">{subtitle}</p>
            {/if}
        </div>
    </div>
    {#if children}
        <div class="flex items-center gap-3">
            {@render children()}
        </div>
    {/if}
</div>
