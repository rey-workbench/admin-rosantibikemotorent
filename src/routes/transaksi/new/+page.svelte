<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { Calculator } from "lucide-svelte";
  import { unitMotorApi, transaksiApi } from "$lib/api";
  import type { UnitMotor } from "$lib/types";
  import { Form, Input, Select } from "$lib/components/ui";

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
  let estimasiBiaya = $state<number | null>(null);

  onMount(async () => {
    const res = await unitMotorApi.getAll({ limit: 100, status: "TERSEDIA" });
    units = res.data || [];
  });

  async function handleCalculate() {
    if (!unitId || !tanggalMulai || !tanggalSelesai) return;
    isCalculating = true;
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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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

<Form
  title="Input Transaksi Baru"
  backHref="/transaksi"
  isLoading={isSaving}
  {handleSubmit}
>
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
      options={units.map((u) => ({
        value: u.id,
        label: `${u.jenis?.merk || ""} ${u.jenis?.model || ""} - ${u.platNomor}`,
      }))}
      placeholder="Pilih motor"
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
      <h3 class="text-lg font-semibold mb-3">Fasilitas Tambahan</h3>
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

  {#if estimasiBiaya !== null}
    <div
      class="bg-primary/10 p-4 rounded-lg flex justify-between items-center text-primary border border-primary/20 mt-4"
    >
      <span class="font-semibold">Estimasi Total Biaya:</span>
      <span class="text-xl font-bold">{formatRupiah(estimasiBiaya)}</span>
    </div>
  {/if}

  <div class="flex justify-end gap-3 mt-4">
    <button
      type="button"
      class="btn-secondary"
      onclick={handleCalculate}
      disabled={isCalculating}
    >
      <Calculator size={18} /> Hitung Estimasi
    </button>
  </div>
</Form>
