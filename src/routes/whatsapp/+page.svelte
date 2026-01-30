<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { RefreshCw, Power, Send, QrCode } from "lucide-svelte";
    import { whatsappApi } from "$lib/api";
    import { socketConnected } from "$lib/socket";
    import { toast } from "$lib/stores/toast";
    import type { WhatsappStatus, WhatsappConnectionStatus } from "$lib/types";
    import {
        Card,
        CardBody,
        CardHeader,
        Button,
        Badge,
        Input,
    } from "$lib/components/ui";
    import { confirm } from "$lib/stores/confirm";

    let status: WhatsappStatus | null = $state(null);
    let qrCode: string | null = $state(null);
    let isLoading = $state(true);
    let isSending = $state(false);
    let isLoadingQr = $state(false);
    let phone = $state("");
    let message = $state("");
    let interval: ReturnType<typeof setInterval>;

    onMount(async () => {
        await loadStatus();
        interval = setInterval(loadStatus, 5000);
    });

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });

    async function loadStatus() {
        try {
            status = await whatsappApi.getStatus();
            if (status.qrCode) {
                qrCode = status.qrCode;
            } else if (status.status === "connected") {
                qrCode = null;
            }
        } catch (error) {
            console.error("Error loading status:", error);
        } finally {
            isLoading = false;
        }
    }

    async function getQrCode() {
        if (status?.status === "connected") {
            toast.success("WhatsApp sudah terhubung!");
            return;
        }

        isLoadingQr = true;
        try {
            const res = await whatsappApi.getQrCode();
            qrCode = res.qrcode;
            if (!qrCode) {
                toast.warning(
                    "QR Code belum tersedia. Browser sedang disiapkan, mohon tunggu sebentar...",
                );
            } else {
                toast.success("QR Code berhasil diambil");
            }
        } catch (error) {
            console.error("Error getting QR:", error);
            toast.error("Gagal mengambil QR Code");
        } finally {
            isLoadingQr = false;
        }
    }

    async function handleLogout() {
        const ok = await confirm.show({
            title: "Logout WhatsApp",
            message: "Apakah Anda yakin ingin keluar dari sesi WhatsApp ini?",
            type: "danger",
            confirmText: "Ya, Logout",
        });

        if (!ok) return;
        try {
            await whatsappApi.logout();
            await loadStatus();
            qrCode = null;
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }

    async function handleReset() {
        const ok = await confirm.show({
            title: "Reset Sesi WhatsApp",
            message:
                "Reset sesi WhatsApp akan menutup koneksi dan memulai ulang. Anda mungkin perlu scan QR lagi.",
            type: "warning",
            confirmText: "Ya, Reset",
        });

        if (!ok) return;
        try {
            await whatsappApi.resetSession();
            await loadStatus();
            qrCode = null;
        } catch (error) {
            console.error("Error resetting:", error);
        }
    }

    async function handleSend() {
        if (!phone || !message) {
            toast.warning("Masukkan nomor telepon dan pesan");
            return;
        }
        isSending = true;
        try {
            await whatsappApi.sendMessage(phone, message);
            message = "";
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            isSending = false;
        }
    }

    function getStatusVariant(
        s: WhatsappConnectionStatus,
    ): "success" | "warning" | "danger" {
        const variants: Record<
            WhatsappConnectionStatus,
            "success" | "warning" | "danger"
        > = {
            connected: "success",
            connecting: "warning",
            disconnected: "danger",
            error: "danger",
        };
        return variants[s] || "danger";
    }
</script>

<svelte:head>
    <title>WhatsApp - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <div class="flex items-center gap-3">
        <h1>Integrasi WhatsApp</h1>
        {#if $socketConnected}
            <Badge variant="success" text="Real-time" />
        {/if}
    </div>
    <Button variant="secondary" onclick={loadStatus}>
        <RefreshCw size={18} />
        Refresh
    </Button>
</div>

{#if isLoading}
    <div class="loading-page">
        <div class="loading-spinner"></div>
    </div>
{:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Status Card -->
        <Card>
            <CardHeader class="flex justify-between items-center">
                <span class="font-semibold">Status Koneksi</span>
                {#if status}
                    <Badge
                        variant={getStatusVariant(status.status)}
                        text={status.status.toUpperCase()}
                    />
                {/if}
            </CardHeader>
            <CardBody>
                {#if status}
                    <div class="mb-4">
                        <p class="text-text-muted text-sm">Session</p>
                        <p class="font-semibold">{status.session}</p>
                    </div>

                    {#if status.loadingStatus}
                        <div class="mb-4">
                            <div class="flex justify-between text-sm mb-1">
                                <span>{status.loadingStatus.message}</span>
                                <span>{status.loadingStatus.percent}%</span>
                            </div>
                            <div
                                class="bg-bg-tertiary rounded-full h-2 overflow-hidden"
                            >
                                <div
                                    class="bg-primary h-full transition-all duration-300"
                                    style="width: {status.loadingStatus
                                        .percent}%"
                                ></div>
                            </div>
                        </div>
                    {/if}

                    <div class="flex gap-2">
                        <Button
                            variant="primary"
                            onclick={getQrCode}
                            disabled={status.status === "connected"}
                            loading={isLoadingQr}
                        >
                            <QrCode size={18} />
                            Get QR
                        </Button>
                        {#if status.status === "connected"}
                            <Button variant="danger" onclick={handleLogout}>
                                <Power size={18} />
                                Logout
                            </Button>
                        {:else}
                            <Button variant="warning" onclick={handleReset}>
                                <RefreshCw size={18} />
                                Reset Sesi
                            </Button>
                        {/if}
                    </div>
                {/if}
            </CardBody>
        </Card>

        <!-- QR Code Card -->
        <Card>
            <CardHeader>
                <span class="font-semibold">QR Code</span>
            </CardHeader>
            <CardBody class="text-center">
                {#if qrCode}
                    <div class="bg-white p-4 rounded-lg inline-block">
                        <img
                            src={qrCode}
                            alt="WhatsApp QR Code"
                            class="max-w-[250px]"
                        />
                    </div>
                    <p class="text-text-muted text-sm mt-2">
                        Scan dengan WhatsApp di HP Anda
                    </p>
                {:else}
                    <div class="py-8">
                        {#if status?.isConnecting && !qrCode}
                            <div class="flex flex-col items-center gap-3">
                                <div
                                    class="loading-spinner w-10 h-10 border-2"
                                ></div>
                                <p class="text-primary font-medium">
                                    Membuka Browser...
                                </p>
                                <p class="text-text-muted text-xs px-8">
                                    Menyiapkan lingkungan WhatsApp Web (60-90
                                    detik untuk scan pertama)
                                </p>
                            </div>
                        {:else}
                            <QrCode
                                size={48}
                                class="text-text-muted opacity-30 mx-auto mb-4"
                            />
                            <p class="text-text-muted">
                                Klik "Get QR" untuk menampilkan QR Code
                            </p>
                        {/if}
                    </div>
                {/if}
            </CardBody>
        </Card>
    </div>

    <!-- Send Message Card -->
    <Card class="mt-4">
        <CardHeader>
            <span class="font-semibold">Kirim Pesan (Test)</span>
        </CardHeader>
        <CardBody>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                    id="phone"
                    label="Nomor Telepon"
                    bind:value={phone}
                    placeholder="628xxxxxxxxxx"
                />
                <Input
                    id="message"
                    label="Pesan"
                    bind:value={message}
                    placeholder="Ketik pesan..."
                />
            </div>
            <Button variant="primary" onclick={handleSend} loading={isSending}>
                <Send size={18} />
                <span class="ml-2"
                    >{isSending ? "Mengirim..." : "Kirim Pesan"}</span
                >
            </Button>
        </CardBody>
    </Card>
{/if}
