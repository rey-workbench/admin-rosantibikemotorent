<script lang="ts">
    import { Search, Send, User, Check, CheckCheck } from "lucide-svelte";

    // Props
    let {
        contacts = [],
        onSelect = (contact: any) => {},
        onNewContact = () => {},
    } = $props<{
        contacts: any[];
        onSelect: (contact: any) => void;
        onNewContact: () => void;
    }>();

    let searchQuery = $state("");
    let filteredContacts = $state(contacts);

    $effect(() => {
        if (!searchQuery) {
            filteredContacts = contacts;
        } else {
            const q = searchQuery.toLowerCase();
            filteredContacts = contacts.filter(
                (c: any) =>
                    (c.name && c.name.toLowerCase().includes(q)) ||
                    (c.phone && c.phone.includes(q)) ||
                    (c.id && c.id._serialized && c.id._serialized.includes(q)),
            );
        }
    });

    function getInitials(name: string) {
        return name ? name.charAt(0).toUpperCase() : "?";
    }

    function formatTime(timestamp: number) {
        if (!timestamp) return "";
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else {
            return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
            }); // e.g. 1 Feb
        }
    }
</script>

<div class="flex-1 flex flex-col h-full overflow-hidden bg-bg-secondary">
    <!-- Header / New Contact Actions -->
    <div
        class="p-3 shrink-0 flex items-center justify-between border-b border-border/10 bg-bg-secondary"
    >
        <div class="relative flex-1 mr-2">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={16}
            />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Cari atau mulai chat baru"
                class="w-full bg-bg-tertiary rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30 transition-all text-text-primary placeholder:text-text-muted/70"
            />
        </div>
        <button
            onclick={onNewContact}
            class="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
            title="Chat Baru"
        >
            <Send size={20} />
        </button>
    </div>

    <!-- Chat List -->
    <div
        class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin hover:scrollbar-thumb-gray-300"
    >
        {#if filteredContacts.length > 0}
            {#each filteredContacts as contact}
                <button
                    onclick={() => onSelect(contact)}
                    class="w-full relative flex items-center gap-3 p-3 hover:bg-bg-tertiary transition-colors border-b border-border/5 text-left group"
                >
                    <!-- Avatar -->
                    <div class="relative shrink-0">
                        <div
                            class="w-12 h-12 rounded-full {contact.avatarColor ||
                                'bg-gray-300'} flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                        >
                            {#if contact.profilePicUrl}
                                <img
                                    src={contact.profilePicUrl}
                                    alt=""
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                {getInitials(
                                    contact.name || contact.phone || "?",
                                )}
                            {/if}
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0 flex flex-col justify-center">
                        <div class="flex items-baseline justify-between mb-0.5">
                            <h4
                                class="text-base font-medium text-text-primary truncate max-w-[70%]"
                            >
                                {contact.name ||
                                    contact.phone ||
                                    "Tidak Diketahui"}
                            </h4>
                            {#if contact.lastMessageTime}
                                <span
                                    class="text-[11px] {contact.unreadCount > 0
                                        ? 'text-green-500 font-semibold'
                                        : 'text-text-muted'} shrink-0"
                                >
                                    {formatTime(contact.lastMessageTime)}
                                </span>
                            {/if}
                        </div>

                        <div class="flex items-center justify-between">
                            <div
                                class="flex items-center gap-1 text-sm text-text-secondary truncate max-w-[85%] pr-2"
                            >
                                {#if contact.lastMessageFromMe}
                                    <span class="text-blue-500 shrink-0">
                                        {#if contact.lastMessageStatus === "read"}
                                            <CheckCheck size={14} />
                                        {:else}
                                            <Check size={14} />
                                        {/if}
                                    </span>
                                {/if}
                                {#if contact.typing}
                                    <span class="text-green-500 italic text-xs"
                                        >sedang mengetik...</span
                                    >
                                {:else}
                                    <span class="truncate"
                                        >{contact.lastMessagePreview ||
                                            "Tidak ada pesan"}</span
                                    >
                                {/if}
                            </div>

                            {#if contact.unreadCount > 0}
                                <div
                                    class="bg-green-500 text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1.5 rounded-full flex items-center justify-center shrink-0"
                                >
                                    {contact.unreadCount}
                                </div>
                            {/if}
                        </div>
                    </div>
                </button>
            {/each}
        {:else}
            <div
                class="flex flex-col items-center justify-center py-12 px-4 text-center text-text-muted"
            >
                <p class="text-sm">Tidak ada kontak ditemukan</p>
            </div>
        {/if}
    </div>
</div>
