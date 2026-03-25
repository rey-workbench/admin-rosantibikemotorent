<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { MessageSquare, Zap, RefreshCw, FileText, Trash2, ChevronDown, AlignLeft, Database } from "lucide-svelte";

  let { data, id }: NodeProps = $props();

  const categories = [
    { value: 'message', icon: MessageSquare, color: 'from-blue-400 to-blue-600', label: 'Message' },
    { value: 'action', icon: Zap, color: 'from-emerald-400 to-emerald-600', label: 'Action' },
    { value: 'delay', icon: RefreshCw, color: 'from-amber-400 to-amber-600', label: 'Wait' }
  ];

  let currentCategory = $derived(
    data.type === 'delay' ? 'delay' : 
    ((data.type as string)?.startsWith('action_') ? 'action' : 'message')
  );

  function setCategory(cat: string) {
    if (cat === 'delay') {
      data.type = 'delay';
      (data.data as any).delayMs = 1000;
    } else if (cat === 'action') {
      data.type = (data.systemActions as any)?.[0]?.value || 'action_motor_list';
    } else {
      data.type = 'send_text';
      (data.data as any).text = '';
    }
  }

  function onDelete() {
    (data.onDelete as any)(id);
  }
</script>

<div class="w-72 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden group hover:border-primary/50 transition-all duration-300">
  <!-- Header -->
  <div class="bg-linear-to-br {categories.find(c => c.value === currentCategory)?.color} px-4 py-2.5 flex items-center justify-between text-white border-b border-black/5">
    <div class="flex items-center gap-2">
      {#if categories.find(c => c.value === currentCategory)?.icon}
        {@const Icon = categories.find(c => c.value === currentCategory)?.icon}
        <Icon size={14} class="fill-current/20" />
      {/if}
      <span class="text-[11px] font-black uppercase tracking-wider">{categories.find(c => c.value === currentCategory)?.label}</span>
    </div>
    <div class="flex items-center gap-1">
      <button 
        class="p-1 hover:bg-black/10 rounded transition-colors text-white/80 hover:text-white"
        onclick={onDelete}
        title="Remove Node"
      >
        <Trash2 size={12} />
      </button>
    </div>
  </div>

  <!-- Body -->
  <div class="p-4 space-y-4 bg-white">
    <!-- Category Selector (Direct Edit) -->
    <div class="flex bg-slate-100 p-0.5 rounded-lg mb-2">
      {#each categories as c}
        <button 
          class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold rounded-md transition-all
                 {currentCategory === c.value ? 'bg-white shadow-sm text-primary scale-100' : 'text-slate-500 hover:text-slate-700 opacity-60 hover:opacity-100'}"
          onclick={() => setCategory(c.value)}
        >
          <c.icon size={12} /> {c.label.toUpperCase()}
        </button>
      {/each}
    </div>

    <!-- Content Based on Category -->
    {#if currentCategory === 'message'}
      <div class="space-y-3 animate-in fade-in duration-300">
         <!-- Sub-type: Text or Template -->
         <div class="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100/50">
           <button 
             class="flex-1 py-1 text-[9px] font-bold rounded transition-all {data.type === 'send_text' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}"
             onclick={() => (data.type = "send_text")}
           >
            <AlignLeft size={10} class="inline mr-1" /> TEXT
           </button>
           <button 
             class="flex-1 py-1 text-[9px] font-bold rounded transition-all {data.type === 'send_template' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}"
             onclick={() => (data.type = "send_template")}
           >
            <Database size={10} class="inline mr-1" /> TEMPLATE
           </button>
         </div>

         {#if data.type === 'send_text'}
           <div class="relative">
             <textarea
               bind:value={(data.data as any).text}
               placeholder="Write message..."
               rows="3"
               class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 resize-none custom-scrollbar"
             ></textarea>
           </div>
         {:else}
           <div class="space-y-2">
             <div class="relative">
               <select
                 bind:value={(data.data as any).templateKey}
                 class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 appearance-none pr-8"
               >
                 <option value="" disabled>Select Template...</option>
                 {#each (data.templates as any[]) as t}
                   <option value={t.key}>{t.title || t.key}</option>
                 {/each}
               </select>
               <ChevronDown size={14} class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             </div>
           </div>
         {/if}
      </div>
    {:else if currentCategory === 'action'}
      <div class="space-y-2 animate-in slide-in-from-top-1 duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Operation</span>
        <div class="relative">
          <select
            bind:value={data.type}
            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 appearance-none pr-8"
          >
            {#each (data.systemActions as any[]) as action}
              <option value={action.value}>{action.label}</option>
            {/each}
          </select>
          <ChevronDown size={14} class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div class="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-start gap-2">
          <Zap size={12} class="text-emerald-500 mt-0.5 shrink-0" />
          <p class="text-[9px] text-emerald-700 leading-relaxed font-medium">Automatic system response for specialized data handling.</p>
        </div>
      </div>
    {:else if currentCategory === 'delay'}
      <div class="space-y-2 animate-in slide-in-from-top-1 duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Delay duration (ms)</span>
        <div class="flex items-center gap-3 bg-amber-50/30 p-2 rounded-lg border border-amber-100/50">
          <input
            type="number"
            bind:value={(data.data as any).delayMs}
            min="100"
            max="10000"
            step="100"
            class="w-24 bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none transition-all font-mono font-bold text-amber-900"
          />
          <div class="text-[10px] text-amber-700 font-medium leading-tight">
            Adds a natural <br>pause in flow.
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Ports -->
  <Handle
    type="target"
    position={Position.Top}
    class="w-3! h-3! bg-white! border-2! border-slate-300! -top-1.5! shadow-sm hover:scale-125! transition-transform"
  />
  <Handle
    type="source"
    position={Position.Bottom}
    class="w-3! h-3! bg-white! border-2! border-slate-300! -bottom-1.5! shadow-sm hover:scale-125! transition-transform"
  />
</div>

<style>
  :global(.svelte-flow__node-action) {
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
</style>
