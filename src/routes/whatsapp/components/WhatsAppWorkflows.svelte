<script lang="ts">
  import { onMount, untrack } from "svelte";
  import {
    Plus, Save, Trash2, Edit2, Zap, LayoutGrid, Terminal, HelpCircle, 
    LayoutTemplate, MessageSquare, ListTree
  } from "lucide-svelte";
  import { 
    SvelteFlow, 
    Background, 
    Controls, 
    type Node as FlowNode, 
    type Edge as FlowEdge,
    addEdge
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";

  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { whatsappApi } from "$lib/api";
  import { toast } from "$lib/stores/toast";
  import { confirm } from "$lib/stores/confirm";
  
  import TriggerNode from "./nodes/TriggerNode.svelte";
  import ActionNode from "./nodes/ActionNode.svelte";

  // ─── Constants ─────────────────────────────────────────────────────────────
  const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode
  };

  const systemActions = [
    { value: "action_motor_list", label: "🏍️ Katalog Motor Tersedia" },
    { value: "action_motor_pricing", label: "💰 Cek Harga Sewa" },
    { value: "action_booking_info", label: "📝 Panduan Pemesanan" },
    { value: "action_booking_status", label: "🔍 Cek Status Pesanan" },
    { value: "action_transaction_info", label: "💳 Info Transaksi Aktif" },
    { value: "action_payment_instructions", label: "🏦 Instruksi Bayar DP" },
    { value: "action_extension_info", label: "🔄 Cara Perpanjang Sewa" },
  ];

  // ─── State ──────────────────────────────────────────────────────────────────
  let workflows: any[] = $state([]);
  let templates: any[] = $state([]);
  let selectedId: string | null = $state(null);
  let isLoading = $state(false);
  let isSaving = $state(false);
  let showConfigModal = $state(false);
  let isNewMode = $state(false);

  // Flow State
  let nodes: FlowNode[] = $state([]);
  let edges: FlowEdge[] = $state([]);

  // Workflow Form (Meta info)
  let flowMeta = $state({
    name: "",
    isActive: true
  });

  // Derived selected workflow
  let selectedWorkflow = $derived(workflows.find(w => w.id === selectedId));

  // ─── Initialization ────────────────────────────────────────────────────────
  onMount(async () => {
    isLoading = true;
    await Promise.all([loadWorkflows(), loadTemplates()]);
    isLoading = false;
  });

  async function loadWorkflows() {
    try {
      const data = await whatsappApi.getAllWorkflows();
      workflows = data;
    } catch {
      toast.error("Gagal memuat workflows");
    }
  }

  async function loadTemplates() {
    try {
      templates = await whatsappApi.getAllTemplates();
    } catch {
      console.error("Gagal memuat templates");
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────
  function selectWorkflow(w: any) {
    selectedId = w.id;
    isNewMode = false;
    flowMeta = {
      name: w.name,
      isActive: w.isActive ?? true
    };

    // Map backend nodes to Flow nodes
    const rawNodes = w.nodes || [];
    const mappedNodes: FlowNode[] = rawNodes.map((n: any, idx: number) => {
      const isTrigger = n.type.startsWith("trigger");
      return {
        id: n.id,
        type: isTrigger ? "trigger" : "action",
        data: {
          trigger: isTrigger ? (w.trigger || (n.type === "trigger_keyword" ? "keyword" : "fallback")) : null,
          keyword: isTrigger ? (n.keyword || w.keyword || "") : "",
          type: n.type,
          data: n.data || {},
          templates,
          systemActions,
          onDelete: removeNode
        },
        position: n.position || { x: 0, y: idx * 150 }
      };
    });

    nodes = mappedNodes;
    edges = w.edges || [];
  }

  function openNew() {
    selectedId = null;
    isNewMode = true;
    flowMeta = {
      name: "New Workflow",
      isActive: true
    };
    
    // Initial nodes for a new workflow
    const triggerId = `node_${Date.now()}`;
    nodes = [{
      id: triggerId,
      type: "trigger",
      position: { x: 0, y: 0 },
      data: { 
        trigger: "keyword", 
        keyword: "", 
        templates, 
        systemActions,
        onDelete: removeNode 
      }
    }];
    edges = [];
    showConfigModal = true;
  }

  function addActionNode() {
    const lastNode = nodes[nodes.length - 1];
    const newId = `node_${Date.now()}`;
    const newNode: FlowNode = {
      id: newId,
      type: "action",
      position: { x: 0, y: (lastNode?.position.y || 0) + 160 },
      data: { 
        type: "send_text", 
        data: { text: "" }, 
        templates, 
        systemActions,
        onDelete: removeNode 
      }
    };

    nodes = [...nodes, newNode];
    
    if (lastNode) {
      edges = addEdge({ 
        id: `e_${lastNode.id}_${newId}`, 
        source: lastNode.id, 
        target: newId, 
        animated: true 
      }, edges);
    }
  }

  // Svelte Flow 1.x with Svelte 5 handles node/edge changes automatically if they are $state
  // We don't need explicit applyNodeChanges/applyEdgeChanges handlers.

  function removeNode(idToRemove: string) {
    nodes = nodes.filter(n => n.id !== idToRemove);
    edges = edges.filter(e => e.source !== idToRemove && e.target !== idToRemove);
  }

  async function saveWorkflow() {
    if (!flowMeta.name.trim()) return toast.warning("Nama workflow wajib diisi");
    
    // Validate trigger
    const triggerNode = nodes.find(n => n.type === "trigger");
    if (!triggerNode) return toast.warning("Workflow wajib memiliki trigger");
    if (triggerNode.data.trigger === "keyword" && !(triggerNode.data.keyword as string)?.trim())
      return toast.warning("Kata kunci trigger wajib diisi");

    isSaving = true;
    try {
      // Map Flow nodes back to backend format
      const finalNodes = nodes.map(n => {
        let type = n.type;
        if (n.type === "trigger") {
          type = n.data.trigger === "keyword" ? "trigger_keyword" : "trigger_fallback";
        } else {
          type = n.data.type;
        }

        return {
          id: n.id,
          type,
          data: (n.data as any).data || {},
          keyword: (n.data as any).keyword as string | undefined,
          position: n.position
        };
      });

      const dto = {
        name: flowMeta.name,
        trigger: triggerNode.data.trigger,
        keyword: (triggerNode.data as any).keyword,
        isActive: flowMeta.isActive,
        nodes: finalNodes,
        edges: edges.map(e => ({ ...e, animated: true }))
      };

      await whatsappApi.upsertWorkflow(selectedId, dto);
      toast.success("Workflow berhasil disimpan!");
      await loadWorkflows();
      showConfigModal = false;
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan workflow");
    } finally {
      isSaving = false;
    }
  }

  async function deleteWorkflow() {
    if (!selectedId) return;
    const ok = await confirm.show({
      title: "Hapus Workflow",
      message: `Hapus workflow "${flowMeta.name}"?`,
      type: "danger",
    });
    if (!ok) return;
    try {
      await whatsappApi.deleteWorkflow(selectedId);
      toast.success("Workflow dihapus");
      selectedId = null;
      await loadWorkflows();
    } catch {
      toast.error("Gagal menghapus workflow");
    }
  }
</script>

<div class="flex h-[calc(100vh-140px)] gap-0 overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
  <!-- SIDEBAR: Workflow List -->
  <div class="w-72 flex flex-col border-r border-slate-200 bg-slate-50/30">
    <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded bg-primary/10 text-primary">
          <ListTree size={14} />
        </div>
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-500">
          Workflows
        </h3>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onclick={openNew}
        class="h-7 w-7 p-0! rounded-md border-slate-200 hover:bg-slate-50"
      >
        <Plus size={16} />
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
      {#if isLoading && workflows.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <div class="loading-spinner w-5 h-5 border-slate-200 border-t-primary"></div>
          <span class="text-[10px] uppercase font-bold tracking-tight">Loading...</span>
        </div>
      {:else if workflows.length === 0}
        <div class="px-4 py-8 text-center text-slate-400 text-xs italic">
          No workflows found.
        </div>
      {:else}
        {#each workflows as w}
          <button
            class="w-full text-left p-3 rounded-lg transition-all group relative
                   {selectedId === w.id
              ? 'bg-white shadow-sm ring-1 ring-slate-200'
              : 'hover:bg-slate-100/50'}"
            onclick={() => selectWorkflow(w)}
          >
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-xs truncate pr-4 {selectedId === w.id ? 'text-primary' : 'text-slate-700'}">
                {w.name}
              </span>
              <div class="h-1.5 w-1.5 rounded-full {w.isActive ? 'bg-emerald-500' : 'bg-slate-300'} shadow-sm"></div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                {w.trigger === "keyword" ? (w.keyword?.split(",")[0] || "Keyword") : "Fallback"}
              </span>
            </div>
            {#if selectedId === w.id}
              <div class="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full"></div>
            {/if}
          </button>
        {/each}
      {/if}
    </div>
  </div>

  <!-- MAIN EDITOR: CANVAS -->
  <div class="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden">
    {#if selectedId || isNewMode}
      <!-- Header Toolbar -->
      <div class="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3">
            <div class="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
              <Zap size={16} />
            </div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-slate-800 leading-none">
                {flowMeta.name}
              </h2>
              <button class="p-1 hover:bg-slate-100 rounded text-slate-400" onclick={() => showConfigModal = true}>
                <Edit2 size={12} />
              </button>
            </div>
          </div>

          <div class="h-6 w-px bg-slate-200"></div>

          <div class="flex items-center gap-2">
            <Button variant="secondary" size="sm" onclick={addActionNode} class="h-8 text-[11px] px-3 font-bold border-slate-200">
              <Plus size={14} class="mr-1.5" /> Add Step
            </Button>
            <Button variant="primary" size="sm" onclick={saveWorkflow} loading={isSaving} class="h-8 text-[11px] px-4 shadow-sm shadow-primary/20 font-bold">
              <Save size={14} class="mr-1.5" /> Save Workflow
            </Button>
            <Button variant="danger" size="sm" onclick={deleteWorkflow} class="h-8 w-8 p-0! border-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          {#if !flowMeta.isActive}
            <span class="text-[9px] px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-bold uppercase tracking-wider">Draft / Inactive</span>
          {:else}
            <span class="text-[9px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold uppercase tracking-wider">Live</span>
          {/if}
        </div>
      </div>

      <div class="flex-1 relative">
        <SvelteFlow
          bind:nodes
          bind:edges
          {nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.5, maxZoom: 0.8 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Controls position="bottom-right" />
          <Background patternColor="#cbd5e1" gap={20} />
        </SvelteFlow>
      </div>
    {:else}
      <!-- Empty State -->
      <div class="flex-1 flex flex-col items-center justify-center h-full">
        <div class="w-48 h-48 relative mb-8">
          <div class="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-20"></div>
          <div class="absolute inset-4 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 z-10">
            <LayoutGrid size={64} class="text-slate-200" />
          </div>
          <div class="absolute -right-2 -top-2 bg-orange-500 text-white p-3 rounded-2xl shadow-lg z-20 animate-bounce">
            <Plus size={24} />
          </div>
        </div>
        <h3 class="text-xl font-bold text-slate-800">Workflow Designer</h3>
        <p class="text-sm text-slate-400 mt-2 text-center max-w-xs leading-relaxed">
          Select an existing workflow from the list or create a new automation flow to get started.
        </p>
        <Button variant="primary" onclick={openNew} class="mt-8 px-6 h-11 rounded-xl shadow-lg shadow-primary/20 font-bold">
          <Plus size={18} class="mr-2" /> Create New Workflow
        </Button>
      </div>
    {/if}
  </div>
</div>

<!-- Meta Config Modal -->
<Modal open={showConfigModal} onclose={() => showConfigModal = false} title="Workflow Configuration">
  <div class="space-y-6 pt-2">
    <Input
      id="wfname"
      label="Nama Workflow"
      bind:value={flowMeta.name}
      placeholder="Misal: Customer Onboarding"
    />

    <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <input
        type="checkbox"
        id="wfactive"
        bind:checked={flowMeta.isActive}
        class="h-5 w-5 accent-primary rounded-lg border-none shadow-sm cursor-pointer"
      />
      <div class="flex-1">
        <label for="wfactive" class="text-sm font-bold text-slate-700 cursor-pointer block">Status Aktif</label>
        <p class="text-[10px] text-slate-400">Tentukan apakah workflow ini diproses oleh bot saat ini.</p>
      </div>
    </div>

    <div class="flex gap-2 pt-2">
      <Button variant="secondary" class="flex-1 h-11" onclick={() => showConfigModal = false}>Batal</Button>
      <Button variant="primary" class="flex-1 h-11 font-bold" onclick={() => showConfigModal = false}>Lanjut ke Editor</Button>
    </div>
  </div>
</Modal>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
</style>
