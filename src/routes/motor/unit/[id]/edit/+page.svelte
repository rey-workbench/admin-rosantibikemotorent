<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { ArrowLeft, Save } from "lucide-svelte";
    import { unitMotorApi, jenisMotorApi } from "$lib/api";
    import type { JenisMotor, UnitMotor } from "$lib/types";
    import { Card, CardBody, Button, Input, Select } from "$lib/components/ui";

    let unit: UnitMotor | null = $state(null);
    let platNomor = $state("");
    let jenisId = $state("");
    let hargaSewa = $state<number | "">("");
    let status = $state("TERSEDIA");

    let jenisMotors: JenisMotor[] = $state([]);
    let isLoading = $state(true);
    let isSaving = $state(false);

    const unitId = $derived(page.params.id ?? "");

    onMount(async () => {
        try {
            const [unitRes, jenisRes] = await Promise.all([
                unitMotorApi.getById(unitId),
                jenisMotorApi.getAll({ limit: 100 }),
            ]);

            unit = unitRes;
            jenisMotors = jenisRes.data || [];

            platNomor = unit.platNomor;
            jenisId = unit.jenisId || "";
            hargaSewa = unit.hargaSewa || "";
            status = unit.status;
        } catch (err) {
            console.error("Error loading:", err);
        } finally {
            isLoading = false;
        }
    });

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isSaving = true;

        try {
            await unitMotorApi.update(unitId, {
                platNomor,
                jenisId,
                hargaSewa: Number(hargaSewa),
                status: status as UnitMotor["status"],
            });
            goto("/motor/unit");
        } finally {
            isSaving = false;
        }
    }

    const jenisMotorOptions = $derived(
        jenisMotors.map((j) => ({
            value: j.id,
            label: `${j.merk} ${j.model}`,
        })),
    );

    const statusOptions = [
        { value: "TERSEDIA", label: "Tersedia" },
        { value: "DISEWA", label: "Disewa" },
        { value: "DIPESAN", label: "Dipesan/Booking" },
    ];
</script>

<svelte:head>
    <title>Edit Unit Motor - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <div class="flex items-center gap-3">
        <Button href="/motor/unit" variant="secondary">
            <ArrowLeft size={18} />
        </Button>
        <h1>Edit Unit Motor</h1>
    </div>
</div>

{#if isLoading}
    <div class="loading-page">
        <div class="loading-spinner"></div>
    </div>
{:else}
    <Card>
        <CardBody>
            <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                        id="platNomor"
                        label="Plat Nomor"
                        bind:value={platNomor}
                        placeholder="AB 1234 CD"
                        required
                    />

                    <Select
                        id="jenisMotor"
                        label="Jenis Motor"
                        bind:value={jenisId}
                        options={jenisMotorOptions}
                        placeholder="Pilih Jenis Motor"
                        required
                    />

                    <Input
                        id="harga"
                        label="Harga Sewa (Rp)"
                        type="number"
                        bind:value={hargaSewa}
                        placeholder="100000"
                        min={0}
                        required
                    />

                    <Select
                        id="status"
                        label="Status"
                        bind:value={status}
                        options={statusOptions}
                    />
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button href="/motor/unit" variant="secondary">Batal</Button
                    >
                    <Button type="submit" variant="primary" loading={isSaving}>
                        <Save size={18} />
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </CardBody>
    </Card>
{/if}
