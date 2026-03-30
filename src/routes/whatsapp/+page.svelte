<script lang="ts">
  import { onMount } from "svelte";
  import { RefreshCw, Power, Send, QrCode } from "lucide-svelte";
  import { whatsappApi } from "$lib/api";
  import {
    socketConnected,
    whatsappStatus,
    transaksiNotifications,
  } from "$lib/services/websocket";
  import websocketService from "$lib/services/websocket";
  import { toast } from "$lib/stores/toast";
  import type { WhatsappStatus, WhatsappConnectionStatus } from "$lib/types";
  import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Badge,
    Input,
    Tabs,
  } from "$lib/components/ui";
  import { PageHeader } from "$lib/components/layout";
  import { confirm } from "$lib/stores/confirm";
  import WhatsAppTemplates from "./components/WhatsAppTemplates.svelte";
  import WhatsAppWorkflows from "./components/WhatsAppWorkflows.svelte";
  import WhatsAppChatWidget from "./components/WhatsAppChatWidget.svelte";

  let status: WhatsappStatus | null = $state(null);
  let qrCode: string | null = $state(null);
  let isLoading = $state(true);
  let isSending = $state(false);
  let isLoadingQr = $state(false);
  let phone = $state("");
  let message = $state("");
  let activeTab = $state("connection"); // 'connection' | 'templates'

  onMount(() => {
    loadStatus();

    // Subscribe to real-time transaksi notifications
    const unsubscribe = websocketService.onTransaksiCreated((transaksi) => {
      toast.success(
        `Booking baru: ${transaksi.namaPenyewa} - ${transaksi.unitMotor.platNomor}`,
      );
    });

    return () => {
      unsubscribe();
    };
  });

  $effect(() => {
    if ($whatsappStatus) {
      status = $whatsappStatus;

      if ($whatsappStatus.qrCode) {
        qrCode = $whatsappStatus.qrCode;
      } else if ($whatsappStatus.status === "connected") {
        qrCode = null;
      }
    }
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
      qr_timeout: "danger",
    };
    return variants[s] || "danger";
  }
</script>

<svelte:head>
  <title>WhatsApp - Rosantibike Motorent</title>
</svelte:head>

<PageHeader title="Integrasi WhatsApp">
  {#if $socketConnected}
    <Badge variant="success" text="Real-time" />
  {/if}
  <Tabs
    tabs={[
      { id: "connection", label: "Koneksi" },
      { id: "templates", label: "Templates" },
      { id: "workflows", label: "Workflows" },
    ]}
    {activeTab}
    onchange={(id) => (activeTab = id)}
  />
  <Button variant="secondary" onclick={loadStatus}>
    <RefreshCw size={18} />
    Refresh
  </Button>
</PageHeader>

{#if activeTab === "connection"}
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

            {#if status.message}
              <div
                class="mb-4 p-3 bg-bg-surface rounded-md border border-border-color"
              >
                <p
                  class="text-sm font-medium {status.status === 'error'
                    ? 'text-danger-500'
                    : 'text-text-primary'}"
                >
                  {status.message}
                </p>
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
              <img src={qrCode} alt="WhatsApp QR Code" class="max-w-[250px]" />
            </div>
            <p class="text-text-muted text-sm mt-2">
              Scan dengan WhatsApp di HP Anda
            </p>
          {:else}
            <div class="py-8">
              {#if status?.isConnecting && !qrCode}
                <div class="flex flex-col items-center gap-3">
                  <div class="loading-spinner w-10 h-10 border-2"></div>
                  <p class="text-primary font-medium text-center">
                    {status.message || "Membuka Browser..."}
                  </p>
                  <p class="text-text-muted text-xs px-8 text-center">
                    {status.message
                      ? ""
                      : "Menyiapkan lingkungan WhatsApp Web (60-90 detik untuk scan pertama)"}
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
          <span class="ml-2">{isSending ? "Mengirim..." : "Kirim Pesan"}</span>
        </Button>
      </CardBody>
    </Card>
  {/if}
{:else if activeTab === "templates"}
  <WhatsAppTemplates />
{:else if activeTab === "workflows"}
  <WhatsAppWorkflows />
{/if}

<!-- WhatsApp Chat Widget (floating) -->
<WhatsAppChatWidget />
