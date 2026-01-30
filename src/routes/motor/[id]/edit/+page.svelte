<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { ArrowLeft, Save } from "lucide-svelte";
    import { jenisMotorApi } from "$lib/api";
    import type { JenisMotor } from "$lib/types";
    import {
        Card,
        CardBody,
        Button,
        Input,
        FileUpload,
    } from "$lib/components/ui";

    let motor: JenisMotor | null = $state(null);
    let merk = $state("");
    let model = $state("");
    let cc = $state<number | "">("");
    let imageFile: File | null = $state(null);
    let imagePreview = $state("");

    let isLoading = $state(true);
    let isSaving = $state(false);

    const motorId = $derived(page.params.id ?? "");

    onMount(async () => {
        try {
            motor = await jenisMotorApi.getById(motorId);
            merk = motor.merk;
            model = motor.model;
            cc = motor.cc;
            imagePreview = motor.gambar || "";
        } catch (err) {
            console.error("Error loading motor:", err);
        } finally {
            isLoading = false;
        }
    });

    function handleImageChange(file: File) {
        imageFile = file;
        imagePreview = URL.createObjectURL(file);
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isSaving = true;

        try {
            const formData = new FormData();
            formData.append("merk", merk);
            formData.append("model", model);
            formData.append("cc", String(cc));
            if (imageFile) formData.append("file", imageFile);

            await jenisMotorApi.update(motorId, formData);
            goto("/motor");
        } finally {
            isSaving = false;
        }
    }
</script>

<svelte:head>
    <title>Edit Jenis Motor - Rosantibike Motorent</title>
</svelte:head>

<div class="page-header">
    <div class="flex items-center gap-3">
        <Button href="/motor" variant="secondary">
            <ArrowLeft size={18} />
        </Button>
        <h1>Edit Jenis Motor</h1>
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
                        id="merk"
                        label="Merk"
                        bind:value={merk}
                        placeholder="Honda, Yamaha, dll"
                        required
                    />

                    <Input
                        id="model"
                        label="Model"
                        bind:value={model}
                        placeholder="Beat, Vario, NMAX, dll"
                        required
                    />

                    <Input
                        id="cc"
                        label="CC"
                        type="number"
                        bind:value={cc}
                        placeholder="110, 125, 155, dll"
                        min={50}
                        required
                    />

                    <FileUpload
                        label="Gambar Motor"
                        preview={imagePreview}
                        onchange={handleImageChange}
                    />
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button href="/motor" variant="secondary">Batal</Button>
                    <Button type="submit" variant="primary" loading={isSaving}>
                        <Save size={18} />
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </CardBody>
    </Card>
{/if}
