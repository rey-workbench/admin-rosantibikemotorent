<script lang="ts">
  import { Settings as SettingsIcon, Save } from "lucide-svelte";
  import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Alert,
  } from "$lib/components/ui";
  import { PageHeader } from "$lib/components/layout";

  let siteName = $state("Rosantibike Motorent");
  let siteDescription = $state("Rental Motor Terpercaya");
  let contactPhone = $state("");
  let contactEmail = $state("");
  let contactAddress = $state("");

  let isSaving = $state(false);
  let success = $state("");
  let error = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSaving = true;
    success = "";
    error = "";

    // TODO: Implement settings API
    setTimeout(() => {
      success = "Pengaturan berhasil disimpan";
      isSaving = false;
    }, 1000);
  }
</script>

<svelte:head>
  <title>Pengaturan - Rosantibike Motorent</title>
</svelte:head>

<PageHeader title="Pengaturan" />

<div class="grid gap-6">
  <Card>
    <CardHeader>
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <SettingsIcon size={20} />
        Informasi Website
      </h2>
    </CardHeader>
    <CardBody>
      <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
        {#if success}
          <Alert variant="success" message={success} />
        {/if}
        {#if error}
          <Alert variant="danger" message={error} />
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            id="siteName"
            label="Nama Website"
            bind:value={siteName}
            placeholder="Nama website Anda"
          />

          <Input
            id="siteDescription"
            label="Deskripsi"
            bind:value={siteDescription}
            placeholder="Deskripsi singkat website"
          />

          <Input
            id="phone"
            label="Nomor Telepon"
            type="tel"
            bind:value={contactPhone}
            placeholder="08xx xxxx xxxx"
          />

          <Input
            id="email"
            label="Email"
            type="email"
            bind:value={contactEmail}
            placeholder="email@example.com"
          />

          <Input
            id="address"
            label="Alamat"
            bind:value={contactAddress}
            placeholder="Alamat lengkap"
            class="md:col-span-2"
          />
        </div>

        <div class="flex justify-end pt-4 border-t border-border">
          <Button type="submit" variant="primary" loading={isSaving}>
            <Save size={18} />
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </CardBody>
  </Card>
</div>
