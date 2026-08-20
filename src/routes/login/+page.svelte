<script lang="ts">
    import { goto } from "$app/navigation";
    import { authApi } from "$lib/api";
    import { authStore } from "$lib/stores/auth";
    import {
        LogIn,
        ShieldCheck,
        Lock,
        User,
        Eye,
        EyeOff,
        ArrowLeft,
        AlertCircle,
        CheckCircle2,
    } from "@lucide/svelte";
    import { fly, fade } from "svelte/transition";

    let username = $state("");
    let password = $state("");
    let showPassword = $state(false);
    let rememberMe = $state(true);
    let isLoading = $state(false);
    let errorMessage = $state("");

    async function handleLogin(e: Event) {
        e.preventDefault();
        isLoading = true;
        errorMessage = "";

        try {
            const response = await authApi.login({ username, password });
            authStore.login(response.admin, response.token);
            goto("/");
        } catch (err: any) {
            console.error("Login error:", err);
            const status = err.response?.status;
            const resMsg = err.response?.data?.message;
            if (status === 429) {
                errorMessage =
                    "Terlalu banyak percobaan login. Silakan tunggu 15 menit.";
            } else if (Array.isArray(resMsg)) {
                errorMessage = resMsg.join(", ");
            } else if (typeof resMsg === "string" && resMsg.trim()) {
                errorMessage = resMsg;
            } else if (err.message && !err.message.includes("status code")) {
                errorMessage = err.message;
            } else {
                errorMessage = "Username atau password salah";
            }
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Admin Portal - Rosantibike Motorent</title>
</svelte:head>

<div
    class="min-h-screen w-full flex flex-col justify-between bg-[#f5f5f7] text-[#1d1d1f] relative overflow-hidden font-sans selection:bg-[#0071e3] selection:text-white"
>
    <!-- Background Subtle Radial Atmosphere (Apple Style) -->
    <div
        class="absolute -top-40 left-1/2 -translate-x-1/2 w-250 h-125 bg-linear-to-b from-[#0071e3]/10 via-[#0071e3]/3 to-transparent rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
        class="absolute bottom-0 right-0 w-100 h-100 bg-linear-to-t from-black/5 to-transparent rounded-full blur-2xl pointer-events-none"
    ></div>

    <!-- Header Navigation Bar (Mini Landing Style) -->
    <header class="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <a
            href="https://rosantibikemotorent.com"
            class="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#59595e] hover:text-[#1d1d1f] transition-colors group"
        >
            <ArrowLeft size={16} class="transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Website</span>
        </a>

        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/5 text-[11px] font-semibold uppercase tracking-wider text-[#59595e]">
            <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            <span>Admin Gateway</span>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="w-full max-w-md mx-auto px-6 py-8 relative z-10 flex flex-col items-center">
        <!-- Logo & Branding Title -->
        <div class="flex flex-col items-center text-center mb-8" in:fly={{ y: -15, duration: 600 }}>
            <a href="https://rosantibikemotorent.com" class="mb-4 inline-block hover:opacity-90 transition-opacity">
                <img
                    src="/logo.webp"
                    alt="Rosantibike Logo"
                    class="h-12 w-auto object-contain drop-shadow-sm"
                    onerror={(e) => {
                        // Fallback if logo not loaded
                        (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                />
            </a>

            <div class="space-y-1">
                <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0071e3]">
                    Management Portal
                </p>
                <h1 class="text-3xl font-bold tracking-tight text-[#1d1d1f] font-display">
                    Masuk ke Dashboard
                </h1>
                <p class="text-sm text-[#59595e] font-normal max-w-xs mt-1">
                    Kelola armada, pesanan rental, dan automasi WhatsApp
                </p>
            </div>
        </div>

        <!-- Glassmorphism Form Card -->
        <div
            class="w-full bg-white/90 backdrop-blur-2xl border border-black/8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] rounded-[2rem] p-7 md:p-9"
            in:fly={{ y: 20, duration: 650, delay: 100 }}
        >
            {#if errorMessage}
                <div
                    class="mb-6 p-3.5 rounded-xl bg-red-50/90 border border-red-200/80 text-red-800 text-xs font-medium flex items-start gap-2.5 shadow-sm"
                    in:fly={{ y: -6, duration: 250 }}
                >
                    <AlertCircle size={16} class="shrink-0 text-red-600 mt-0.5" />
                    <span class="leading-relaxed">{errorMessage}</span>
                </div>
            {/if}

            <form class="flex flex-col gap-5" onsubmit={handleLogin}>
                <!-- Username Field -->
                <div class="space-y-1.5">
                    <label
                        for="username"
                        class="block text-xs font-semibold uppercase tracking-wider text-[#59595e]"
                    >
                        Username Admin
                    </label>
                    <div class="relative group">
                        <div
                            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] transition-colors pointer-events-none flex items-center"
                        >
                            <User size={17} />
                        </div>
                        <input
                            id="username"
                            type="text"
                            bind:value={username}
                            placeholder="admin / operator"
                            required
                            disabled={isLoading}
                            autocomplete="username"
                            class="w-full pl-10.5 pr-4 py-3 bg-[#fbfbfd] hover:bg-white border border-black/10 focus:ring-4 focus:ring-[#0071e3]/10 rounded-xl text-sm font-medium text-[#1d1d1f] outline-none transition-all disabled:opacity-50"
                        />
                    </div>
                </div>

                <!-- Password Field -->
                <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                        <label
                            for="password"
                            class="block text-xs font-semibold uppercase tracking-wider text-[#59595e]"
                        >
                            Kata Sandi
                        </label>
                    </div>
                    <div class="relative group">
                        <div
                            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] transition-colors pointer-events-none flex items-center"
                        >
                            <Lock size={17} />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            placeholder="••••••••••••"
                            required
                            disabled={isLoading}
                            autocomplete="current-password"
                            class="w-full pl-10.5 pr-11 py-3 bg-[#fbfbfd] hover:bg-white border border-black/10 focus:ring-4 focus:ring-[#0071e3]/10 rounded-xl text-sm font-medium text-[#1d1d1f] outline-none transition-all disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onclick={() => (showPassword = !showPassword)}
                            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors p-1 cursor-pointer"
                            aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                        >
                            {#if showPassword}
                                <EyeOff size={16} />
                            {:else}
                                <Eye size={16} />
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Options -->
                <div class="flex items-center justify-between text-xs pt-1">
                    <label class="flex items-center gap-2 cursor-pointer select-none text-[#59595e] hover:text-[#1d1d1f] transition-colors">
                        <input
                            type="checkbox"
                            bind:checked={rememberMe}
                            class="w-4 h-4 rounded border-black/20 text-[#0071e3] focus:ring-[#0071e3]/20 accent-[#0071e3] cursor-pointer"
                        />
                        <span>Simpan sesi login</span>
                    </label>

                    <span class="text-[11px] text-[#86868b] font-medium flex items-center gap-1">
                        <ShieldCheck size={13} class="text-[#0071e3]" />
                        256-bit SSL
                    </span>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    disabled={isLoading}
                    class="w-full h-12 mt-2 rounded-xl bg-[#1d1d1f] hover:bg-black active:scale-[0.98] text-white font-semibold text-sm tracking-wide shadow-lg shadow-black/10 hover:shadow-black/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:transform-none"
                >
                    {#if isLoading}
                        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Memverifikasi...</span>
                    {:else}
                        <LogIn size={17} />
                        <span>Masuk ke Panel</span>
                    {/if}
                </button>
            </form>
        </div>

        <!-- Security Footer Badge -->
        <div class="mt-8 flex items-center gap-2 text-xs text-[#86868b]" in:fade={{ duration: 400, delay: 200 }}>
            <CheckCircle2 size={14} class="text-success" />
            <span>Koneksi aman terenkripsi JWT Guard & HTTP-Only Cookie</span>
        </div>
    </main>

    <!-- Footer Copyright -->
    <footer class="w-full text-center py-6 text-xs text-[#86868b]/70 relative z-10">
        &copy; {new Date().getFullYear()} Rosantibike Motorent. All rights reserved.
    </footer>
</div>

<style>
    :global(body) {
        background-color: #f5f5f7;
    }
</style>

