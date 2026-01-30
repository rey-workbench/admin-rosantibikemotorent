<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { ArrowLeft, Save } from "lucide-svelte";
    import { unitMotorApi, jenisMotorApi } from "$lib/api";
    import type { JenisMotor, UnitMotor } from "$lib/types";
    import { Card, CardBody, Button, Input, Select } from "$lib/components/ui";

    let platNomor = $state("");
    let jenisId = $state("");
    let hargaSewa = $state<number | "">("");
    let status = $state("TERSEDIA");

    let jenisMotors: JenisMotor[] = $state([]);
    let isSaving = $state(false);

    onMount(async () => {
        try {
            const res = await jenisMotorApi.getAll({ limit: 100 });
            jenisMotors = res.data || [];
        } catch (err) {
            console.error("Error loading jenis motor:", err);
        }
    });

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isSaving = true;

        try {
            await unitMotorApi.create({
                platNomor,
                jenisId,
                hargaSewa: Number(hargaSewa),
                status: status as UnitMotor["status"],
            });
            goto("/motor/unit");
        } catch (err: any) {
            console.error("Save error:", err);
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
    <title>Tambah Unit Motor - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <div class="flex items-center gap-3">
        <Button href="/motor/unit" variant="secondary">
            <ArrowLeft size={18} />
        </Button>
        <h1>Tambah Unit Motor</h1>
    </div>
</div>

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
                <Button href="/motor/unit" variant="secondary">Batal</Button>
                <Button type="submit" variant="primary" loading={isSaving}>
                    <Save size={18} />
                    Simpan
                </Button>
            </div>
        </form>
    </CardBody>
</Card>
