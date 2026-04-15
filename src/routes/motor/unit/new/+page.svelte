<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { unitMotorApi, jenisMotorApi } from "$lib/api";
    import type { JenisMotor } from "$lib/types";
    import { Form, Input, Select } from "$lib/components/ui";

    let platNomor = $state("");
    let jenisId = $state("");
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
            await unitMotorApi.create({ platNomor, jenisId });
            goto("/motor/unit");
        } catch (err) { console.error(err); }
        finally { isSaving = false; }
    }
</script>

<Form title="Tambah Unit Motor" backHref="/motor/unit" isLoading={isSaving} {handleSubmit}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input id="platNomor" label="Plat Nomor" bind:value={platNomor} placeholder="AB 1234 CD" required />
        <Select id="jenisMotor" label="Jenis Motor" bind:value={jenisId} options={jenisMotors.map(j => ({ value: j.id, label: `${j.merk} ${j.model}` }))} placeholder="Pilih Jenis Motor" required />
    </div>
</Form>
