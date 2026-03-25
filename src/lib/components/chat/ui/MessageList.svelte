<script lang="ts">
    import {
        MessageSquare,
        Loader2,
        MapPin,
        Reply,
        Check,
        CheckCheck,
        FileText,
        Play,
        Image,
    } from "lucide-svelte";

    let {
        messages = [],
        isLoading = false,
        currentUser = null,
        selectedContact = null,
        onReply = (msg: any) => {},
    } = $props<{
        messages: any[];
        isLoading?: boolean;
        currentUser?: any;
        selectedContact?: { name?: string; avatarColor?: string } | null;
        onReply?: (msg: any) => void;
    }>();

    // Helper to get initials
    function getInitials(name: string) {
        return name ? name.charAt(0).toUpperCase() : "?";
    }

    // Format time
    function formatTime(timestamp: number) {
        if (!timestamp) return "";
        return new Date(timestamp * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // Scroll to bottom effect
    let container: HTMLDivElement;
    $effect(() => {
        if (messages && container) {
            requestAnimationFrame(() => {
                if (container) container.scrollTop = container.scrollHeight;
            });
        }
    });

    function isSameDay(t1: number, t2: number) {
        const d1 = new Date(t1 * 1000);
        const d2 = new Date(t2 * 1000);
        return d1.toDateString() === d2.toDateString();
    }
</script>

<div
    bind:this={container}
    class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-bg-secondary bg-opacity-95"
    style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-blend-mode: overlay;"
>
    <!-- System Message Start -->
    <div class="text-center my-4">
        <span
            class="text-xs font-medium text-text-muted bg-bg-tertiary px-3 py-1 rounded-full shadow-sm border border-border/10"
        >
            {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })}
        </span>
    </div>

    <!-- Messages List -->
    {#if isLoading}
        <div
            class="flex flex-col items-center justify-center py-10 gap-3 opacity-50"
        >
            <Loader2 class="animate-spin text-primary" size={32} />
            <p class="text-xs">Memuat pesan...</p>
        </div>
    {:else if messages.length > 0}
        {#each messages as msg, i}
            <!-- Day Separator Logic could be here based on i > 0 -->

            <div
                class="flex {msg.fromMe
                    ? 'justify-end'
                    : 'items-start'} gap-2 group mb-1"
            >
                <!-- Avatar for Receiver -->
                {#if !msg.fromMe}
                    <!-- Show avatar only if next message is not from same person or last message (optional refined logic) -->
                    <div
                        class="w-7 h-7 mt-1 rounded-full {selectedContact?.avatarColor ||
                            'bg-gray-400'} flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden shadow-sm"
                    >
                        {getInitials(selectedContact?.name || "")}
                    </div>
                {/if}

                <div
                    class="flex flex-col max-w-[75%] {msg.fromMe
                        ? 'items-end'
                        : 'items-start'}"
                >
                    <!-- Bubble -->
                    <div
                        class="relative px-2 py-1.5 shadow-sm
                        {msg.type === 'sticker'
                            ? 'bg-transparent shadow-none'
                            : msg.fromMe
                              ? 'bg-[#d9fdd3] dark:bg-primary/20 rounded-l-lg rounded-tr-none rounded-br-lg'
                              : 'bg-white dark:bg-bg-tertiary rounded-r-lg rounded-tl-none rounded-bl-lg'} 
                        text-sm text-text-primary border border-transparent"
                        class:hover:shadow-md={msg.type !== "sticker"}
                        role="group"
                    >
                        <!-- Reply Button Context on Hover -->
                        <button
                            onclick={() => onReply(msg)}
                            class="absolute top-0 {msg.fromMe
                                ? '-left-8'
                                : '-right-8'} p-1 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary bg-bg-secondary rounded-full shadow-sm z-10"
                            title="Reply"
                        >
                            <Reply size={14} />
                        </button>

                        <!-- Quoted Message (Reply Context) -->
                        {#if msg.quotedMsg}
                            <div
                                class="mb-1 p-1 pl-2 border-l-4 border-primary/50 bg-black/5 dark:bg-white/5 rounded text-xs cursor-pointer overflow-hidden"
                            >
                                <div class="font-bold text-primary text-[10px]">
                                    {msg.quotedMsg.fromMe
                                        ? "Anda"
                                        : selectedContact?.name || "Kontak"}
                                </div>
                                <div class="truncate text-text-muted/80 flex items-center gap-1">
                                    {#if !msg.quotedMsg.body && msg.quotedMsg.type === "image"}
                                        <Image size={10} />
                                    {/if}
                                    {msg.quotedMsg.body ||
                                        (msg.quotedMsg.type === "image"
                                            ? "Foto"
                                            : "Pesan")}
                                </div>
                            </div>
                        {/if}

                        <!-- CONTENT -->
                        {#if msg.type === "image" || msg.type === "video"}
                            <div
                                class="mb-1 rounded-lg overflow-hidden bg-black/10 min-w-[200px] min-h-[150px] flex items-center justify-center relative"
                            >
                                {#if msg.body && msg.body.startsWith("data:")}
                                    <img
                                        src={msg.body}
                                        alt="Media content"
                                        class="max-w-full max-h-[300px] object-cover"
                                    />
                                    {#if msg.type === "video"}
                                        <div
                                            class="absolute inset-0 flex items-center justify-center bg-black/30"
                                        >
                                            <Play
                                                size={32}
                                                class="text-white fill-current"
                                            />
                                        </div>
                                    {/if}
                                {:else}
                                    <div
                                        class="p-4 text-center text-xs text-text-muted"
                                    >
                                        Media tidak dpt dimuat
                                    </div>
                                {/if}
                            </div>
                        {:else if msg.type === "sticker"}
                            {#if msg.body && msg.body.startsWith("data:")}
                                <img
                                    src={msg.body}
                                    alt="Sticker content"
                                    class="w-32 h-32 object-contain drop-shadow-sm"
                                />
                            {:else}
                                <div
                                    class="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg text-xs"
                                >
                                    Sticker
                                </div>
                            {/if}
                        {:else if msg.type === "location"}
                            <div class="flex items-center gap-2 mb-1">
                                <MapPin size={16} class="text-red-500" />
                                <span class="font-bold">Lokasi</span>
                            </div>
                            <a
                                href={`https://www.google.com/maps?q=${msg.lat},${msg.lng}`}
                                target="_blank"
                                class="text-xs text-blue-500 underline block mb-1"
                            >
                                Buka di Google Maps
                            </a>
                        {:else if msg.type === "document"}
                            <div
                                class="flex items-center gap-3 p-2 bg-black/5 rounded-lg border border-black/5"
                            >
                                <div
                                    class="bg-red-100 p-2 rounded text-red-500"
                                >
                                    <FileText size={20} />
                                </div>
                                <div class="overflow-hidden">
                                    <div class="truncate font-medium text-xs">
                                        {msg.filename ||
                                            msg.caption ||
                                            "Dokumen"}
                                    </div>
                                    <div
                                        class="text-[10px] text-text-muted uppercase"
                                    >
                                        {msg.mimetype?.split("/")[1] || "PDF"}
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <!-- Text Body & Caption -->
                        {#if (msg.body && msg.type !== "image" && msg.type !== "video" && msg.type !== "sticker") || msg.caption}
                            <p
                                class="whitespace-pre-wrap leading-tight wrap-break-word {msg
                                    .body?.length < 50
                                    ? 'text-sm'
                                    : 'text-[13px]'}"
                            >
                                {msg.caption ||
                                    msg.body ||
                                    (typeof msg.text === "string"
                                        ? msg.text
                                        : "")}
                            </p>
                        {/if}

                        <!-- Metadata (Time & Status) -->
                        <div
                            class="flex items-center justify-end gap-1 mt-1 select-none float-right ml-2"
                        >
                            <span class="text-[10px] text-text-muted/80">
                                {formatTime(msg.timestamp || msg.t)}
                            </span>
                            {#if msg.fromMe && msg.type !== "sticker"}
                                <span
                                    class={msg.ack >= 3
                                        ? "text-blue-500"
                                        : "text-text-muted/70"}
                                >
                                    {#if msg.ack >= 2}
                                        <CheckCheck size={14} />
                                    {:else}
                                        <Check size={14} />
                                    {/if}
                                </span>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    {:else}
        <div
            class="flex flex-col items-center justify-center py-12 opacity-30 gap-2 h-full"
        >
            <MessageSquare size={48} strokeWidth={1} />
            <p class="text-sm font-medium">Belum ada pesan</p>
            <p class="text-xs">Ucapkan halo untuk memulai percakapan</p>
        </div>
    {/if}
</div>
