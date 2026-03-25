<script lang="ts">
  import { onMount } from "svelte";
  import { Search, ChevronDown, Check, X } from "lucide-svelte";
  import { slide, fade } from "svelte/transition";

  let {
    id = "",
    label = "",
    value = $bindable(),
    options = [],
    placeholder = "Pilih opsi...",
    disabled = false,
    class: className = "",
  } = $props();

  // Ensure value is never undefined to prevent Svelte 5 'props_invalid_value' error
  // which occurs when binding undefined to a prop with a fallback value.
  if (value === undefined) value = "";

  let isOpen = $state(false);
  let searchQuery = $state("");
  let container: HTMLDivElement;

  // Filter options based on search
  let filteredOptions = $derived(
    options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  // Get current label
  let selectedLabel = $derived(
    options.find((opt) => opt.value === value)?.label || "",
  );

  function toggle() {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen) searchQuery = "";
  }

  function select(val: any) {
    value = val;
    isOpen = false;
  }

  function clear(e: MouseEvent) {
    e.stopPropagation();
    value = "";
    if (isOpen) searchQuery = "";
  }

  function autofocus(node: HTMLInputElement) {
    node.focus();
  }

  // Handle click outside
  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (container && !container.contains(event.target as Node)) {
        isOpen = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });
</script>

<div class="space-y-1.5 {className}" bind:this={container}>
  {#if label}
    <label
      for={id}
      class="text-xs font-bold text-text-muted uppercase tracking-wider block px-1"
    >
      {label}
    </label>
  {/if}

  <div class="relative">
    <!-- Trigger Button -->
    <button
      type="button"
      {id}
      class="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-bg-surface border border-border-color rounded-xl text-sm transition-all text-left
             {disabled
        ? 'opacity-50 cursor-not-allowed bg-slate-50'
        : 'hover:border-primary/50 focus:ring-2 focus:ring-primary/20'}
             {isOpen ? 'border-primary ring-2 ring-primary/20' : ''}"
      onclick={toggle}
      aria-expanded={isOpen}
    >
      <span
        class="truncate {selectedLabel
          ? 'text-text-primary font-medium'
          : 'text-text-muted'}"
      >
        {selectedLabel || placeholder}
      </span>

      <div class="flex items-center gap-1 shrink-0">
        {#if value && !disabled}
          <div
            role="button"
            tabindex="0"
            class="p-1 hover:bg-slate-100 rounded-full text-text-muted hover:text-danger transition-colors"
            onclick={clear}
            onkeydown={(e) => e.key === "Enter" && clear(e as any)}
          >
            <X size={14} />
          </div>
        {/if}
        <ChevronDown
          size={16}
          class="text-text-muted transition-transform {isOpen
            ? 'rotate-180'
            : ''}"
        />
      </div>
    </button>

    <!-- Dropdown Menu -->
    {#if isOpen}
      <div
        class="absolute z-50 mt-2 w-full bg-white border border-border-color rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden transform origin-top"
        transition:slide={{ duration: 200 }}
      >
        <!-- Search Bar Inside Dropdown -->
        <div class="p-2 border-b border-slate-100 bg-slate-50/50">
          <div class="relative">
            <Search
              size={14}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-sans"
              placeholder="Cari..."
              bind:value={searchQuery}
              use:autofocus
            />
          </div>
        </div>

        <!-- Options List -->
        <div class="max-h-[240px] overflow-y-auto p-1 custom-scrollbar">
          {#if filteredOptions.length === 0}
            <div class="px-4 py-8 text-center text-text-muted text-sm italic">
              Opsi tidak ditemukan...
            </div>
          {:else}
            {#each filteredOptions as opt}
              <button
                type="button"
                class="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between gap-2
                       {value === opt.value
                  ? 'bg-primary/5 text-primary font-bold'
                  : 'hover:bg-slate-50 text-text-primary'}"
                onclick={() => select(opt.value)}
              >
                <span class="truncate">{opt.label}</span>
                {#if value === opt.value}
                  <span transition:fade={{ duration: 150 }}>
                    <Check size={16} />
                  </span>
                {/if}
              </button>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
</style>
