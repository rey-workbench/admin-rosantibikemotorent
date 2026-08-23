<script lang="ts">
import {
	Bike,
	Brain,
	Calendar,
	ChevronDown,
	ChevronRight,
	ClipboardList,
	FileText,
	LayoutDashboard,
	ListOrdered,
	LogOut,
	MessageSquare,
	Settings,
	Truck,
	Users
} from '@lucide/svelte';
import { slide } from 'svelte/transition';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { authApi } from '$lib/api';
import { authStore } from '$lib/stores/auth';
import { toast } from '$lib/stores/toast';

const navItems = [
	{ path: '/', label: 'Dashboard', icon: LayoutDashboard },
	{
		label: 'Motor',
		icon: Bike,
		children: [
			{ path: '/motor/unit', label: 'Unit Motor', icon: Truck },
			{ path: '/motor', label: 'Jenis Motor', icon: Bike }
		]
	},
	{ path: '/transaksi', label: 'Transaksi', icon: ClipboardList },
	{ path: '/availability', label: 'Ketersediaan', icon: Calendar },
	{ path: '/blog', label: 'Artikel Blog', icon: FileText },
	{ path: '/whatsapp', label: 'WhatsApp', icon: MessageSquare },
	{ path: '/ai', label: 'AI Assistant', icon: Brain },
	{ path: '/queue', label: 'Monitor Antrian', icon: ListOrdered },
	{ path: '/admin', label: 'Daftar Admin', icon: Users },
	{ path: '/settings', label: 'Pengaturan', icon: Settings }
];

let expandedMenus = $state<Record<string, boolean>>({
	Motor: page.url.pathname.startsWith('/motor')
});

function toggleMenu(label: string) {
	expandedMenus[label] = !expandedMenus[label];
}

function isActive(path: string): boolean {
	if (path === '/') return page.url.pathname === '/';
	if (path === '/motor' && page.url.pathname.startsWith('/motor/unit')) {
		return false;
	}
	return page.url.pathname === path || page.url.pathname.startsWith(path + '/');
}

function isParentActive(item: any): boolean {
	if (!item.children) return isActive(item.path);
	return item.children.some((child: any) => isActive(child.path));
}

async function handleLogout() {
	try {
		await authApi.logout();
	} catch (e) {
		toast.error('Gagal logout, coba lagi');
	}
	authStore.logout();
	goto('/login');
}
</script>

<aside
    class="w-64 bg-white max-[768px]:hidden min-[769px]:flex flex-col shrink-0 h-screen sticky top-0 border-r border-black/6 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20"
>
    <!-- Logo -->
    <div class="px-6 py-5 border-b border-black/6">
        <a
            href="/"
            class="flex items-center no-underline group"
        >
            <img
                src="/logo.webp"
                alt="Rosantibike Logo"
                class="h-8 w-auto object-contain transition-opacity group-hover:opacity-85"
                onerror={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                }}
            />
        </a>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 scrollbar-hide">
        {#each navItems as item}
            {@const Icon = item.icon}
            {#if item.children}
                <div class="flex flex-col">
                    <button
                        onclick={() => toggleMenu(item.label)}
                        class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold group cursor-pointer
                        {isParentActive(item)
                            ? 'text-text-primary bg-black/4'
                            : 'text-[#48484a] hover:text-text-primary hover:bg-black/4'}"
                    >
                        <div class="flex items-center gap-3">
                            <Icon
                                size={18}
                                class={isParentActive(item)
                                    ? "stroke-[2.2px] text-text-primary"
                                    : "stroke-2 text-[#8e8e93] group-hover:text-text-primary"}
                            />
                            <span>{item.label}</span>
                        </div>
                        {#if expandedMenus[item.label]}
                            <ChevronDown size={14} class="opacity-60" />
                        {:else}
                            <ChevronRight size={14} class="opacity-60" />
                        {/if}
                    </button>

                    {#if expandedMenus[item.label]}
                        <div
                            class="mt-1 ml-4 border-l border-black/10 pl-2 space-y-1"
                            transition:slide={{ duration: 180 }}
                        >
                            {#each item.children as child}
                                {@const ChildIcon = child.icon}
                                <a
                                    href={child.path}
                                    class="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold group
                                    {isActive(child.path)
                                        ? 'text-primary bg-primary/10'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-black/4'}"
                                >
                                    <ChildIcon
                                        size={16}
                                        class={isActive(child.path)
                                            ? "stroke-[2.2px] text-primary"
                                            : "stroke-2 text-[#8e8e93] group-hover:text-text-primary"}
                                    />
                                    <span>{child.label}</span>
                                </a>
                            {/each}
                        </div>
                    {/if}
                </div>
            {:else}
                <a
                    href={item.path}
                    class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold group
                    {isActive(item.path)
                        ? 'bg-accent text-white shadow-xs'
                        : 'text-[#48484a] hover:text-text-primary hover:bg-black/4'}"
                >
                    <Icon
                        size={18}
                        class={isActive(item.path)
                            ? "stroke-[2.2px] text-white"
                            : "stroke-2 text-[#8e8e93] group-hover:text-text-primary"}
                    />
                    <span>{item.label}</span>
                </a>
            {/if}
        {/each}
    </nav>

    <!-- Admin Profile & Logout Footer -->
    <div class="p-3.5 mt-auto border-t border-black/5 bg-bg-primary/50">
        {#if $authStore.admin}
            <div class="px-3 py-2 mb-1 flex items-center justify-between">
                <div class="flex flex-col min-w-0">
                    <span class="text-xs font-semibold text-text-primary truncate">
                        {$authStore.admin.nama || $authStore.admin.username}
                    </span>
                    <span class="text-[10px] text-text-muted capitalize">
                        {$authStore.admin.username}
                    </span>
                </div>
            </div>
        {/if}

        <button
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-danger hover:bg-danger/10 transition-all duration-200 text-xs font-medium text-left cursor-pointer"
            onclick={handleLogout}
        >
            <LogOut size={16} />
            <span>Keluar Sesi</span>
        </button>
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
