<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { unitMotorApi, jenisMotorApi } from "$lib/api";
    import type { JenisMotor, UnitMotor } from "$lib/types";
    import { Form, Input, Select } from "$lib/components/ui";

    let platNomor = $state("");
    let jenisId = $state("");
    let hargaSewa = $state<number | "">("");
    let status = $state("TERSEDIA");
    let jenisMotors: JenisMotor[] = $state([]);
    let isSaving = $state(false);

    onMount(async () => {
        const res = await jenisMotorApi.getAll({ limit: 100 });
        jenisMotors = res.data || [];
    });

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isSaving = true;
        try {
            await unitMotorApi.create({ platNomor, jenisId, hargaSewa: Number(hargaSewa), status: status as UnitMotor["status"] });
            goto("/motor/unit");
        } catch (err) { console.error(err); }
        finally { isSaving = false; }
    }
</script>

<Form title="Tambah Unit Motor" backHref="/motor/unit" isLoading={isSaving} {handleSubmit}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input id="platNomor" label="Plat Nomor" bind:value={platNomor} placeholder="AB 1234 CD" required />
        <Select id="jenisMotor" label="Jenis Motor" bind:value={jenisId} options={jenisMotors.map(j => ({ value: j.id, label: `${j.merk} ${j.model}` }))} placeholder="Pilih Jenis Motor" required />
        <Input id="harga" label="Harga Sewa (Rp)" type="number" bind:value={hargaSewa} placeholder="100000" min={0} required />
        <Select id="status" label="Status" bind:value={status} options={[
            { value: "TERSEDIA", label: "Tersedia" },
            { value: "DISEWA", label: "Disewa" },
            { value: "DIPESAN", label: "Dipesan/Booking" }
        ]} />
    </div>
</Form>