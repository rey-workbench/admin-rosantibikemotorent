<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { Zap, Terminal, HelpCircle } from "lucide-svelte";

  let { data, id }: NodeProps = $props();

  function updateTrigger(type: string) {
    data.trigger = type;
  }
</script>

<div class="w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden group">
  <!-- Header -->
  <div class="bg-linear-to-br from-orange-400 to-orange-600 px-4 py-2.5 flex items-center justify-between text-white border-b border-orange-700/10">
    <div class="flex items-center gap-2">
      <Zap size={14} class="fill-current" />
      <span class="text-[11px] font-black uppercase tracking-wider">Trigger</span>
    </div>
    <div class="px-1.5 py-0.5 rounded bg-black/10 text-[9px] font-bold uppercase tracking-tighter">Input Entry</div>
  </div>

  <!-- Body -->
  <div class="p-4 space-y-3 bg-white">
    <div class="flex bg-slate-100 p-0.5 rounded-lg">
      <button 
        class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-md transition-all
               {data.trigger === 'keyword' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}"
        onclick={() => updateTrigger('keyword')}
      >
        <Terminal size={12} /> KEYWORD
      </button>
      <button 
        class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold rounded-md transition-all
               {data.trigger === 'fallback' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}"
        onclick={() => updateTrigger('fallback')}
      >
        <HelpCircle size={12} /> FALLBACK
      </button>
    </div>

    {#if data.trigger === "keyword"}
      <div class="space-y-1">
        <label for="keyword-{id}" class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pemicu Keyword</label>
        <div class="relative">
          <input
            id="keyword-{id}"
            type="text"
            bind:value={(data.keyword as string)}
            placeholder="e.g. menu, sewa"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>
      </div>
    {:else}
      <div class="py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 italic text-[10px] text-slate-500 leading-relaxed">
        Triggers when no other keywords match the incoming message.
      </div>
    {/if}
  </div>

  <!-- Output Port -->
  <Handle
    type="source"
    position={Position.Bottom}
    class="w-3! h-3! bg-orange-500! border-2! border-white! -bottom-1.5! shadow-sm hover:scale-125! transition-transform"
  />
</div>

<style>
  :global(.svelte-flow__node-trigger) {
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
  }
</style>
