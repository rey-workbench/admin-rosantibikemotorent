<script lang="ts">
    import { onMount } from "svelte";
    import { Plus, Eye, Trash2, Check, ClipboardList } from "lucide-svelte";
    import { format } from "date-fns";
    import { id as idLocale } from "date-fns/locale";
    import { transaksiApi } from "$lib/api";
    import type { Transaksi, StatusTransaksi } from "$lib/types";
    import { Card, CardBody, Button, Badge } from "$lib/components/ui";
    import { confirm } from "$lib/stores/confirm";

    let transaksis: Transaksi[] = $state([]);
    let isLoading = $state(true);
    let statusFilter = $state<StatusTransaksi | "">("");

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        isLoading = true;
        try {
            const res = await transaksiApi.getAll({
                limit: 100,
                status: statusFilter ? [statusFilter] : undefined,
            });
            transaksis = res.data || [];
        } catch (error) {
            console.error("Error loading transaksi:", error);
        } finally {
            isLoading = false;
        }
    }

    async function handleSelesai(id: string) {
        const ok = await confirm.show({
            title: "Selesaikan Sewa",
            message: "Apakah Anda yakin ingin menyelesaikan transaksi ini?",
            type: "success",
            confirmText: "Ya, Selesai",
            cancelText: "Batal",
        });

        if (!ok) return;

        try {
            await transaksiApi.selesaiSewa(id);
            await loadData();
        } catch (error) {
            console.error("Error completing transaksi:", error);
        }
    }

    async function handleDelete(id: string) {
        const ok = await confirm.show({
            title: "Hapus Transaksi",
            message:
                "Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan.",
            type: "danger",
            confirmText: "Hapus Sekarang",
            cancelText: "Batal",
        });

        if (!ok) return;

        try {
            await transaksiApi.delete(id);
            await loadData();
        } catch (error) {
            console.error("Error deleting:", error);
        }
    }

    function formatDate(date: string) {
        return format(new Date(date), "dd MMM yyyy", { locale: idLocale });
    }

    function getStatusVariant(
        status: StatusTransaksi,
    ): "success" | "warning" | "danger" | "info" | "default" {
        const variants: Record<
            StatusTransaksi,
            "success" | "warning" | "danger" | "info" | "default"
        > = {
            PENDING: "warning",
            AKTIF: "info",
            SELESAI: "success",
            OVERDUE: "danger",
            DIBATALKAN: "default",
        };
        return variants[status] || "default";
    }

    $effect(() => {
        if (statusFilter !== undefined) {
            loadData();
        }
    });
</script>

<svelte:head>
    <title>Transaksi - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <h1>Transaksi</h1>
    <div class="flex gap-3">
        <select
            class="px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            bind:value={statusFilter}
        >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="AKTIF">Aktif</option>
            <option value="SELESAI">Selesai</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DIBATALKAN">Dibatalkan</option>
        </select>
        <Button href="/transaksi/new" variant="primary">
            <Plus size={18} />
            Buat Transaksi
        </Button>
    </div>
</div>

{#if isLoading}
    <div class="loading-page">
        <div class="loading-spinner"></div>
    </div>
{:else if transaksis.length === 0}
    <div class="empty-state">
        <div class="empty-state-icon">
            <ClipboardList size={48} />
        </div>
        <h3>Belum Ada Transaksi</h3>
        <p>Buat transaksi baru untuk memulai</p>
        <Button href="/transaksi/new" variant="primary" class="mt-4">
            <Plus size={18} />
            Buat Transaksi
        </Button>
    </div>
{:else}
    <Card>
        <CardBody class="p-0">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-bg-tertiary/30">
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Penyewa</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >No. HP</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Motor</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Tanggal</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Total</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Status</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Aksi</th
                            >
                        </tr>
                    </thead>
                    <tbody>
                        {#each transaksis as t}
                            <tr
                                class="border-b border-border hover:bg-bg-tertiary/20 transition-colors"
                            >
                                <td class="px-4 py-3 font-semibold text-sm"
                                    >{t.namaPenyewa}</td
                                >
                                <td class="px-4 py-3 text-sm">{t.noWhatsapp}</td
                                >
                                <td class="px-4 py-3 text-sm"
                                    >{t.unitMotor?.platNomor || "-"}</td
                                >
                                <td class="px-4 py-3 text-sm">
                                    {formatDate(t.tanggalMulai)} - {formatDate(
                                        t.tanggalSelesai,
                                    )}
                                </td>
                                <td class="px-4 py-3 font-medium text-sm"
                                    >Rp {t.totalBiaya?.toLocaleString(
                                        "id-ID",
                                    )}</td
                                >
                                <td class="px-4 py-3">
                                    <Badge
                                        variant={getStatusVariant(t.status)}
                                        text={t.status}
                                    />
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            href={`/transaksi/${t.id}`}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        {#if t.status === "AKTIF" || t.status === "OVERDUE"}
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onclick={() =>
                                                    handleSelesai(t.id)}
                                            >
                                                <Check size={16} />
                                            </Button>
                                        {/if}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onclick={() => handleDelete(t.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </CardBody>
    </Card>
{/if}
