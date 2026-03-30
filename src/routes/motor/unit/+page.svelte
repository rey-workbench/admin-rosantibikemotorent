<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Pencil, Trash2, Truck } from "lucide-svelte";
  import { formatCurrency } from "$lib/utils";
  import { MOTOR_STATUS_VARIANTS } from "$lib/constants";
  import { unitMotorApi } from "$lib/api";
  import type { UnitMotor } from "$lib/types";
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
  import { PageHeader } from "$lib/components";

  let units: UnitMotor[] = $state([]);
  let isLoading = $state(true);

  const columns = [
    { key: "plat", label: "Plat Nomor" },
    { key: "jenis", label: "Jenis Motor" },
    { key: "harga", label: "Harga Sewa" },
    { key: "status", label: "Status" },
    { key: "aksi", label: "Aksi", class: "w-24" },
  ];

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    isLoading = true;
    try {
      const res = await unitMotorApi.getAll({ limit: 100 });
      units = res.data || [];
    } catch (error) {
      console.error("Error loading unit motor:", error);
    } finally {
      isLoading = false;
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm.show({
      title: "Hapus Unit Motor",
      message: "Apakah Anda yakin ingin menghapus unit motor ini?",
      type: "danger",
      confirmText: "Ya, Hapus",
    });

    if (!ok) return;

    try {
      await unitMotorApi.delete(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  }
</script>

<svelte:head>
  <title>Unit Motor - Rosantibike Motorent</title>
</svelte:head>

<PageHeader title="Unit Motor">
  <div class="flex gap-3">
    <Button href="/motor/unit/new" variant="primary">
      <Plus size={18} />
      Tambah Unit
    </Button>
  </div>
</PageHeader>

{#if isLoading}
  <Loading />
{:else if units.length === 0}
  <EmptyState
    icon={Truck}
    title="Belum Ada Unit Motor"
    description="Tambahkan unit motor pertama Anda"
  >
    {#snippet action()}
      <Button href="/motor/unit/new" variant="primary" class="mt-4">
        <Plus size={18} />
        Tambah Unit
      </Button>
    {/snippet}
  </EmptyState>
{:else}
  <Card>
    <CardBody class="p-0">
      <DataTable {columns}>
        {#each units as unit}
          <tr
            class="border-b border-border hover:bg-bg-tertiary/20 transition-colors"
          >
            <td class="px-4 py-3 font-semibold text-sm">{unit.platNomor}</td>
            <td class="px-4 py-3 text-sm"
              >{unit.jenis?.merk} {unit.jenis?.model}</td
            >
            <td class="px-4 py-3 text-sm"
              >{formatCurrency(unit.hargaSewa || 0)}</td
            >
            <td class="px-4 py-3">
              <Badge
                variant={MOTOR_STATUS_VARIANTS[unit.status] || "info"}
                text={unit.status}
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <Button
                  href="/motor/unit/{unit.id}/edit"
                  variant="secondary"
                  size="sm"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onclick={() => handleDelete(unit.id)}
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
