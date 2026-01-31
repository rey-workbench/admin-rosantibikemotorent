<script lang="ts">
    import { goto } from "$app/navigation";
    import { authApi } from "$lib/api";
    import { authStore } from "$lib/stores/auth";
    import { Button, Input } from "$lib/components/ui";
    import { LogIn, Bike, ShieldCheck, KeyRound } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";

    let username = $state("");
    let password = $state("");
    let isLoading = $state(false);

    async function handleLogin(e: Event) {
        e.preventDefault();
        isLoading = true;

        try {
            const response = await authApi.login({ username, password });
            authStore.login(response.admin, response.token);
            goto("/");
        } catch (err: any) {
            console.error("Login error:", err);
            // Optional: Add toast error here if globally available
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Login | Rosantibike Motorent</title>
</svelte:head>

<div
    class="min-h-screen w-full flex items-center justify-center bg-bg-primary overflow-hidden relative"
>
    <!-- Background Accents (Subtler) -->
    <div
        class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"
    ></div>
    <div
        class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"
    ></div>

    <div
        class="w-full max-w-[480px] px-6 py-12 flex flex-col items-center gap-6 relative z-10"
        in:fly={{ y: 15, duration: 600 }}
    >
        <!-- Logo Area -->
        <div class="flex flex-col items-center gap-3 text-center mb-2">
            <div
                class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"
            >
                <Bike size={32} strokeWidth={2} />
            </div>

            <div class="space-y-0.5">
                <h1
                    class="text-3xl font-bold font-outfit tracking-tight text-text-primary"
                >
                    Rosantibike
                </h1>
                <p
                    class="text-text-secondary font-medium tracking-wide text-xs"
                >
                    Admin Portal
                </p>
            </div>
        </div>

        <!-- Login Card -->
        <div
            class="w-full bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-primary/5 rounded-[2rem] p-8 md:p-9 relative"
        >
            <div class="mb-6 text-center">
                <h2 class="text-lg font-bold text-text-primary">
                    Selamat Datang
                </h2>
                <p class="text-text-secondary text-sm mt-1">
                    Masuk untuk mengelola rental
                </p>
            </div>

            <form class="flex flex-col gap-5" onsubmit={handleLogin}>
                <div class="space-y-4">
                    <div class="relative group">
                        <Input
                            id="username"
                            label="Username"
                            bind:value={username}
                            placeholder="username"
                            required
                            disabled={isLoading}
                            class="bg-bg-tertiary/50 border-transparent focus:bg-white transition-all pl-10"
                        />
                        <div
                            class="absolute left-3 top-[41px] text-text-muted group-focus-within:text-primary transition-colors pointer-events-none"
                        >
                            <ShieldCheck size={18} />
                        </div>
                    </div>

                    <div class="relative group">
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            bind:value={password}
                            placeholder="password"
                            required
                            disabled={isLoading}
                            class="bg-bg-tertiary/50 border-transparent focus:bg-white transition-all pl-10"
                        />
                        <div
                            class="absolute left-3 top-[41px] text-text-muted group-focus-within:text-primary transition-colors pointer-events-none"
                        >
                            <KeyRound size={18} />
                        </div>
                    </div>
                </div>

                <div
                    class="flex items-center justify-between text-xs px-1 mt-1"
                >
                    <label
                        class="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <input
                            type="checkbox"
                            class="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20"
                        />
                        Ingat saya
                    </label>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    class="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/20 mt-2 rounded-xl"
                >
                    {#if !isLoading}
                        <LogIn size={18} class="mr-2" />
                    {/if}
                    Masuk
                </Button>
            </form>
        </div>

        <!-- Footer Info -->
        <p class="text-text-muted/60 text-[10px] text-center">
            &copy; {new Date().getFullYear()} Rosantibike Motorent.
        </p>
    </div>
</div>

<style>
    :global(body) {
        background-color: var(--color-bg-primary);
    }
</style>
