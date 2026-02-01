<script lang="ts">
    import { MessageSquare, X } from "lucide-svelte";
    import { onMount, onDestroy } from "svelte";
    import { transaksiApi, whatsappApi } from "$lib/api";
    import { toast } from "$lib/stores/toast";
    import { fade, fly, slide } from "svelte/transition";
    import websocketService from "$lib/api/websocket";

    // UI Components
    import ChatHeader from "./ui/ChatHeader.svelte";
    import ChatInput from "./ui/ChatInput.svelte";
    import MessageList from "./ui/MessageList.svelte";
    import ContactList from "./ui/ContactList.svelte";

    // --- State ---
    let isOpen = $state(false);
    let isFullscreen = $state(false);
    let contacts = $state<any[]>([]);
    let chatMessages = $state<any[]>([]);
    let currentView = $state<"main" | "chat-detail">("main");
    let selectedContact = $state<any>(null);
    let message = $state("");
    let isSending = $state(false);
    let isLoadingMessages = $state(false);
    let replyMessage = $state<any>(null);
    let sessionStatus = $state<string>("disconnected");
    let sessionStatusMessage = $state<string>("");
    let qrCode = $state<string | null>(null);

    // Media/Location State
    let selectedFile = $state<File | null>(null);
    let showLocationPicker = $state(false);
    let locationLatitude = $state("");
    let locationLongitude = $state("");

    // --- WebSocket ---
    let unsubscribes: (() => void)[] = [];

    function setupWebSocket() {
        // Updated logic: combine listeners or use a cleaner approach
        unsubscribes.push(
            websocketService.onWhatsAppMessageSent((data) => {
                const targetId =
                    selectedContact?.id?._serialized || selectedContact?.phone;
                if (targetId && data.chatId?.includes(targetId.split("@")[0])) {
                    // Update optimistic message with real ID and status
                    // Find the optimistic message (assuming it's the last one with a temp id or we match body)
                    const index = chatMessages.findIndex(
                        (m) =>
                            m.id._serialized.startsWith("temp_") &&
                            m.body === data.body,
                    );
                    if (index !== -1) {
                        const updated = { ...chatMessages[index] };
                        updated.id = {
                            _serialized: data.messageId,
                            fromMe: true,
                            user: data.chatId.split("@")[0],
                        };
                        updated.ack = 1; // Sent
                        updated.t = Math.floor(Date.now() / 1000);
                        chatMessages[index] = updated;
                    } else {
                    }
                    loadContacts();
                }
            }),
            websocketService.onWhatsAppMessage((data) => {
                const fromId = data.from?.split("@")[0];
                const selectedId = selectedContact?.phone;

                // If message is for current chat, append it
                if (selectedId && fromId === selectedId) {
                    // Avoid duplicates
                    if (
                        !chatMessages.some(
                            (m) => m.id._serialized === data.id._serialized,
                        )
                    ) {
                        chatMessages = [...chatMessages, data];
                        whatsappApi.sendSeen(data.from);
                    }
                }

                if (data.type === "incoming") {
                    loadContacts();
                    if (!isOpen)
                        toast.info(`Pesan dari ${data.notifyName || fromId}`);
                }
            }),
            websocketService.onWhatsAppStatus((data) => {
                sessionStatus = data.connectionStatus;
                sessionStatusMessage = data.message || "";
                if (data.connectionStatus === "disconnected") {
                    toast.warning("WhatsApp Terputus");
                }
            }),
            websocketService.onWhatsAppQrCode((data) => {
                qrCode = data.qrCode;
                if (qrCode) sessionStatus = "connecting";
            }),
        );
    }

    // --- Lifecycle ---
    onMount(async () => {
        websocketService.connect();
        setupWebSocket();
        if (isOpen) {
            loadContacts();
            const status = await whatsappApi.getStatus();
            sessionStatus = status.status;
            if (status.qrCode) qrCode = status.qrCode;
        }
    });

    onDestroy(() => unsubscribes.forEach((un) => un()));

    // --- Actions ---
    async function loadContacts() {
        try {
            const [chats, activeRes] = await Promise.all([
                whatsappApi.getChats(),
                transaksiApi.getAll({ limit: 500 }),
            ]);

            const customerMap = new Map();
            (activeRes.data || []).forEach((t: any) => {
                if (t.noWhatsapp) customerMap.set(t.noWhatsapp, t.namaPenyewa);
            });

            contacts = chats
                .filter((chat: any) => chat.id.user !== "0") // Filter "ghost" numbers
                .map((chat: any) => {
                    const phone = chat.id.user;
                    const dbName =
                        customerMap.get(phone) ||
                        customerMap.get("0" + phone.slice(2)) ||
                        customerMap.get("62" + phone.slice(1));

                    // Priority: Saved Contact Name (WA) > Database Name > Pushname > Formatted Name > Phone
                    const name =
                        chat.contact?.name ||
                        dbName ||
                        chat.name ||
                        chat.contact?.pushname ||
                        chat.contact?.formattedName ||
                        phone;

                    return {
                        ...chat,
                        phone,
                        name,
                        profilePicUrl:
                            chat.contact?.profilePicThumbObj?.img ||
                            chat.contact?.profilePicThumbObj?.eurl,
                        avatarColor: `bg-slate-${(phone.slice(-1) % 6) * 100 + 400}`, // Simple deterministic color
                        lastMessagePreview: chat.typing
                            ? "Sedang mengetik..."
                            : chat.lastMessage?.body ||
                              chat.lastMessage?.type ||
                              "",
                        lastMessageTime: chat.t,
                        lastMessageFromMe: chat.lastMessage?.fromMe,
                        lastMessageStatus:
                            chat.lastMessage?.ack >= 3 ? "read" : "sent",
                    };
                });
        } catch (e) {
            console.error(e);
        }
    }

    async function loadMessages(phone: string, isBackground = false) {
        if (!isBackground) isLoadingMessages = true;
        try {
            const res = await whatsappApi.getMessages(phone);
            chatMessages = Array.isArray(res) ? res : (res as any).data || [];
            await whatsappApi.sendSeen(phone);
        } catch (e) {
            console.error(e);
        } finally {
            if (!isBackground) isLoadingMessages = false;
        }
    }

    async function handleSend() {
        if (
            !selectedContact?.phone ||
            (!message && !selectedFile && !showLocationPicker)
        )
            return;

        const currentMessage = message;
        const currentFile = selectedFile;
        // Optimistic UI Update
        const tempId = "temp_" + Date.now();
        const optimisticMsg = {
            id: { _serialized: tempId, fromMe: true },
            body: currentMessage,
            type: currentFile
                ? currentFile.type.startsWith("image")
                    ? "image"
                    : "document"
                : "chat",
            t: Math.floor(Date.now() / 1000),
            fromMe: true,
            ack: 0, // clock
            timestamp: Math.floor(Date.now() / 1000),
        };

        if (currentFile && currentFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                optimisticMsg.body = e.target?.result as string;
                chatMessages = [...chatMessages, optimisticMsg];
            };
            reader.readAsDataURL(currentFile);
        } else {
            chatMessages = [...chatMessages, optimisticMsg];
        }

        isSending = true;
        try {
            const to = selectedContact.phone;
            if (showLocationPicker && locationLatitude && locationLongitude) {
                await whatsappApi.sendLocation(
                    to,
                    locationLatitude,
                    locationLongitude,
                    "",
                );
                showLocationPicker = false;
            } else if (selectedFile) {
                const base64 = await new Promise<string>((r) => {
                    const reader = new FileReader();
                    reader.onload = () => r(reader.result as string);
                    reader.readAsDataURL(selectedFile!);
                });
                selectedFile.type.startsWith("image/")
                    ? await whatsappApi.sendImage(to, base64, message)
                    : await whatsappApi.sendFile(
                          to,
                          base64,
                          selectedFile.name,
                          message,
                      );
                selectedFile = null;
            } else if (message) {
                const rawId = replyMessage?.id;
                const replyId =
                    typeof rawId === "object"
                        ? rawId?._serialized
                        : typeof rawId === "string"
                          ? rawId
                          : null;

                replyId
                    ? await whatsappApi.reply(to, message, replyId)
                    : await whatsappApi.sendMessage(to, message);
            }
            message = "";
            replyMessage = null;

            // Background refresh to get real ID and status
            loadContacts();
            // Don't full reload messages to avoid flicker, just wait for socket or do background
            // loadMessages(to, true);
        } catch (e) {
            toast.error("Gagal mengirim");
            // Remove optimistic message on failure?
            chatMessages = chatMessages.filter(
                (m) => m.id._serialized !== tempId,
            );
        } finally {
            isSending = false;
        }
    }

    async function handleSendSticker(file: File) {
        if (!selectedContact?.phone) return;
        isSending = true;
        try {
            const to = selectedContact.phone;
            const base64 = await new Promise<string>((r) => {
                const reader = new FileReader();
                reader.onload = () => r(reader.result as string);
                reader.readAsDataURL(file);
            });
            await whatsappApi.sendImageAsSticker(to, base64);
            toast.success("Sticker terkirim");
        } catch (e) {
            toast.error("Gagal mengirim sticker");
        } finally {
            isSending = false;
        }
    }

    async function handleSendContact(name: string, number: string) {
        if (!selectedContact?.phone) return;
        isSending = true;
        try {
            const to = selectedContact.phone;
            await whatsappApi.sendContactVcard(to, number, name);
            toast.success("Kontak terkirim");
        } catch (e) {
            toast.error("Gagal mengirim kontak");
        } finally {
            isSending = false;
        }
    }

    async function handleLogout() {
        if (!confirm("Yakin ingin logout dari WhatsApp?")) return;
        try {
            await whatsappApi.logout();
            toast.success("Berhasil logout");
            isOpen = false;
        } catch (e) {
            toast.error("Gagal logout");
        }
    }

    async function handleReset() {
        if (!confirm("Reset koneksi WhatsApp? Ini akan membersihkan sesi."))
            return;
        try {
            await whatsappApi.resetSession();
            toast.success("Sesi sedang direset...");
            loadContacts();
        } catch (e) {
            toast.error("Gagal reset");
        }
    }

    // New Chat Modal State
    let showNewChatModal = $state(false);
    let newChatPhone = $state("");

    function handleDirectMessage() {
        showNewChatModal = true;
        newChatPhone = "";
        // Focus logic could go here depending on implementation
    }

    async function submitNewChat() {
        if (!newChatPhone) return;

        let phone = newChatPhone.replace(/\D/g, "");

        if (phone.startsWith("08")) {
            phone = "62" + phone.slice(1);
        }

        if (phone.length < 10) {
            toast.error("Nomor telepon tidak valid");
            return;
        }

        // Create temp contact
        const newContact = {
            id: { _serialized: `${phone}@c.us`, user: phone },
            phone: phone,
            name: phone,
            avatarColor: `bg-slate-${(parseInt(phone.slice(-1)) % 6) * 100 + 400}`,
            lastMessageTime: Date.now() / 1000,
            unreadCount: 0,
        };

        selectedContact = newContact;
        currentView = "chat-detail";
        showNewChatModal = false;
        loadMessages(phone);
    }
