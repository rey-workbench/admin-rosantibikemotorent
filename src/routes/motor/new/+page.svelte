<script lang="ts">
  import { goto } from "$app/navigation";
  import { Link, Upload as UploadIcon } from "lucide-svelte";
  import { jenisMotorApi } from "$lib/api";
  import { Form, Input, FileUpload } from "$lib/components/ui";

  let merk = $state("");
  let model = $state("");
  let cc = $state<number | "">("");
  let hargaSewa = $state<number | "">("");
  let uploadType = $state<"file" | "url">("file");
  let imageFile: File | null = $state(null);
  let imageUrl = $state("");
  let imagePreview = $state("");
  let isSaving = $state(false);

  function handleImageChange(file: File) {
    imageFile = file;
    imagePreview = URL.createObjectURL(file);
  }
  function handleUrlChange() {
    if (uploadType === "url") imagePreview = imageUrl;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSaving = true;
    try {
      const formData = new FormData();
      formData.append("merk", merk);
      formData.append("model", model);
      formData.append("cc", String(cc));
      formData.append("hargaSewa", String(hargaSewa));
      if (uploadType === "file" && imageFile)
        formData.append("file", imageFile);
      else if (uploadType === "url" && imageUrl)
        formData.append("gambar", imageUrl);
      await jenisMotorApi.create(formData);
      goto("/motor");
    } catch (err) {
      console.error(err);
    } finally {
      isSaving = false;
    }
  }
</script>

<Form
  title="Tambah Jenis Motor"
  backHref="/motor"
  isLoading={isSaving}
  {handleSubmit}
>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
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
    <Input
      id="hargaSewa"
      label="Harga Sewa / Hari"
      type="number"
      bind:value={hargaSewa}
      placeholder="100000"
      min={0}
      required
    />

    <div class="flex flex-col gap-3">
      <span class="text-sm font-medium text-text-secondary">Gambar Motor</span>
      <div class="flex gap-2 p-1 bg-bg-tertiary rounded-lg w-fit mb-2">
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all {uploadType ===
          'file'
            ? 'bg-white shadow-sm text-primary font-medium'
            : 'text-text-muted hover:text-text-secondary'}"
          onclick={() => (uploadType = "file")}
        >
          <UploadIcon size={14} /> File Upload
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all {uploadType ===
          'url'
            ? 'bg-white shadow-sm text-primary font-medium'
            : 'text-text-muted hover:text-text-secondary'}"
          onclick={() => (uploadType = "url")}
        >
          <Link size={14} /> URL Link
        </button>
      </div>
      {#if uploadType === "file"}
        <FileUpload
          label=""
          preview={imagePreview}
          onchange={handleImageChange}
        />
      {:else}
        <div class="flex flex-col gap-4">
          <Input
            id="imageUrl"
            label=""
            bind:value={imageUrl}
            oninput={handleUrlChange}
            placeholder="https://example.com/image.jpg"
          />
          {#if imageUrl}
            <div
              class="border-2 border-dashed border-border rounded-lg p-6 text-center"
            >
              <img
                src={imageUrl}
                alt="Preview"
                class="max-w-[200px] max-h-[150px] object-cover rounded-md mx-auto"
                onerror={(e) =>
                  ((e.target as HTMLImageElement).src =
                    "https://placehold.co/600x400?text=Invalid+URL")}
              />
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</Form>
