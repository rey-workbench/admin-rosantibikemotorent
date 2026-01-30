<script lang="ts">
    import {
        MessageSquare,
        X,
        Send,
        Phone,
        User,
        Loader2,
        Search,
        History,
    } from "lucide-svelte";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { transaksiApi, whatsappApi } from "$lib/api";
    import type { Transaksi } from "$lib/types";
    import { toast } from "$lib/stores/toast";

    let isOpen = $state(false);
    let contacts: { name: string; phone: string; lastTx?: string }[] = $state(
        [],
    );
    let filteredContacts: { name: string; phone: string; lastTx?: string }[] =
        $state([]);
    let searchQuery = $state("");
    let selectedContact: { name: string; phone: string } | null = $state(null);
    let manualPhone = $state("");
    let message = $state("");
    let isSending = $state(false);
    let isLoadingContacts = $state(false);

    onMount(() => {
        loadContacts();
    });

    // Load contacts from transactions
    async function loadContacts() {
        isLoadingContacts = true;
        try {
            // Fetch both Active transactions and History to get a complete contact list
            const [activeRes, historyRes] = await Promise.all([
                transaksiApi.getAll({ limit: 100 }),
                transaksiApi.getHistory({ limit: 100 }),
            ]);

            const uniqueContacts = new Map();

            const processTransaction = (t: Transaksi) => {
                // Check multiple possible phone fields just in case, though noWhatsapp is the standard
                const phone = t.noWhatsapp;
                if (phone && t.namaPenyewa && !uniqueContacts.has(phone)) {
                    uniqueContacts.set(phone, {
                        name: t.namaPenyewa,
                        phone: phone,
                        lastTx: t.createdAt,
                    });
                }
            };

            (activeRes.data || []).forEach(processTransaction);
            (historyRes.data || []).forEach(processTransaction);

            contacts = Array.from(uniqueContacts.values());
            filteredContacts = contacts;
        } catch (e) {
            console.error("Failed to load contacts", e);
        } finally {
            isLoadingContacts = false;
        }
    }

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) loadContacts();
    }

    function selectContact(contact: { name: string; phone: string }) {
        selectedContact = contact;
        // Strip non-numeric chars for display/sending logic if needed,
        // but assuming API handles generic formats or we clean it before send
        manualPhone = contact.phone;
    }

    function clearSelection() {
        selectedContact = null;
        manualPhone = "";
    }

    async function handleSend() {
        if (!manualPhone || !message) {
            toast.error("Please provide a phone number and message");
            return;
        }

        isSending = true;
        try {
            await whatsappApi.sendMessage(manualPhone, message);
            toast.success("Message sent successfully!");
            message = "";
            // Optional: Close or stay open?
        } catch (e) {
            console.error(e);
            toast.error("Failed to send message");
        } finally {
            isSending = false;
        }
    }

    $effect(() => {
        if (!searchQuery) {
            filteredContacts = contacts;
        } else {
            const q = searchQuery.toLowerCase();
            filteredContacts = contacts.filter(
                (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
            );
        }
    });
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
    {#if isOpen}
        <div
            transition:fly={{ y: 20, duration: 300 }}
            class="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[350px] md:w-[400px] overflow-hidden flex flex-col max-h-[600px]"
        >
            <!-- Header -->
            <div
                class="bg-primary px-4 py-3 flex items-center justify-between text-white shrink-0"
            >
                <div class="flex items-center gap-2">
                    <MessageSquare size={20} />
                    <span class="font-bold">WhatsApp Chat</span>
                </div>
                <button
                    onclick={toggleChat}
                    class="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
                <!-- Recipient Selector -->
                <div
                    class="p-4 bg-white border-b border-gray-100 space-y-3 shrink-0"
                >
                    <label
                        class="text-xs font-semibold text-gray-500 uppercase tracking-wider block"
                    >
                        To:
                    </label>

                    {#if selectedContact}
                        <div
                            class="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100"
                        >
                            <div
                                class="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0"
                            >
                                {selectedContact.name.charAt(0)}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p
                                    class="text-sm font-bold text-gray-900 truncate"
                                >
                                    {selectedContact.name}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {selectedContact.phone}
                                </p>
                            </div>
                            <button
                                onclick={clearSelection}
                                class="text-gray-400 hover:text-red-500 p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    {:else}
                        <!-- Search/Input Mode -->
                        <div class="relative">
                            <Search
                                class="absolute left-3 top-3 text-gray-400"
                                size={16}
                            />
                            <input
                                type="text"
                                bind:value={searchQuery}
                                placeholder="Search client..."
                                class="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                        </div>

                        <!-- Manual Input Fallback -->
                        <div class="flex flex-col gap-1 mt-2">
                            <span class="text-[10px] text-gray-400 text-right"
                                >Or type number manually below</span
                            >
                        </div>
                    {/if}

                    <!-- Manual Phone Input (Always visible/editable if not strictly selecting object) -->
                    {#if !selectedContact}
                        <div class="flex items-center gap-2">
                            <div
                                class="bg-gray-100 p-2 rounded-lg text-gray-500"
                            >
                                <Phone size={18} />
                            </div>
                            <input
                                type="text"
                                bind:value={manualPhone}
                                placeholder="e.g. 628123456789"
                                class="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                            />
                        </div>
                    {/if}
                </div>

                <!-- Contact List (Only if no contact selected) -->
                {#if !selectedContact}
                    <div class="flex-1 overflow-y-auto p-2">
                        <p
                            class="px-2 py-1 text-xs text-gray-400 font-medium sticky top-0 bg-gray-50 z-10"
                        >
                            Recent Contacts
                        </p>
                        {#if isLoadingContacts}
                            <div class="p-4 text-center">
                                <Loader2
                                    class="animate-spin mx-auto text-primary"
                                    size={20}
                                />
                            </div>
                        {:else}
                            <div class="space-y-1">
                                {#each filteredContacts as contact}
                                    <button
                                        onclick={() => selectContact(contact)}
                                        class="w-full text-left flex items-center gap-3 p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all group"
                                    >
                                        <div
                                            class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors"
                                        >
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p
                                                class="text-sm font-semibold text-gray-700"
                                            >
                                                {contact.name}
                                            </p>
                                            <p class="text-xs text-gray-500">
                                                {contact.phone}
                                            </p>
                                        </div>
                                        <div class="text-xs text-gray-300">
                                            <History size={14} />
                                        </div>
                                    </button>
                                {/each}
                                {#if filteredContacts.length === 0}
                                    <p
                                        class="text-center text-gray-400 text-sm py-4"
                                    >
                                        No contacts found
                                    </p>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}

                <!-- Message Input Area (Only if phone is set or contact selected) -->
                {#if selectedContact || manualPhone.length > 5}
                    <div
                        transition:fade
                        class="p-4 bg-white mt-auto border-t border-gray-100 flex flex-col gap-3"
                    >
                        <textarea
                            bind:value={message}
                            placeholder="Type a message..."
                            class="w-full bg-gray-50 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none resize-none h-24 border border-gray-200"
                        ></textarea>
                        <div class="flex justify-end">
                            <button
                                onclick={handleSend}
                                disabled={isSending || !message.trim()}
                                class="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                {#if isSending}
                                    <Loader2 size={18} class="animate-spin" />
                                    <span>Sending...</span>
                                {:else}
                                    <span>Send</span>
                                    <Send size={18} />
                                {/if}
                            </button>
                        </div>
                    </div>
                {/if}

                {#if !selectedContact && manualPhone.length <= 5}
                    <div
                        class="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center opacity-60"
                    >
                        <MessageSquare size={48} class="mb-2" />
                        <p class="text-sm">
                            Select a contact or enter a number to start chatting
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    <!-- FAB Trigger -->
    <button
        onclick={toggleChat}
        class="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
    >
        {#if isOpen}
            <X size={28} />
        {:else}
            <MessageSquare size={28} class="fill-current" />
        {/if}
    </button>
</div>
