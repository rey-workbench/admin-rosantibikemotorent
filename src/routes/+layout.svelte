<script lang="ts">
    import "../app.css";
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import BottomNav from "$lib/components/layout/BottomNav.svelte";
    import ChatWidget from "$lib/components/chat/ChatWidget.svelte";
    import { Toast, ConfirmModal } from "$lib/components/ui";
    import { authStore } from "$lib/stores/auth";
    import { confirm } from "$lib/stores/confirm";
    import { initSocket, disconnectSocket } from "$lib/socket";

    let { children } = $props();

    onMount(() => {
        initSocket();
    });

    onDestroy(() => {
        disconnectSocket();
    });

    $effect(() => {
        const isLoginPage = $page.url.pathname === "/login";
        if (!$authStore.isLoading) {
            if (!$authStore.token && !isLoginPage) {
                goto("/login");
            } else if ($authStore.token && isLoginPage) {
                goto("/");
            }
        }
    });

    const isLoginPage = $derived($page.url.pathname === "/login");
</script>

<svelte:head>
    <title>Rosantibike Motorent - Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="anonymous"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<!-- Global Toast -->
<Toast />

<!-- Global Confirm Modal -->
<ConfirmModal
    open={$confirm.open}
    title={$confirm.title}
    message={$confirm.message}
    type={$confirm.type}
    confirmText={$confirm.confirmText}
    cancelText={$confirm.cancelText}
    onconfirm={confirm.confirm}
    oncancel={confirm.cancel}
/>

{#if $authStore.isLoading}
    <div
        class="h-screen w-screen flex items-center justify-center bg-[#F8F9FB]"
    >
        <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        ></div>
    </div>
{:else if isLoginPage}
    {@render children()}
{:else if $authStore.token}
    <div class="flex h-screen bg-[#F8F9FB] overflow-hidden">
        <!-- Left Sidebar -->
        <Sidebar />

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <div class="flex-1 overflow-y-auto scroll-smooth">
                <div class="p-6 md:p-8 w-full pb-24 md:pb-8">
                    {@render children()}
                </div>
            </div>
        </main>

        <!-- Chat Widget Overlay -->
        <ChatWidget />

        <!-- Mobile Bottom Navigation -->
        <BottomNav />
    </div>
{/if}
