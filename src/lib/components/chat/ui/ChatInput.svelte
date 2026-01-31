<script lang="ts">
    import { Paperclip, Send, Loader2, Image, MapPin, X } from "lucide-svelte";

    let {
        message = $bindable(""),
        isSending = $bindable(false),
        selectedFile = $bindable(null),
        showLocationPicker = $bindable(false),
        locationLatitude = $bindable(""),
        locationLongitude = $bindable(""),
        replyMessage = null,
        onSend = () => {},
        onSendSticker = (file: File) => {},
        onSendContact = (name: string, number: string) => {},
        onCancelReply = () => {},
        onTyping = (isTyping: boolean) => {},
    } = $props<{
        message: string;
        isSending: boolean;
        selectedFile: File | null;
        showLocationPicker: boolean;
        locationLatitude: string;
        locationLongitude: string;
        replyMessage?: any;
        onSend: () => void;
        onSendSticker?: (file: File) => void;
        onSendContact?: (name: string, number: string) => void;
        onCancelReply?: () => void;
        onTyping?: (isTyping: boolean) => void;
    }>();

    import { Smile, UserPlus } from "lucide-svelte";
    let isSticker = $state(false);
    let showContactForm = $state(false);
    let contactName = $state("");
    let contactNumber = $state("");

    let fileInput: HTMLInputElement;
    let typingTimeout: any;

    function handleFile(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files?.length) {
            selectedFile = target.files[0];
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
        handleTyping();
    }

    function handleTyping() {
        if (onTyping) {
            onTyping(true);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                onTyping && onTyping(false);
            }, 2000);
        }
    }
</script>

<div
    class="p-3 bg-bg-secondary border-t border-border/10 shrink-0 relative z-20"
