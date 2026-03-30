<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Eye, Trash2, Check, ClipboardList } from "lucide-svelte";
  import { formatCurrency, formatDateShort } from "$lib/utils";
  import { STATUS_TRANSAKSI, TRANSAKSI_STATUS_VARIANTS } from "$lib/constants";
  import { transaksiApi } from "$lib/api";
  import type { Transaksi, StatusTransaksi } from "$lib/types";
  import {
    Card,
    CardBody,
    Button,
    Badge,
    DataTable,
    Loading,
    EmptyState,
  } from "$lib/components/ui";
  import { confirm } from "$lib/stores/confirm";
  import PageHeader from "$lib/components/layout/PageHeader.svelte";

  let transaksis: Transaksi[] = $state([]);
  let isLoading = $state(true);
  let statusFilter = $state<StatusTransaksi | "">("");

  const columns = [
    { key: "penyewa", label: "Penyewa" },
    { key: "noHp", label: "No. HP" },
    { key: "motor", label: "Motor" },
    { key: "tanggal", label: "Tanggal" },
    { key: "total", label: "Total" },
    { key: "status", label: "Status" },
    { key: "aksi", label: "Aksi", class: "w-32" },
  ];

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
      message: "Apakah Anda yakin ingin menghapus transaksi ini?",
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

  function getStatusVariant(status: StatusTransaksi) {
    return TRANSAKSI_STATUS_VARIANTS[status] || "default";
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
<PageHeader title="Transaksi" subtitle="Kelola transaksi sewa motor">
  <div class="flex gap-3">
    <select
      class="px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
      bind:value={statusFilter}
    >
      <option value="">Semua Status</option>
      <option value={STATUS_TRANSAKSI.PENDING}>Pending</option>
      <option value={STATUS_TRANSAKSI.AKTIF}>Aktif</option>
      <option value={STATUS_TRANSAKSI.SELESAI}>Selesai</option>
      <option value={STATUS_TRANSAKSI.OVERDUE}>Overdue</option>
      <option value={STATUS_TRANSAKSI.DIBATALKAN}>Dibatalkan</option>
    </select>
    <Button href="/transaksi/new" variant="primary">
      <Plus size={18} />
      Buat Transaksi
    </Button>
  </div>
</PageHeader>

{#if isLoading}
  <Loading />
{:else if transaksis.length === 0}
  <EmptyState
    icon={ClipboardList}
    title="Belum Ada Transaksi"
    description="Buat transaksi baru untuk memulai"
  >
    {#snippet action()}
      <Button href="/transaksi/new" variant="primary" class="mt-4">
        <Plus size={18} />
        Buat Transaksi
      </Button>
    {/snippet}
  </EmptyState>
{:else}
  <Card>
    <CardBody class="p-0">
      <DataTable {columns}>
        {#each transaksis as t}
          <tr
            class="border-b border-border hover:bg-bg-tertiary/20 transition-colors"
          >
            <td class="px-4 py-3 font-semibold text-sm">{t.namaPenyewa}</td>
            <td class="px-4 py-3 text-sm">{t.noWhatsapp}</td>
            <td class="px-4 py-3 text-sm">{t.unitMotor?.platNomor || "-"}</td>
            <td class="px-4 py-3 text-sm">
              {formatDateShort(t.tanggalMulai)} - {formatDateShort(
                t.tanggalSelesai,
              )}
            </td>
            <td class="px-4 py-3 font-medium text-sm"
              >{formatCurrency(t.totalBiaya || 0)}</td
            >
            <td class="px-4 py-3">
              <Badge variant={getStatusVariant(t.status)} text={t.status} />
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
                {#if t.status === STATUS_TRANSAKSI.AKTIF || t.status === STATUS_TRANSAKSI.OVERDUE}
                  <Button
                    variant="success"
                    size="sm"
                    onclick={() => handleSelesai(t.id)}
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
      </DataTable>
    </CardBody>
  </Card>
{/if}