</script>

<div
    class="chat-widget fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans"
>
    {#if isOpen}
        <div
            transition:fly={{ y: 20, duration: 300 }}
            class="bg-bg-secondary shadow-2xl overflow-hidden flex flex-col transition-all border border-border/50
             {isFullscreen
                ? 'fixed inset-4 rounded-3xl'
                : 'w-[400px] h-[700px] max-h-[calc(100vh-6rem)] rounded-3xl'}"
        >
            <div class="flex-1 relative flex flex-col overflow-hidden">
                <!-- New Chat Modal Overlay -->
                {#if showNewChatModal}
                    <div
                        class="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-6"
                        transition:fade={{ duration: 150 }}
                    >
                        <div
                            class="bg-bg-secondary w-full max-w-sm rounded-2xl shadow-xl p-6 border border-border/20"
                            transition:fly={{ y: 20, duration: 200 }}
                        >
                            <h3
                                class="text-lg font-bold text-text-primary mb-2"
                            >
                                Mulai Chat Baru
                            </h3>
                            <p class="text-sm text-text-muted mb-4">
                                Masukkan nomor WhatsApp tujuan (contoh:
                                08123456789)
                            </p>

                            <input
                                type="tel"
                                bind:value={newChatPhone}
                                class="w-full bg-bg-tertiary border border-border/10 rounded-xl px-4 py-3 text-text-primary mb-4 focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="Nomor Telepon..."
                                autofocus
                            />

                            <div class="flex gap-3 justify-end">
                                <button
                                    class="px-4 py-2 rounded-lg text-text-muted hover:bg-bg-tertiary font-medium transition-colors"
                                    onclick={() => (showNewChatModal = false)}
                                >
                                    Batal
                                </button>
                                <button
                                    class="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
                                    onclick={submitNewChat}
                                >
                                    Mulai Chat
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}

                {#if currentView === "chat-detail"}
                    <div
                        class="flex-1 flex flex-col h-full bg-bg-secondary"
                        transition:slide={{ axis: "x", duration: 300 }}
                    >
                        <ChatHeader
                            title={selectedContact.name}
                            {isFullscreen}
                            {sessionStatus}
                            showBack={true}
                            contact={selectedContact}
                            onBack={() => {
                                currentView = "main";
                                selectedContact = null;
                            }}
                            onToggleFullscreen={() =>
                                (isFullscreen = !isFullscreen)}
                            onClose={() => (isOpen = false)}
                            onLogout={handleLogout}
                            onReset={handleReset}
                        />
                        <MessageList
                            messages={chatMessages}
                            isLoading={isLoadingMessages}
                            {selectedContact}
                            onReply={(m) => (replyMessage = m)}
                        />
                        <ChatInput
                            bind:message
                            bind:isSending
                            bind:selectedFile
                            bind:showLocationPicker
                            bind:locationLatitude
                            bind:locationLongitude
                            {replyMessage}
                            onSend={handleSend}
                            onSendSticker={handleSendSticker}
                            onSendContact={handleSendContact}
                            onCancelReply={() => (replyMessage = null)}
                            onTyping={(t) =>
                                t
                                    ? whatsappApi.startTyping(
                                          selectedContact.phone,
                                      )
                                    : whatsappApi.stopTyping(
                                          selectedContact.phone,
                                      )}
                        />
                    </div>
                {:else}
                    <div
                        class="flex-1 flex flex-col h-full bg-bg-secondary"
                        in:fade
                    >
                        <ChatHeader
                            title="WhatsApp Admin"
                            {isFullscreen}
                            {sessionStatus}
                            onToggleFullscreen={() =>
                                (isFullscreen = !isFullscreen)}
                            onClose={() => (isOpen = false)}
                            onLogout={handleLogout}
                            onReset={handleReset}
                        />
                        {#if sessionStatus !== "connected" && qrCode}
                            <div
                                class="absolute inset-0 bg-white/95 dark:bg-bg-secondary/95 z-[100] flex flex-col items-center justify-center p-8 text-center"
                                transition:fade
                            >
                                <div
                                    class="bg-white p-4 rounded-3xl shadow-2xl mb-6"
                                >
                                    <img
                                        src={qrCode}
                                        alt="WhatsApp QR Code"
                                        class="w-64 h-64"
                                    />
                                </div>
                                <h3
                                    class="text-xl font-bold text-text-primary mb-2"
                                >
                                    Scan QR Code
                                </h3>
                                <p class="text-sm text-text-muted max-w-xs">
                                    Buka WhatsApp di ponsel Anda, bukax
                                    Pengaturan > Perangkat Tertaut, dan scan
                                    kode ini.
                                </p>
                            </div>
                        {/if}
                        <ContactList
                            {contacts}
                            onSelect={(c) => {
                                selectedContact = c;
                                currentView = "chat-detail";
                                loadMessages(c.phone);
                            }}
                            onNewContact={() =>
                                document
                                    .querySelector<HTMLInputElement>(
                                        'input[placeholder*="Cari"]',
                                    )
                                    ?.focus()}
                            onDirectMessage={handleDirectMessage}
                        />
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    <button
        onclick={() => {
            isOpen = !isOpen;
            if (isOpen) loadContacts();
        }}
        class="w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-50
            {isOpen
            ? 'bg-bg-secondary text-text-primary rotate-90'
            : 'bg-[#25D366] text-white hover:rotate-12'}"
    >
        {#if isOpen}
            <X size={26} />
        {:else}
            <MessageSquare size={28} class="fill-current" />
            <span
                class="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"
            ></span>
        {/if}
    </button>
</div>
