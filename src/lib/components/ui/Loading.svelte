<script lang="ts">
    interface Props {
        text?: string;
    }

    let { text = "Memuat data..." }: Props = $props();
</script>

<div class="loading-page">
    <div class="loading-spinner"></div>
    {#if text}
        <p class="mt-4 text-text-secondary">{text}</p>
    {/if}
</div>

<style>
    .loading-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e5e7eb;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
