<script lang="ts">
  import { goto } from "$app/navigation";
  import { blogApi } from "$lib/api";
  import { Form, Input, Textarea } from "$lib/components/ui";

  let judul = $state("");
  let konten = $state("");
  let isSaving = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSaving = true;
    try {
      const formData = new FormData();
      formData.append("judul", judul);
      formData.append("konten", konten);
      await blogApi.create(formData);
      goto("/blog");
    } catch (err) {
      console.error(err);
    } finally {
      isSaving = false;
    }
  }
</script>

<Form
  title="Tulis Artikel Baru"
  backHref="/blog"
  isLoading={isSaving}
  {handleSubmit}
>
  <div class="grid grid-cols-1 gap-5">
    <Input
      id="judul"
      label="Judul"
      bind:value={judul}
      placeholder="Judul artikel"
      required
    />
    <Textarea
      id="konten"
      label="Konten"
      bind:value={konten}
      placeholder="Konten artikel..."
      rows={10}
      required
    />
  </div>
</Form>
