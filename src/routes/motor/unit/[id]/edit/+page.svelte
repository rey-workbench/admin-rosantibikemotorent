<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { unitMotorApi, jenisMotorApi } from "$lib/api";
  import type { JenisMotor, UnitMotor } from "$lib/types";
  import { Form, Input, Select } from "$lib/components/ui";

  let unit: UnitMotor | null = $state(null);
  let platNomor = $state("");
  let jenisId = $state("");
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
      status = unit.status;
    } catch (err) {
      console.error(err);
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
        status: status as UnitMotor["status"],
      });
      goto("/motor/unit");
    } catch (err) {
      console.error(err);
    } finally {
      isSaving = false;
    }
  }
</script>

<Form
  title="Edit Unit Motor"
  backHref="/motor/unit"
  isLoading={isLoading || isSaving}
  {handleSubmit}
>
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
      options={jenisMotors.map((j) => ({
        value: j.id,
        label: `${j.merk} ${j.model}`,
      }))}
      placeholder="Pilih Jenis Motor"
      required
    />
    <Select
      id="status"
      label="Status"
      bind:value={status}
      options={[
        { value: "TERSEDIA", label: "Tersedia" },
        { value: "DISEWA", label: "Disewa" },
        { value: "DIPESAN", label: "Dipesan/Booking" },
      ]}
    />
  </div>
</Form>