>
    <!-- Reply Preview Panel -->
    {#if replyMessage}
        <div
            class="flex items-center justify-between p-2 mb-2 bg-bg-tertiary border-l-4 border-primary rounded-r-lg shadow-sm animate-in slide-in-from-bottom-2 fade-in"
        >
            <div class="flex-1 min-w-0 ml-1">
                <div class="text-xs font-bold text-primary mb-0.5">
                    Membalas {replyMessage.fromMe
                        ? "Anda"
                        : replyMessage.sender?.pushname || "Kontak"}
                </div>
                <div class="text-xs text-text-muted truncate">
                    {replyMessage.body ||
                        (replyMessage.type === "image" ? "📷 Foto" : "Pesan")}
                </div>
            </div>
            <button
                onclick={onCancelReply}
                class="p-1 hover:bg-black/5 rounded-full text-text-muted transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    {/if}

    <!-- File Preview Panel -->
    {#if selectedFile}
        <div
            class="flex items-center justify-between p-3 mb-2 bg-primary/10 rounded-xl border border-primary/20 animate-in slide-in-from-bottom-2"
        >
            <div class="flex items-center gap-3 overflow-hidden">
                <div
                    class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0"
                >
                    {#if selectedFile.type.startsWith("image/")}
                        <Image size={20} class="text-primary" />
                    {:else}
                        <Paperclip size={20} class="text-primary" />
                    {/if}
                </div>
                <div class="min-w-0">
                    <p class="text-sm font-medium text-text-primary truncate">
                        {selectedFile.name}
                    </p>
                    <p class="text-xs text-text-muted">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                {#if selectedFile.type.startsWith("image/")}
                    <button
                        onclick={() => (isSticker = !isSticker)}
                        class="px-2 py-1 text-[10px] uppercase font-bold rounded-lg transition-all
                        {isSticker
                            ? 'bg-primary text-white'
                            : 'bg-primary/20 text-primary'}"
                    >
                        {isSticker ? "Kirim Sticker" : "Kirim Gambar"}
                    </button>
                {/if}
                <button
                    onclick={() => {
                        selectedFile = null;
                        isSticker = false;
                    }}
                    class="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-full text-text-muted transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    {/if}

    <!-- Location Picker Toggle (Simple) -->
    {#if showLocationPicker}
        <div
            class="bg-bg-tertiary p-3 rounded-xl mb-2 border border-border/10 space-y-2"
        >
            <div
                class="flex items-center justify-between text-xs font-bold text-text-muted uppercase tracking-wider"
            >
                <span>Kirim Lokasi</span>
                <button onclick={() => (showLocationPicker = false)}
                    ><X size={14} /></button
                >
            </div>
            <div class="grid grid-cols-2 gap-2">
                <input
                    type="text"
                    bind:value={locationLatitude}
                    placeholder="Latitude"
                    class="bg-bg-secondary rounded-lg px-3 py-2 text-xs outline-none border focus:border-primary/50"
                />
                <input
                    type="text"
                    bind:value={locationLongitude}
                    placeholder="Longitude"
                    class="bg-bg-secondary rounded-lg px-3 py-2 text-xs outline-none border focus:border-primary/50"
                />
            </div>
        </div>
    {/if}

    <!-- Contact Form -->
    {#if showContactForm}
        <div
            class="bg-bg-tertiary p-3 rounded-xl mb-2 border border-border/10 space-y-2"
        >
            <div
                class="flex items-center justify-between text-xs font-bold text-text-muted uppercase tracking-wider"
            >
                <span>Kirim Kontak</span>
                <button onclick={() => (showContactForm = false)}
                    ><X size={14} /></button
                >
            </div>
            <div class="grid grid-cols-2 gap-2">
                <input
                    type="text"
                    bind:value={contactName}
                    placeholder="Nama"
                    class="bg-bg-secondary rounded-lg px-3 py-2 text-xs outline-none border focus:border-primary/50"
                />
                <input
                    type="text"
                    bind:value={contactNumber}
                    placeholder="Nomor (e.g. 628...)"
                    class="bg-bg-secondary rounded-lg px-3 py-2 text-xs outline-none border focus:border-primary/50"
                />
            </div>
            <button
                onclick={() => {
                    if (contactName && contactNumber && onSendContact) {
                        onSendContact(contactName, contactNumber);
                        showContactForm = false;
                        contactName = "";
                        contactNumber = "";
                    }
                }}
                class="w-full py-1.5 bg-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/30 transition-colors"
            >
                Kirim VCard
            </button>
        </div>
    {/if}

    <!-- Input Bar -->
    <div class="flex items-end gap-2">
        <div class="flex gap-1 pb-1">
            <button
                onclick={() => fileInput.click()}
                class="p-2.5 text-text-muted hover:text-primary hover:bg-bg-tertiary rounded-full transition-all"
                title="Lampirkan File"
            >
                <Paperclip size={20} />
            </button>
            <button
                onclick={() => (showLocationPicker = !showLocationPicker)}
                class="p-2.5 text-text-muted hover:text-red-500 hover:bg-bg-tertiary rounded-full transition-all"
                title="Kirim Lokasi"
            >
                <MapPin size={20} />
            </button>
            <button
                onclick={() => (showContactForm = !showContactForm)}
                class="p-2.5 text-text-muted hover:text-blue-500 hover:bg-bg-tertiary rounded-full transition-all"
                title="Kirim Kontak"
            >
                <UserPlus size={20} />
            </button>
        </div>

        <div
            class="flex-1 bg-bg-tertiary rounded-2xl flex items-center px-4 py-2 border border-transparent focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all"
        >
            <textarea
                bind:value={message}
                oninput={handleTyping}
                onkeydown={handleKeyDown}
                placeholder="Ketik pesan..."
                rows="1"
                class="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted resize-none max-h-32 py-2"
                style="min-height: 24px;"
            ></textarea>
        </div>

        <button
            onclick={() => {
                if (isSticker && selectedFile && onSendSticker) {
                    onSendSticker(selectedFile);
                    isSticker = false;
                } else {
                    onSend();
                }
            }}
            disabled={(!message && !selectedFile && !showLocationPicker) ||
                isSending}
            class="p-3 rounded-full shadow-lg transition-all duration-200
                {!message && !selectedFile && !showLocationPicker
                ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                : 'bg-primary text-white hover:scale-105 active:scale-95'}"
        >
            {#if isSending}
                <Loader2 size={20} class="animate-spin" />
            {:else}
                <Send size={20} class={message ? "ml-0.5" : ""} />
            {/if}
        </button>
    </div>

    <input
        bind:this={fileInput}
        type="file"
        class="hidden"
        onchange={handleFile}
    />
</div>
