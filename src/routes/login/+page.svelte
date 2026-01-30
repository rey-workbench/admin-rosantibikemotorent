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
    <!-- Background Accents -->
    <div
        class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]"
    ></div>
    <div
        class="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]"
    ></div>

    <div
        class="w-full max-w-[440px] px-6 py-12 flex flex-col items-center gap-8 relative z-10"
        in:fly={{ y: 20, duration: 800, delay: 200 }}
    >
        <!-- Logo Area -->
        <div class="flex flex-col items-center gap-4 text-center">
            <div
                class="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 rotate-3"
            >
                <Bike size={40} strokeWidth={2.5} />
            </div>

            <div class="space-y-1">
                <h1
                    class="text-4xl font-bold font-outfit tracking-tight text-text-primary"
                >
                    <span class="text-primary italic">Rosantibike</span>
                    <span class="text-text-muted font-normal">Motorent</span>
                </h1>
                <p
                    class="text-text-secondary font-medium tracking-wide uppercase text-xs"
                >
                    Akses Portal Admin
                </p>
            </div>
        </div>

        <!-- Login Card -->
        <div
            class="w-full bg-white border border-border/40 shadow-2xl shadow-primary/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden"
        >
            <!-- Decorative line -->
            <div
                class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary/50"
            ></div>

            <div class="mb-8">
                <h2
                    class="text-xl font-bold text-text-primary flex items-center gap-2"
                >
                    Selamat Datang Kembali <span class="animate-bounce">👋</span
                    >
                </h2>
                <p class="text-text-muted text-sm mt-1">
                    Silakan masukkan kredensial Anda untuk melanjutkan
                </p>
            </div>

            <form class="flex flex-col gap-6" onsubmit={handleLogin}>
                <div class="space-y-4">
                    <div class="relative group">
                        <Input
                            id="username"
                            label="Username"
                            bind:value={username}
                            placeholder="e.g. admin_rosanti"
                            required
                            disabled={isLoading}
                            class="transition-all duration-300"
                        />
                        <div
                            class="absolute right-4 top-[38px] text-text-muted/50 group-focus-within:text-primary transition-colors"
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
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            class="transition-all duration-300"
                        />
                        <div
                            class="absolute right-4 top-[38px] text-text-muted/50 group-focus-within:text-primary transition-colors"
                        >
                            <KeyRound size={18} />
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs px-1">
                    <label
                        class="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <input
                            type="checkbox"
                            class="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                        />
                        Ingat saya
                    </label>
                    <a
                        href="#"
                        class="text-primary font-semibold hover:underline"
                        >Lupa Password?</a
                    >
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    class="w-full h-14 text-base shadow-xl shadow-primary/25 mt-4"
                >
                    <LogIn size={20} />
                    Masuk ke Dashboard
                </Button>
            </form>
        </div>

        <!-- Footer Info -->
        <p class="text-text-muted text-xs text-center italic">
            &copy; {new Date().getFullYear()} Rosantibike Motorent. All Rights Reserved.
        </p>
    </div>
</div>

<style>
    :global(body) {
        background-color: var(--color-bg-primary);
    }

    /* Custom input override for extra premium feel */
    :global(input) {
        height: 3.25rem !important;
        border-radius: 1rem !important;
    }
</style>
