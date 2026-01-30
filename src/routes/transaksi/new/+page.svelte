<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { ArrowLeft, Save, Calculator } from "lucide-svelte";
    import { unitMotorApi, transaksiApi } from "$lib/api";
    import type { UnitMotor } from "$lib/types";
    import { Card, CardBody, Button, Input, Select } from "$lib/components/ui";

    let namaPenyewa = $state("");
    let noWhatsapp = $state("");
    let unitId = $state("");
    let tanggalMulai = $state("");
    let tanggalSelesai = $state("");
    let jamMulai = $state("08:00");
    let jamSelesai = $state("08:00");
    let helm = $state(0);
    let jasHujan = $state(0);

    let units: UnitMotor[] = $state([]);
    let isSaving = $state(false);
    let isCalculating = $state(false);
    let error = $state("");
    let estimasiBiaya = $state<number | null>(null);

    onMount(async () => {
        try {
            const res = await unitMotorApi.getAll({
                limit: 100,
                status: "TERSEDIA",
            });
            units = res.data || [];
        } catch (err) {
            console.error("Error loading units:", err);
            error = "Gagal memuat daftar motor";
        }
    });

    const unitOptions = $derived(
        units.map((u) => ({
            value: u.id,
            label: `${u.jenis?.merk || ""} ${u.jenis?.model || ""} - ${u.platNomor}`,
        })),
    );

    async function handleCalculate() {
        if (!unitId || !tanggalMulai || !tanggalSelesai) {
            error = "Pilih unit dan tanggal sewa terlebih dahulu";
            return;
        }
        isCalculating = true;
        error = "";
        try {
            const res = await transaksiApi.calculatePrice({
                unitId,
                tanggalMulai,
                tanggalSelesai,
                jamMulai,
                jamSelesai,
                helm: Number(helm),
                jasHujan: Number(jasHujan),
            });
            estimasiBiaya = res.totalBiaya;
        } catch (err: any) {
            console.error(err);
            error = err.response?.data?.message || "Gagal menghitung estimasi";
            estimasiBiaya = null;
        } finally {
            isCalculating = false;
        }
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isSaving = true;

        try {
            await transaksiApi.create({
                namaPenyewa,
                noWhatsapp,
                unitId,
                tanggalMulai,
                tanggalSelesai,
                jamMulai,
                jamSelesai,
                helm: Number(helm),
                jasHujan: Number(jasHujan),
            });
            goto("/transaksi");
        } catch (err: any) {
            console.error("Save error:", err);
        } finally {
            isSaving = false;
        }
    }

    function formatRupiah(amount: number) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    }
</script>

<svelte:head>
    <title>Input Transaksi Baru - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <div class="flex items-center gap-3">
        <Button href="/transaksi" variant="secondary">
            <ArrowLeft size={18} />
        </Button>
        <h1>Input Transaksi Baru</h1>
    </div>
</div>

<Card>
    <CardBody>
        <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="col-span-1 md:col-span-2">
                    <h3 class="text-lg font-semibold mb-3">Data Penyewa</h3>
                </div>

                <Input
                    id="namaPenyewa"
                    label="Nama Penyewa"
                    bind:value={namaPenyewa}
                    placeholder="Masukkan nama lengkap"
                    required
                />

                <Input
                    id="noWhatsapp"
                    label="Nomor WhatsApp"
                    bind:value={noWhatsapp}
                    placeholder="08xxxxxxxxxx"
                    required
                />

                <div class="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                    <h3 class="text-lg font-semibold mb-3">Detail Sewa</h3>
                </div>

                <Select
                    id="unitId"
                    label="Pilih Motor"
                    bind:value={unitId}
                    options={unitOptions}
                    placeholder="Pilih motor yang tersedia"
                    required
                    class="md:col-span-2"
                />

                <Input
                    id="tanggalMulai"
                    label="Tanggal Mulai"
                    type="date"
                    bind:value={tanggalMulai}
                    required
                />

                <Input
                    id="jamMulai"
                    label="Jam Mulai"
                    type="time"
                    bind:value={jamMulai}
                    required
                />

                <Input
                    id="tanggalSelesai"
                    label="Tanggal Selesai"
                    type="date"
                    bind:value={tanggalSelesai}
                    required
                />

                <Input
                    id="jamSelesai"
                    label="Jam Selesai"
                    type="time"
                    bind:value={jamSelesai}
                    required
                />

                <div class="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                    <h3 class="text-lg font-semibold mb-3">
                        Fasilitas Tambahan
                    </h3>
                </div>

                <Input
                    id="helm"
                    label="Jumlah Helm Tambahan"
                    type="number"
                    bind:value={helm}
                    min={0}
                    max={2}
                />

                <Input
                    id="jasHujan"
                    label="Jumlah Jas Hujan Tambahan"
                    type="number"
                    bind:value={jasHujan}
                    min={0}
                    max={2}
                />
            </div>

            <div class="flex flex-col gap-3 mt-4 border-t pt-4">
                {#if estimasiBiaya !== null}
                    <div
                        class="bg-primary/10 p-4 rounded-lg flex justify-between items-center text-primary border border-primary/20"
                    >
                        <span class="font-semibold">Estimasi Total Biaya:</span>
                        <span class="text-xl font-bold"
                            >{formatRupiah(estimasiBiaya)}</span
                        >
                    </div>
                {/if}

                <div class="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onclick={handleCalculate}
                        loading={isCalculating}
                    >
                        <Calculator size={18} />
                        Hitung Estimasi
                    </Button>
                    <Button type="submit" variant="primary" loading={isSaving}>
                        <Save size={18} />
                        Simpan Transaksi
                    </Button>
                </div>
            </div>
        </form>
    </CardBody>
</Card>
