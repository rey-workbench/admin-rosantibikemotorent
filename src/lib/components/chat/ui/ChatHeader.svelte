<script lang="ts">
    import { ChevronLeft, Maximize2, Minimize2, X } from "lucide-svelte";

    let {
        title,
        isFullscreen,
        showBack = false,
        onBack = () => {},
        onToggleFullscreen = () => {},
        onClose = () => {},
        onLogout = () => {},
        onReset = () => {},
        contact,
        sessionStatus = "disconnected",
    } = $props<{
        title: string;
        isFullscreen: boolean;
        showBack?: boolean;
        contact?: any;
        sessionStatus?: string;
        onBack?: () => void;
        onToggleFullscreen?: () => void;
        onClose?: () => void;
        onLogout?: () => void;
        onReset?: () => void;
    }>();

    import { RefreshCw, LogOut, MoreVertical } from "lucide-svelte";
    let showMenu = $state(false);
</script>

<div
    class="px-6 py-4 flex items-center justify-between bg-bg-secondary shrink-0 z-10 border-b border-border/10"
>
    <div class="flex items-center gap-4">
        {#if showBack}
            <button
                onclick={onBack}
                class="p-1 hover:bg-bg-tertiary rounded-full transition-colors"
                aria-label="Back"
            >
                <ChevronLeft size={24} class="text-text-primary" />
            </button>
        {/if}
        <div class="flex items-center gap-3">
            {#if contact?.profilePicUrl}
                <div class="w-9 h-9 rounded-full overflow-hidden shadow-sm">
                    <img
                        src={contact.profilePicUrl}
                        alt=""
                        class="w-full h-full object-cover"
                    />
                </div>
            {:else if contact?.avatarColor}
                <div
                    class="w-9 h-9 rounded-full {contact.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm"
                >
                    {contact.name?.charAt(0)}
                </div>
            {/if}
            <div class="flex flex-col">
                <h2 class="text-base font-bold text-text-primary leading-tight">
                    {title}
                </h2>
                {#if contact}
                    <span
                        class="text-xs {contact.typing
                            ? 'text-green-500 font-medium'
                            : 'text-text-muted'}"
                    >
                        {contact.typing ? "sedang mengetik..." : "Online"}
                    </span>
                {/if}
            </div>
        </div>
    </div>
    <div class="flex items-center gap-2 text-text-primary">
        <div class="relative">
            <button
                onclick={() => (showMenu = !showMenu)}
                class="p-1.5 hover:bg-bg-tertiary rounded-lg transition-colors"
                title="Menu"
            >
                <MoreVertical size={20} />
            </button>

            {#if showMenu}
                <div
                    class="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border/20 rounded-xl shadow-xl z-[100] py-1 overflow-hidden animate-in fade-in zoom-in duration-200"
                >
                    <button
                        onclick={() => {
                            onReset();
                            showMenu = false;
                        }}
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                        <RefreshCw size={16} />
                        <span>Reset WhatsApp</span>
                    </button>
                    <button
                        onclick={() => {
                            onLogout();
                            showMenu = false;
                        }}
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Logout Session</span>
                    </button>
                    <div class="border-t border-border/10 my-1"></div>
                    <div class="px-4 py-2 flex items-center gap-2">
                        <div
                            class="w-2 h-2 rounded-full {sessionStatus ===
                            'connected'
                                ? 'bg-green-500 animate-pulse'
                                : 'bg-red-500'}"
                        ></div>
                        <span
                            class="text-[10px] uppercase font-bold text-text-muted tracking-wider"
                            >{sessionStatus}</span
                        >
                    </div>
                </div>
            {/if}
        </div>

        <button
            onclick={onToggleFullscreen}
            class="p-1.5 hover:bg-bg-tertiary rounded-lg transition-colors"
            title={isFullscreen ? "Minimize" : "Fullscreen"}
        >
            {#if isFullscreen}
                <Minimize2 size={20} />
            {:else}
                <Maximize2 size={20} />
            {/if}
        </button>
        <button
            onclick={onClose}
            class="p-1.5 hover:bg-bg-tertiary rounded-lg transition-colors"
            title="Close"
        >
            <X size={20} />
        </button>
    </div>
</div>
