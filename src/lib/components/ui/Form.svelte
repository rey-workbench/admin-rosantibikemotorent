<script lang="ts">
  import { ArrowLeft, Save } from "lucide-svelte";
  import { Button, Card, CardBody } from "$lib/components/ui";
  import type { Snippet } from "svelte";
  import { PageHeader } from "../layout";

  interface ActionButton {
    label: string;
    variant?: "primary" | "secondary" | "danger";
    type?: "button" | "submit";
    loading?: boolean;
    onclick?: () => void;
    href?: string;
  }

  interface Props {
    title: string;
    backHref?: string;
    actions?: ActionButton[];
    isLoading?: boolean;
    handleSubmit?: (e: Event) => void;
    children: Snippet;
  }

  let {
    title,
    backHref,
    actions = [],
    isLoading = false,
    handleSubmit,
    children,
  }: Props = $props();
</script>

<svelte:head>
  <title>{title} - Rosantibike Motorent</title>
</svelte:head>

<PageHeader {title} {backHref} />

{#if isLoading}
  <div class="loading-page">
    <div class="loading-spinner"></div>
  </div>
{:else}
  <Card>
    <CardBody>
      <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
        {@render children()}

        {#if actions.length > 0}
          <div class="flex justify-end gap-3 pt-4 border-t border-border">
            {#each actions as action}
              {#if action.href}
                <Button
                  href={action.href}
                  variant={action.variant || "secondary"}
                >
                  {action.label}
                </Button>
              {:else}
                <Button
                  type={action.type || "submit"}
                  variant={action.variant || "primary"}
                  loading={action.loading}
                  onclick={action.onclick}
                >
                  {#if action.variant === "primary"}
                    <Save size={18} />
                  {/if}
                  {action.label}
                </Button>
              {/if}
            {/each}
          </div>
        {/if}
      </form>
    </CardBody>
  </Card>
{/if}

<style>
  .loading-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
