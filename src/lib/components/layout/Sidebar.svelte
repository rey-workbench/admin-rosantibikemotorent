<script lang="ts">
    import { page } from "$app/state";
    import {
        LayoutDashboard,
        Truck,
        ClipboardList,
        FileText,
        MessageSquare,
        ListOrdered,
        Settings,
        Users,
        Bike,
        Zap,
        HelpCircle,
        LogOut,
        ChevronDown,
        ChevronRight,
        Calendar,
        Brain,
    } from "lucide-svelte";
    import { authApi } from "$lib/api";
    import { authStore } from "$lib/stores/auth";
    import { goto } from "$app/navigation";
    import { slide } from "svelte/transition";

    const navItems = [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        {
            label: "Motor",
            icon: Bike,
            children: [
                { path: "/motor/unit", label: "Unit Motor", icon: Truck },
                { path: "/motor", label: "Jenis Motor", icon: Bike },
            ],
        },
        { path: "/transaksi", label: "Transaksi", icon: ClipboardList },
        { path: "/availability", label: "Ketersediaan", icon: Calendar },
        { path: "/blog", label: "Artikel Blog", icon: FileText },
        { path: "/whatsapp", label: "WhatsApp", icon: MessageSquare },
        { path: "/ai", label: "AI Assistant", icon: Brain },
        { path: "/queue", label: "Monitor Antrian", icon: ListOrdered },
        { path: "/admin", label: "Daftar Admin", icon: Users },
        { path: "/settings", label: "Pengaturan", icon: Settings },
    ];

    let expandedMenus = $state<Record<string, boolean>>({
        Motor: page.url.pathname.startsWith("/motor"),
    });

    function toggleMenu(label: string) {
        expandedMenus[label] = !expandedMenus[label];
    }

    function isActive(path: string): boolean {
        if (path === "/") return page.url.pathname === "/";
        if (path === "/motor" && page.url.pathname.startsWith("/motor/unit")) {
            return false;
        }
        return (
            page.url.pathname === path ||
            page.url.pathname.startsWith(path + "/")
        );
    }

    function isParentActive(item: any): boolean {
        if (!item.children) return isActive(item.path);
        return item.children.some((child: any) => isActive(child.path));
    }

    async function handleLogout() {
        try {
            await authApi.logout();
        } catch (e) {}
        authStore.logout();
        goto("/login");
    }
</script>

<aside
    class="w-64 bg-bg-primary max-[768px]:hidden min-[769px]:flex flex-col shrink-0 h-screen sticky top-0 border-r border-transparent shadow-sm z-20"
>
    <div class="p-8 pb-4">
        <a
            href="/"
            class="flex items-center gap-3 no-underline text-text-primary group"
        >
            <div
                class="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform"
            >
                <Bike size={18} />
            </div>
            <span class="font-bold text-xl tracking-tight">Rosantibike</span>
        </a>
    </div>

    <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide">
        {#each navItems as item}
            {@const Icon = item.icon}
            {#if item.children}
                <div class="flex flex-col">
                    <button
                        onclick={() => toggleMenu(item.label)}
                        class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium group
                        {isParentActive(item)
                            ? 'text-primary bg-primary/5'
                            : 'text-text-secondary hover:text-primary hover:bg-bg-tertiary'}"
                    >
                        <div class="flex items-center gap-3">
                            <Icon
                                size={20}
                                class={isParentActive(item)
                                    ? "stroke-[2.5px]"
                                    : "stroke-2"}
                            />
                            <span>{item.label}</span>
                        </div>
                        {#if expandedMenus[item.label]}
                            <ChevronDown size={14} class="opacity-50" />
                        {:else}
                            <ChevronRight size={14} class="opacity-50" />
                        {/if}
                    </button>

                    {#if expandedMenus[item.label]}
                        <div
                            class="mt-1 ml-4 border-l border-border/50 pl-2 space-y-1"
                            transition:slide={{ duration: 200 }}
                        >
                            {#each item.children as child}
                                {@const ChildIcon = child.icon}
                                <a
                                    href={child.path}
                                    class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group
                                    {isActive(child.path)
                                        ? 'text-primary bg-primary/5'
                                        : 'text-text-secondary hover:text-primary hover:bg-bg-tertiary'}"
                                >
                                    <ChildIcon
                                        size={18}
                                        class={isActive(child.path)
                                            ? "stroke-[2.5px]"
                                            : "stroke-2"}
                                    />
                                    <span>{child.label}</span>

                                    {#if isActive(child.path)}
                                        <div
                                            class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full"
                                        ></div>
                                    {/if}
                                </a>
                            {/each}
                        </div>
                    {/if}
                </div>
            {:else}
                <a
                    href={item.path}
                    class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group relative
                    {isActive(item.path)
                        ? 'text-primary bg-primary/5'
                        : 'text-text-secondary hover:text-primary hover:bg-bg-tertiary'}"
                >
                    <Icon
                        size={20}
                        class={isActive(item.path)
                            ? "stroke-[2.5px]"
                            : "stroke-2"}
                    />
                    <span>{item.label}</span>

                    {#if isActive(item.path)}
                        <div
                            class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full"
                        ></div>
                    {/if}
                </a>
            {/if}
        {/each}
    </nav>

    <div class="p-4 mt-auto">
        <div
            class="bg-white/60 backdrop-blur-sm rounded-[2rem] p-6 relative overflow-hidden group border border-white/50"
        >
            <div
                class="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full group-hover:scale-110 transition-transform"
            ></div>
            <div class="relative z-10">
                <h4 class="font-bold text-text-primary text-lg mb-2">
                    Upgrade ke Paket Pro
                </h4>
                <p
                    class="text-xs text-text-secondary mb-4 leading-relaxed max-w-[150px]"
                >
                    Dapatkan 1 bulan gratis dan buka fitur premium
                </p>
                <button
                    class="w-full bg-blue-100 text-primary hover:bg-blue-200 py-2 rounded-xl text-sm font-bold transition-all mt-2"
                >
                    Tingkatkan
                </button>
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-border/50 space-y-1">
            <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-danger hover:bg-danger/5 transition-all duration-200 font-medium text-left"
                onclick={handleLogout}
            >
                <LogOut size={20} />
                <span>Keluar</span>
            </button>
        </div>
    </div>
</aside>

<style>
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
