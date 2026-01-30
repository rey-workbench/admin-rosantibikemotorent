<script lang="ts">
    import { onMount } from "svelte";
    import { Plus, Pencil, Trash2, Truck } from "lucide-svelte";
    import { unitMotorApi } from "$lib/api";
    import type { UnitMotor } from "$lib/types";
    import { Card, CardBody, Button, Badge } from "$lib/components/ui";
    import { confirm } from "$lib/stores/confirm";

    let units: UnitMotor[] = $state([]);
    let isLoading = $state(true);

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

    function getStatusVariant(
        status: string,
    ): "success" | "warning" | "danger" | "info" {
        switch (status) {
            case "tersedia":
                return "success";
            case "disewa":
                return "warning";
            case "perbaikan":
                return "danger";
            default:
                return "info";
        }
    }
</script>

<svelte:head>
    <title>Unit Motor - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <h1>Unit Motor</h1>
    <Button href="/motor/unit/new" variant="primary">
        <Plus size={18} />
        Tambah Unit
    </Button>
</div>

{#if isLoading}
    <div class="loading-page">
        <div class="loading-spinner"></div>
    </div>
{:else if units.length === 0}
    <div class="empty-state">
        <div class="empty-state-icon"><Truck size={48} /></div>
        <h3>Belum Ada Unit Motor</h3>
        <p>Tambahkan unit motor pertama Anda</p>
        <Button href="/motor/unit/new" variant="primary" class="mt-4">
            <Plus size={18} />
            Tambah Unit
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
                                >Plat Nomor</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Jenis Motor</th
                            >
                            <th
                                class="text-left px-4 py-3 font-semibold text-text-secondary text-sm border-b border-border"
                                >Harga Sewa</th
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
                        {#each units as unit}
                            <tr
                                class="border-b border-border hover:bg-bg-tertiary/20 transition-colors"
                            >
                                <td class="px-4 py-3 font-semibold text-sm"
                                    >{unit.platNomor}</td
                                >
                                <td class="px-4 py-3 text-sm">
                                    {unit.jenis?.merk}
                                    {unit.jenis?.model}
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    Rp {unit.hargaSewa?.toLocaleString(
                                        "id-ID",
                                    ) || 0}
                                </td>
                                <td class="px-4 py-3">
                                    <Badge
                                        variant={getStatusVariant(unit.status)}
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
                                            onclick={() =>
                                                handleDelete(unit.id)}
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
