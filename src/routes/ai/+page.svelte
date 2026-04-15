<script lang="ts">
    import { onMount } from "svelte";
    import { Brain, Send, Save, Plus, Trash2, Edit2, Search, MessageSquare, Database, Sparkles, Settings, HelpCircle } from "lucide-svelte";
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { Button, Input, Select, Textarea, Modal, Tabs, Badge, Card } from "$lib/components/ui";
    import { aiApi } from "$lib/api";
    import type { AiKnowledge } from "$lib/types";
    import { toast } from "$lib/stores/toast";
    import { confirm } from "$lib/stores/confirm";

    // --- State Management ---
    let activeTab = $state("playground");
    let loading = $state(false);

    // Playground State
    let testMessage = $state("");
    let chatHistory = $state<{ role: "user" | "bot"; text: string; debug?: any }[]>([]);
    let isWnaTest = $state(false);

    // Knowledge State
    let knowledgeBase = $state<AiKnowledge[]>([]);
    let searchQuery = $state("");
    let isModalOpen = $state(false);
    let editingItem = $state<any>(null);
    let formData = $state({
        category: "general",
        question: "",
        answer: "",
        keywords: "",
        priority: 0
    });

    const tabs = [
        { id: "playground", label: "AI Playground" },
        { id: "knowledge", label: "Knowledge Base" }
    ];

    onMount(async () => {
        await fetchKnowledge();
    });

    async function fetchKnowledge() {
        try {
            knowledgeBase = await aiApi.getKnowledge();
        } catch (e) {
            toast.error("Gagal mengambil data knowledge base");
        }
    }

    // --- AI Playground Actions ---
    async function handleSendMessage() {
        if (!testMessage.trim() || loading) return;

        const msg = testMessage;
        chatHistory = [...chatHistory, { role: "user", text: msg }];
        testMessage = "";
        loading = true;

        try {
            const data = await aiApi.test({ 
                message: msg,
                isWNA: isWnaTest 
            });
            chatHistory = [...chatHistory, { 
                role: "bot", 
                text: data.response || "Maaf, AI tidak memberikan jawaban.",
                debug: data.debug
            }];
        } catch (e) {
            toast.error("AI gagal merespons");
        } finally {
            loading = false;
        }
    }

    // --- Knowledge Base Actions ---
    function openModal(item: any = null) {
        editingItem = item;
        if (item) {
            formData = {
                category: item.category,
                question: item.question,
                answer: item.answer,
                keywords: item.keywords.join(", "),
                priority: item.priority
            };
        } else {
            formData = {
                category: "general",
                question: "",
                answer: "",
                keywords: "",
                priority: 0
            };
        }
        isModalOpen = true;
    }

    async function saveKnowledge() {
        if (!formData.question || !formData.answer) {
            toast.warning("Pertanyaan dan jawaban wajib diisi");
            return;
        }

        loading = true;
        const payload = {
            ...formData,
            keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
            priority: Number(formData.priority)
        };

        try {
            if (editingItem) {
                await aiApi.updateKnowledge(editingItem.id, payload);
                toast.success("Knowledge base berhasil diperbarui");
            } else {
                await aiApi.createKnowledge(payload);
                toast.success("Knowledge baru berhasil ditambahkan");
            }
            isModalOpen = false;
            await fetchKnowledge();
        } catch (e) {
            toast.error("Gagal menyimpan data");
        } finally {
            loading = false;
        }
    }

    async function deleteItem(id: string) {
        const ok = await confirm.show({
            title: "Hapus Knowledge?",
            message: "Data yang dihapus tidak dapat dikembalikan.",
            type: "danger",
            confirmText: "Hapus Sekarang"
        });

        if (!ok) return;

        try {
            await aiApi.deleteKnowledge(id);
            toast.success("Item berhasil dihapus");
            await fetchKnowledge();
        } catch (e) {
            toast.error("Gagal menghapus data");
        }
    }

    const filteredKnowledge = $derived(
        (Array.isArray(knowledgeBase) ? knowledgeBase : []).filter(item => 
            (item.question?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
        )
    );
</script>

<div class="space-y-6">
    <PageHeader 
        title="AI Assistant Manager" 
        subtitle="Kelola otak bot WhatsApp RosantiBike dan uji coba respons AI Anda."
    >
        <Button onclick={() => openModal()}>
            <Plus size={18} class="mr-2" />
            Tambah Knowledge
        </Button>
    </PageHeader>

    <div class="space-y-6">
        <Tabs {tabs} {activeTab} onchange={(id) => activeTab = id} />

        {#if activeTab === "playground"}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <!-- Chat Interface -->
                <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-border flex flex-col h-[600px] overflow-hidden">
                    <div class="p-4 border-b border-border flex justify-between items-center bg-bg-secondary/20">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Brain size={18} />
                            </div>
                            <div>
                                <h3 class="font-bold text-sm">AI Playground</h3>
                                <p class="text-[10px] text-text-secondary">Simulator bot RosantiBike</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-secondary/10">
                        {#if chatHistory.length === 0}
                            <div class="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                <Sparkles size={32} class="mb-3" />
                                <p class="text-sm">Gunakan kolom di bawah untuk<br>menguji respons AI!</p>
                            </div>
                        {/if}
                        
                        {#each chatHistory as chat}
                            <div class="flex flex-col {chat.role === 'user' ? 'items-end' : 'items-start'}">
                                <div class="max-w-[85%] p-3 rounded-xl text-sm {chat.role === 'user' ? 'bg-primary text-white' : 'bg-white border border-border shadow-sm'}">
                                    {chat.text}
                                </div>
                                
                                {#if chat.debug && chat.debug.matches}
                                    <div class="mt-2 p-3 bg-bg-secondary/50 rounded-lg text-[10px] text-text-secondary w-full max-w-[85%] font-mono space-y-1.5 border border-border/50">
                                        <div class="font-bold text-primary flex items-center gap-1.5 border-b border-border/40 pb-1 mb-1">
                                            <Database size={10} /> RAG Matches:
                                        </div>
                                        {#each chat.debug.matches as match}
                                            <div class="flex justify-between gap-4">
                                                <span class="truncate">{match.item.questionId || match.item.id}</span>
                                                <span class="font-bold {match.score >= 0.82 ? 'text-success' : 'text-warning'}">
                                                    {(match.score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        {:else}
                                            <div class="italic opacity-50">Menggunakan model bahasa umum (tanpa konteks database)</div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        {/each}

                        {#if loading}
                            <div class="flex items-start animate-in fade-in duration-300">
                                <div class="bg-white p-3 rounded-xl border border-border shadow-sm text-sm">
                                    <span class="flex items-center gap-2">
                                        <div class="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                                        <div class="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div class="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        Bot sedang memproses...
                                    </span>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <div class="p-3 border-t border-border">
                        <form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                            <div class="flex-1">
                                <Input 
                                    id="test-message"
                                    bind:value={testMessage}
                                    placeholder="Ketik pertanyaan simulasi..." 
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" disabled={loading} size="icon">
                                <Send size={18} />
                            </Button>
                        </form>
                    </div>
                </div>

                <!-- Guidance & Config -->
                <div class="space-y-4">
                    <Card>
                        <div class="p-4 space-y-4">
                            <h3 class="font-bold text-sm flex items-center gap-2">
                                <Settings size={16} class="text-primary" />
                                Konfigurasi Uji Coba
                            </h3>
                            <div class="flex items-center justify-between p-2 bg-bg-secondary/50 rounded-lg">
                                <span class="text-xs font-medium">Customer Internasional</span>
                                <input type="checkbox" bind:checked={isWnaTest} class="w-4 h-4 text-primary" />
                            </div>
                            <p class="text-[10px] text-text-secondary leading-relaxed">
                                Jika aktif, bot akan merespons dalam Bahasa Inggris dengan persona internasional.
                            </p>
                        </div>
                    </Card>

                    <Card class="bg-primary/5 border-primary/20">
                        <div class="p-4 space-y-3">
                            <h4 class="font-bold text-primary text-sm flex items-center gap-2">
                                <HelpCircle size={16} />
                                Cara Kerja AI
                            </h4>
                            <div class="text-[10px] space-y-2 text-text-secondary">
                                <p>1. <b>RAG (Retrieval)</b>: Bot mencari data paling relevan di Knowledge Base.</p>
                                <p>2. <b>Reasoning</b>: AI menggabungkan data tersebut dengan memori percakapan.</p>
                                <p>3. <b>Response</b>: AI menghasilkan jawaban final yang sopan dan akurat.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        {:else}
            <!-- Knowledge Base Management Tab -->
            <Card class="overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div class="p-4 border-b border-border bg-bg-secondary/10 flex justify-between items-center">
                    <div class="relative w-full max-w-xs">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input 
                            bind:value={searchQuery}
                            placeholder="Cari FAQ..." 
                            class="pl-9 pr-3 py-1.5 w-full bg-white border border-border rounded-lg text-xs"
                        />
                    </div>
                    <Badge variant="info" text={`Total: ${filteredKnowledge.length} item`} />
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-bg-secondary text-text-muted text-[10px] uppercase font-bold border-b border-border">
                            <tr>
                                <th class="px-5 py-3">Kategori</th>
                                <th class="px-5 py-3">Pertanyaan</th>
                                <th class="px-5 py-3">Priority</th>
                                <th class="px-5 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                            {#each filteredKnowledge as item}
                                <tr class="hover:bg-bg-secondary/30 transition-colors">
                                    <td class="px-5 py-3">
                                        <Badge variant="default" text={item.category} />
                                    </td>
                                    <td class="px-5 py-3 font-medium max-w-xs truncate">{item.question}</td>
                                    <td class="px-5 py-3 text-xs">{item.priority}</td>
                                    <td class="px-5 py-3 text-right">
                                        <div class="flex justify-end gap-1">
                                            <Button variant="secondary" size="icon" class="h-8 w-8" onclick={() => openModal(item)}>
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button variant="danger" size="icon" class="h-8 w-8" onclick={() => deleteItem(item.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="4" class="px-5 py-10 text-center text-text-muted italic">
                                        Tidak ada data knowledge base ditemukan.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </Card>
        {/if}
    </div>
</div>

<Modal 
    open={isModalOpen} 
    title={editingItem ? "Edit Pengetahuan" : "Tambah Pengetahuan Baru"} 
    onclose={() => isModalOpen = false}
    size="lg"
>
    {#snippet children()}
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <Select 
                        id="category"
                        label="Kategori"
                        bind:value={formData.category}
                        options={[
                            { value: "syarat", label: "Syarat & Ketentuan" },
                            { value: "fasilitas", label: "Fasilitas" },
                            { value: "lokasi", label: "Lokasi & Antar Jemput" },
                            { value: "pembayaran", label: "Pembayaran" },
                            { value: "denda", label: "Denda & Telat" },
                            { value: "general", label: "Umum (General)" }
                        ]}
                    />
                </div>
                    <Input 
                        id="priority"
                        label="Prioritas (0-10)"
                        type="number" 
                        bind:value={formData.priority} 
                    />
            </div>

            <Input 
                id="question"
                label="Pertanyaan"
                bind:value={formData.question} 
                placeholder="Misal: Apakah melayani antar motor ke bandara?" 
            />

            <Textarea 
                id="answer"
                label="Jawaban AI"
                bind:value={formData.answer} 
                rows={4} 
                placeholder="Tuliskan jawaban yang akan diberikan oleh AI..." 
            />

            <Input 
                id="keywords"
                label="Keywords (Opsional, pisahkan dengan koma)"
                bind:value={formData.keywords} 
                placeholder="antar, jemput, bandara, juanda" 
            />

            <div class="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" onclick={() => isModalOpen = false}>Batal</Button>
                <Button onclick={saveKnowledge} disabled={loading}>
                    <Save size={16} class="mr-2" />
                    Simpan Data
                </Button>
            </div>
        </div>
    {/snippet}
</Modal>
