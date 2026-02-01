<script lang="ts">
    import { page } from "$app/stores";
    import {
        LayoutDashboard,
        Bike,
        ClipboardList,
        MessageSquare,
        Menu,
        X,
        Truck,
        FileText,
        ListOrdered,
        Settings,
        Users,
        LogOut,
        Calendar,
    } from "lucide-svelte";
    import { slide, fade } from "svelte/transition";
    import { authApi } from "$lib/api";
    import { authStore } from "$lib/stores/auth";
    import { goto } from "$app/navigation";

    // Main bottom tabs
    const mainTabs = [
        { path: "/", label: "Home", icon: LayoutDashboard },
        { path: "/motor/unit", label: "Motor", icon: Bike },
        { path: "/transaksi", label: "Transaksi", icon: ClipboardList },
        { path: "/whatsapp", label: "Chat", icon: MessageSquare },
    ];

    // Secondary items for the "Menu" drawer
    const menuItems = [
        { path: "/availability", label: "Ketersediaan", icon: Calendar },
        { path: "/motor", label: "Jenis Motor", icon: Truck }, // Alternate entry for Jenis
        { path: "/queue", label: "Antrian", icon: ListOrdered },
        { path: "/blog", label: "Blog", icon: FileText },
        { path: "/admin", label: "Admin", icon: Users },
        { path: "/settings", label: "Pengaturan", icon: Settings },
    ];

    let isMenuOpen = false;

    function isActive(path: string): boolean {
        return (
            $page.url.pathname === path ||
            (path !== "/" && $page.url.pathname.startsWith(path))
        );
    }

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    function closeMenu() {
        isMenuOpen = false;
    }

    async function handleLogout() {
        try {
            await authApi.logout();
        } catch (e) {}
        authStore.logout();
        goto("/login");
    }
</script>

<!-- Spacer to prevent content from being hidden behind nav -->
<!-- This might be handled in layout, but a safer bet is to have a hidden div of same height -->
<div class="h-16 min-[769px]:hidden"></div>

<!-- Mobile Bottom Nav -->
<nav
    class="bottom-nav fixed bottom-0 left-0 w-full bg-white dark:bg-bg-secondary border-t border-border z-40 min-[769px]:hidden safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
>
    <div class="flex items-center justify-around h-16 px-2">
        {#each mainTabs as tab}
            {@const Icon = tab.icon}
            <a
                href={tab.path}
                on:click={closeMenu}
                class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200
                {isActive(tab.path) && !isMenuOpen
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-primary'}"
            >
                <Icon
                    size={20}
                    strokeWidth={isActive(tab.path) && !isMenuOpen ? 2.5 : 2}
                    class="transition-transform duration-200 {isActive(
                        tab.path,
                    ) && !isMenuOpen
                        ? 'scale-110'
                        : ''}"
                />
                <span class="text-[10px] font-medium leading-none"
                    >{tab.label}</span
                >
            </a>
        {/each}

        <!-- Menu Toggle -->
        <button
            on:click={toggleMenu}
            class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 {isMenuOpen
                ? 'text-primary'
                : 'text-text-secondary hover:text-primary'}"
        >
            {#if isMenuOpen}
                <X size={20} strokeWidth={2.5} />
            {:else}
                <Menu size={20} strokeWidth={2} />
            {/if}
            <span class="text-[10px] font-medium leading-none">Menu</span>
        </button>
    </div>
</nav>

<!-- Full Screen Menu Overlay -->
{#if isMenuOpen}
    <button
        class="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm border-none cursor-default"
        on:click={closeMenu}
        aria-label="Close menu"
        transition:fade={{ duration: 200 }}
    ></button>

    <div
        class="fixed bottom-16 left-0 w-full bg-white dark:bg-bg-secondary rounded-t-2xl z-30 md:hidden border-t border-border shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        transition:slide={{ duration: 300, axis: "y" }}
    >
        <div class="p-4 border-b border-border/50 bg-bg-tertiary/30">
            <h3 class="font-bold text-lg text-text-primary">Menu Lainnya</h3>
        </div>

        <div class="p-4 grid grid-cols-3 gap-4 overflow-y-auto">
            {#each menuItems as item}
                {@const Icon = item.icon}
                <a
                    href={item.path}
                    on:click={closeMenu}
                    class="flex flex-col items-center justify-center p-3 rounded-xl gap-2 bg-bg-tertiary hover:bg-primary/5 hover:text-primary transition-colors border border-transparent hover:border-primary/10"
                >
                    <div
                        class="w-10 h-10 rounded-full bg-white dark:bg-bg-secondary flex items-center justify-center shadow-sm text-primary"
                    >
                        <Icon size={20} />
                    </div>
                    <span
                        class="text-xs font-medium text-center text-text-secondary"
                        >{item.label}</span
                    >
                </a>
            {/each}
        </div>

        <div class="p-4 border-t border-border/50 bg-bg-tertiary/30">
            <button
                on:click={handleLogout}
                class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
            >
                <LogOut size={18} />
                <span>Keluar</span>
            </button>
        </div>
    </div>
{/if}

<style>
    /* Safe area for iPhone X+ home indicator */
    .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom);
    }
</style>
