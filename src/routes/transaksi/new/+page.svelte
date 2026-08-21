<script lang="ts">
  import { toast } from '$lib/stores/toast';
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
    import { unitMotorApi, transaksiApi } from "$lib/api";
  import type { UnitMotor, StatusTransaksi } from "$lib/types";
  import { Form, Input, Select } from "$lib/components/ui";
  import { formatCurrency } from "$lib/utils/formatters";

  let namaPenyewa = $state("");
  let noWhatsapp = $state("");
  let status = $state<StatusTransaksi>("PENDING_DP");
  let unitId = $state("");
  let tanggalMulai = $state("");
  let tanggalSelesai = $state("");
  let jamMulai = $state("08:00");
  let jamSelesai = $state("08:00");
  let helm = $state(0);
  let jasHujan = $state(0);

  let units: UnitMotor[] = $state([]);
  let isSaving = $state(false);
    let estimasiBiaya = $state<number | null>(null);
  let rincian = $state<any>(null);
  let errorMsg = $state<string | null>(null);

  onMount(async () => {
    const res = await unitMotorApi.getAll({ limit: 100 });
    units = res.data || [];
  });

  async function handleCalculate() {
    if (!unitId || !tanggalMulai || !tanggalSelesai) {
      estimasiBiaya = null;
      rincian = null;
      return;
    }
    
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
      rincian = res.rincian;
    } catch (err) {
      toast.error(err);
      estimasiBiaya = null;
      rincian = null;
    } finally {
      
    }
  }

  $effect(() => {
    
    handleCalculate();
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSaving = true;
    errorMsg = null;
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
        status,
      });
      goto("/transaksi");
    } catch (err: any) {
      toast.error(err);
      errorMsg =
        err?.response?.data?.userErrorMsg || err?.response?.data?.message;
    } finally {
      isSaving = false;
    }
  }
</script>

<Form
  title="Input Transaksi Baru"
  backHref="/transaksi"
  isLoading={isSaving}
  {handleSubmit}
>
  {#if errorMsg}
    <div
      class="bg-danger-50 text-danger-600 p-4 rounded-lg mb-4 text-sm font-medium"
    >
      {errorMsg}
    </div>
  {/if}
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
    <Select
      id="status"
      label="Status Transaksi"
      bind:value={status}
      options={[
        { value: "PENDING_DP", label: "Pending DP" },
        { value: "DP_DIBAYAR", label: "DP Dibayar" },
        { value: "LUNAS", label: "Lunas" },
        { value: "AKTIF", label: "Aktif (Motor Diambil)" },
        { value: "OVERDUE", label: "Overdue" },
        { value: "SELESAI", label: "Selesai" },
        { value: "PENDING", label: "Pending" },
        { value: "BATAL", label: "Batal" },
      ]}
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

    {#if estimasiBiaya !== null && rincian}
      <div
        class="mt-6 border border-border rounded-lg bg-bg-tertiary/20 p-5 col-span-1 md:col-span-2"
      >
        <h4
          class="text-md font-semibold text-text-primary mb-3 pb-2 border-b border-border"
        >
          Perincian Estimasi Biaya
        </h4>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between text-text-secondary">
            <span>Durasi Sewa:</span>
            <span class="font-medium text-text-primary">
              {rincian.jumlahHari} Hari {rincian.jamTambahan > 0
                ? `+ ${rincian.jamTambahan} Jam`
                : ""}
            </span>
          </div>
          <div class="flex justify-between text-text-secondary">
            <span
              >Biaya Sewa ({rincian.jumlahHari} hari x {formatCurrency(
                rincian.hargaPerHari,
              )}):</span
            >
            <span class="font-medium text-text-primary">
              {formatCurrency(rincian.jumlahHari * rincian.hargaPerHari)}
            </span>
          </div>
          {#if rincian.jamTambahan > 0}
            <div class="flex justify-between text-text-secondary">
              <span
                >Biaya Jam Tambahan ({rincian.jamTambahan} jam x {formatCurrency(
                  rincian.dendaPerJam,
                )}):</span
              >
              <span class="font-medium text-text-primary">
                {formatCurrency(rincian.biayaJamTambahan)}
              </span>
            </div>
          {/if}
          <div class="flex justify-between text-text-secondary">
            <span>Fasilitas Helm ({helm} pcs):</span>
            <span class="font-medium text-text-primary">Gratis</span>
          </div>
          <div class="flex justify-between text-text-secondary">
            <span>Fasilitas Jas Hujan ({jasHujan} pcs):</span>
            <span class="font-medium text-text-primary">Gratis</span>
          </div>
          <div
            class="flex justify-between pt-3 border-t border-border text-base font-bold text-text-primary"
          >
            <span>Total Estimasi:</span>
            <span class="text-xl text-primary font-bold"
              >{formatCurrency(estimasiBiaya)}</span
            >
          </div>
        </div>
      </div>
    {/if}
  </div>
</Form>
