<script lang="ts">
    import { onMount } from "svelte";
    import { Brain, Send, Save, Plus, Trash2, Edit2, Search, MessageSquare, Database, Sparkles, Settings, HelpCircle, Check, CheckCheck } from "lucide-svelte";
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
    let chatHistory = $state<{ role: "user" | "bot"; text: string; debug?: any; timestamp?: number }[]>([]);
    let isWnaTest = $state(false);

    // --- WhatsApp Message Parser ---
    function parseWhatsAppText(text: string): { type: 'text' | 'bold' | 'italic' | 'code' | 'newlines'; content: string }[] {
        if (!text) return [];
        
        const segments: { type: 'text' | 'bold' | 'italic' | 'code' | 'newlines'; content: string }[] = [];
        let remaining = text;
        
        // Pattern untuk parsing: *bold*, _italic_, ```code```
        const patterns = [
            { regex: /\*([^*]+)\*/, type: 'bold' as const },
            { regex: /_([^_]+)_/, type: 'italic' as const },
            { regex: /```([^`]+)```/, type: 'code' as const },
        ];
        
        // Proses baris baru terlebih dahulu
        const lines = remaining.split('\n');
        
        lines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
                segments.push({ type: 'newlines', content: '\n' });
            }
            
            let lineRemaining = line;
            let hasMatch = true;
            
            while (hasMatch && lineRemaining) {
                hasMatch = false;
                let earliestMatch: { index: number; length: number; type: 'bold' | 'italic' | 'code'; content: string } | null = null;
                
                for (const { regex, type } of patterns) {
                    const match = lineRemaining.match(regex);
                    if (match && match.index !== undefined) {
                        if (!earliestMatch || match.index < earliestMatch.index) {
                            earliestMatch = {
                                index: match.index,
                                length: match[0].length,
                                type,
                                content: match[1]
                            };
                        }
                    }
                }
                
                if (earliestMatch) {
                    // Add text before match
                    if (earliestMatch.index > 0) {
                        segments.push({ type: 'text', content: lineRemaining.slice(0, earliestMatch.index) });
                    }
                    // Add formatted content
                    segments.push({ type: earliestMatch.type, content: earliestMatch.content });
                    // Continue with remaining
                    lineRemaining = lineRemaining.slice(earliestMatch.index + earliestMatch.length);
                    hasMatch = true;
                }
            }
            
            // Add remaining text
            if (lineRemaining) {
                segments.push({ type: 'text', content: lineRemaining });
            }
        });
        
        return segments;
    }

    // Format timestamp untuk tampilan WhatsApp
    function formatTimestamp(ts: number): string {
        return new Date(ts).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

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
        const now = Date.now();
        chatHistory = [...chatHistory, { role: "user", text: msg, timestamp: now }];
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
                debug: data.debug,
                timestamp: Date.now()
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
                <div class="lg:col-span-2 rounded-2xl shadow-sm border border-border flex flex-col h-[600px] overflow-hidden bg-[#f0f2f5]">
                    <div class="p-3 border-b border-border/50 flex justify-between items-center" style="background-color: #f0f2f5;">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white shadow-sm">
                                <Brain size={20} />
                            </div>
                            <div>
                                <h3 class="font-bold text-sm text-text-primary">RosantiBike Bot</h3>
                                <p class="text-[10px] text-text-muted flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Online - AI Assistant
                                </p>
                            </div>
                        </div>
                    </div>

                    <div 
                        class="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin"
                        style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-blend-mode: overlay; background-color: #efeae2;"
                    >
                        {#if chatHistory.length === 0}
                            <div class="h-full flex flex-col items-center justify-center opacity-40 text-center">
                                <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Brain size={32} class="text-primary" />
                                </div>
                                <p class="text-sm font-medium text-text-secondary">AI Playground Simulator</p>
                                <p class="text-xs text-text-muted mt-1">Ketik pesan di bawah untuk menguji respons bot</p>
                            </div>
                        {/if}
                        
                        {#each chatHistory as chat, i}
                            {@const parsed = parseWhatsAppText(chat.text)}
                            {@const isUser = chat.role === 'user'}
                            {@const showAvatar = !isUser && (i === 0 || chatHistory[i - 1].role === 'user')}
                            
                            <div class="flex {isUser ? 'justify-end' : 'justify-start'} items-end gap-1 group">
                                {#if showAvatar}
                                    <div class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-1 shadow-sm">
                                        <Brain size={14} />
                                    </div>
                                {:else if !isUser}
                                    <div class="w-7 shrink-0"></div>
                                {/if}
                                
                                <div class="relative max-w-[70%] {isUser ? 'order-1' : 'order-2'}">
                                    <div class="
                                        px-2.5 py-1.5 shadow-sm text-sm
                                        {isUser 
                                            ? 'bg-[#d9fdd3] dark:bg-primary/20 rounded-l-lg rounded-tr-lg rounded-br-md' 
                                            : 'bg-white dark:bg-bg-tertiary rounded-r-lg rounded-tl-md rounded-bl-md'}
                                    ">
                                        <div class="whitespace-pre-wrap leading-relaxed text-text-primary {chat.text.length > 100 ? 'text-[13px]' : 'text-sm'}">
                                            {#each parsed as segment}
                                                {#if segment.type === 'bold'}
                                                    <strong class="font-bold">{segment.content}</strong>
                                                {:else if segment.type === 'italic'}
                                                    <em class="italic">{segment.content}</em>
                                                {:else if segment.type === 'code'}
                                                    <code class="bg-black/10 px-1 py-0.5 rounded text-[12px] font-mono">{segment.content}</code>
                                                {:else if segment.type === 'newlines'}
                                                    <br />
                                                {:else}
                                                    {segment.content}
                                                {/if}
                                            {/each}
                                        </div>
                                        
                                        <div class="flex items-center justify-end gap-1 mt-0.5 -mr-1">
                                            <span class="text-[10px] text-text-muted/70">
                                                {chat.timestamp ? formatTimestamp(chat.timestamp) : ''}
                                            </span>
                                            {#if isUser}
                                                <span class="text-primary">
                                                    <CheckCheck size={14} />
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {#if chat.debug && chat.debug.matches && chat.debug.matches.length > 0}
                                <div class="flex {isUser ? 'justify-end' : 'justify-start'} {isUser ? 'ml-10' : 'ml-10'}">
                                    <div class="mt-1 p-2 bg-white/80 rounded-lg text-[10px] text-text-muted w-full max-w-[85%] font-mono border border-border/30 shadow-sm">
                                        <div class="font-bold text-primary/80 flex items-center gap-1.5 pb-1 mb-1.5 border-b border-border/30">
                                            <Database size={10} /> Knowledge Base Matches:
                                        </div>
                                        <div class="space-y-1">
                                            {#each chat.debug.matches.slice(0, 3) as match}
                                                <div class="flex justify-between gap-3 items-start">
                                                    <span class="truncate flex-1 text-text-secondary">{match.item.question || match.item.questionId || 'N/A'}</span>
                                                    <span class="shrink-0 font-bold {match.score >= 0.82 ? 'text-green-600' : 'text-amber-600'}">
                                                        {(match.score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            {/each}
                                            {#if chat.debug.matches.length > 3}
                                                <div class="text-text-muted/60 italic">+{chat.debug.matches.length - 3} matches lainnya</div>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}

                        {#if loading}
                            <div class="flex items-end gap-1 animate-in fade-in duration-300">
                                <div class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white shrink-0">
                                    <Brain size={14} />
                                </div>
                                <div class="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
                                    <span class="flex items-center gap-1.5">
                                        <div class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                                        <div class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.15s]"></div>
                                        <div class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.3s]"></div>
                                    </span>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <div class="p-3 border-t border-border/50 bg-bg-secondary/30">
                        <form class="flex gap-3 items-end" onsubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                            <div class="flex-1 bg-white rounded-xl px-4 py-2.5 border border-border/30 focus-within:border-primary/50 transition-colors shadow-sm">
                                <input 
                                    id="test-message"
                                    bind:value={testMessage}
                                    placeholder="Ketik pesan untuk simulasi bot..."
                                    disabled={loading}
                                    class="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted/60"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading || !testMessage.trim()}
                                class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <Send size={18} />
                            </button>
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
