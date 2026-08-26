<script lang="ts">
import { Bike, Pencil, Plus, Search, Trash2 } from '@lucide/svelte';
import { onDestroy, onMount } from 'svelte';
import { jenisMotorApi } from '$lib/api';
import { websocketService } from '$lib/services/websocket';
import { Button, Card, CardBody, DataTable, EmptyState, Input, Loading } from '$lib/components/ui';
import { confirm } from '$lib/stores/confirm';
import { toast } from '$lib/stores/toast';
import type { JenisMotor } from '$lib/types';

let jenisMotors: JenisMotor[] = $state([]);
let isLoading = $state(true);
let search = $state('');

const columns = [
	{ key: 'gambar', label: 'Gambar' },
	{ key: 'merk', label: 'Merk' },
	{ key: 'model', label: 'Model' },
	{ key: 'cc', label: 'CC' },
	{ key: 'harga', label: 'Harga Sewa' },
	{ key: 'aksi', label: 'Aksi', class: 'w-24' }
];

let unsubscribe: (() => void) | undefined;

onMount(async () => {
	await loadData();
	unsubscribe = websocketService.onJenisMotorUpdate(() => loadData());
});

onDestroy(() => {
	unsubscribe?.();
});

async function loadData() {
	isLoading = true;
	try {
		const res = await jenisMotorApi.getAll({
			limit: 100,
			search: search || undefined
		});
		jenisMotors = res.data || [];
	} catch (error: any) {
		toast.error('Error loading jenis motor:', error);
	} finally {
		isLoading = false;
	}
}

async function handleDelete(id: string) {
	const ok = await confirm.show({
		title: 'Hapus Jenis Motor',
		message: 'Apakah Anda yakin ingin menghapus jenis motor ini?',
		type: 'danger',
		confirmText: 'Ya, Hapus'
	});

	if (!ok) return;

	try {
		await jenisMotorApi.delete(id);
		await loadData();
	} catch (error: any) {
		toast.error('Error deleting:', error);
	}
}

function handleSearch() {
	loadData();
}
</script>

<svelte:head>
    <title>Jenis Motor - Rosantibike Motorent</title>
</svelte:head>

<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
        <h1 class="text-2xl font-bold text-text-primary">Jenis Motor</h1>
        <p class="text-text-secondary text-sm">Kelola kategori dan tipe motor yang tersedia</p>
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative min-w-60">
            <Input
                id="search"
                bind:value={search}
                placeholder="Cari motor..."
                onkeydown={(e) => e.key === "Enter" && handleSearch()}
                class="pr-10"
            />
            <button
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                onclick={handleSearch}
            >
                <Search size={18} />
            </button>
        </div>
        <Button href="/motor/new" variant="primary">
            <Plus size={18} />
            Tambah Motor
        </Button>
    </div>
</div>

{#if isLoading}
    <Loading />
{:else if jenisMotors.length === 0}
    <EmptyState
        icon={Bike}
        title="Belum Ada Jenis Motor"
        description="Tambahkan jenis motor pertama Anda"
    >
        {#snippet action()}
            <Button href="/motor/new" variant="primary" class="mt-4">
                <Plus size={18} />
                Tambah Motor
            </Button>
        {/snippet}
    </EmptyState>
{:else}
    <Card>
        <CardBody class="p-0">
            <DataTable {columns}>
                {#each jenisMotors as motor}
                    <tr class="border-b border-border hover:bg-bg-tertiary/20 transition-colors">
                        <td class="px-4 py-3">
                            {#if motor.gambar}
                                <img loading="lazy" decoding="async" src={motor.gambar} alt={motor.model} class="w-16 h-10 object-cover rounded" />
                            {:else}
                                <div class="w-16 h-10 bg-bg-tertiary rounded"></div>
                            {/if}
                        </td>
                        <td class="px-4 py-3 font-semibold text-sm">{motor.merk}</td>
                        <td class="px-4 py-3 text-sm">{motor.model}</td>
                        <td class="px-4 py-3 text-sm">{motor.cc} cc</td>
                        <td class="px-4 py-3 text-sm">Rp {motor.hargaSewa?.toLocaleString("id-ID") || 0}</td>
                        <td class="px-4 py-3">
                            <div class="flex gap-2">
                                <Button href="/motor/{motor.id}/edit" variant="secondary" size="sm">
                                    <Pencil size={16} />
                                </Button>
                                <Button variant="danger" size="sm" onclick={() => handleDelete(motor.id)}>
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
