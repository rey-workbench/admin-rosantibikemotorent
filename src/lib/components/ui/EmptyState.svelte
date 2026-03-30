<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Component } from "svelte";

    interface Props {
        icon?: any;
        title: string;
        description?: string;
        action?: Snippet;
    }

    let { icon: Icon, title, description, action }: Props = $props();
</script>

<div class="empty-state">
    {#if Icon}
        <div class="empty-state-icon">
            <Icon size={48} />
        </div>
    {/if}
    <h3>{title}</h3>
    {#if description}
        <p>{description}</p>
    {/if}
    {#if action}
        {@render action()}
    {/if}
</div>

<style>
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        text-align: center;
        padding: 2rem;
    }

    .empty-state-icon {
        color: #9ca3af;
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #374151;
        margin: 0;
    }

    p {
        color: #6b7280;
        margin-top: 0.5rem;
    }
</style>
