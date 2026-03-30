<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { blogApi } from "$lib/api";
  import type { BlogPost } from "$lib/types";
  import { Form, Input, Textarea } from "$lib/components/ui";

  let blog: BlogPost | null = $state(null);
  let judul = $state("");
  let konten = $state("");
  let isLoading = $state(true);
  let isSaving = $state(false);

  const blogId = $derived(page.params.id ?? "");

  onMount(async () => {
    try {
      blog = await blogApi.getById(blogId);
      judul = blog.judul;
      konten = blog.konten || "";
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
      const formData = new FormData();
      formData.append("judul", judul);
      formData.append("konten", konten);
      await blogApi.update(blogId, formData);
      goto("/blog");
    } catch (err) {
      console.error(err);
    } finally {
      isSaving = false;
    }
  }
</script>

<Form
  title="Edit Artikel"
  backHref="/blog"
  isLoading={isLoading || isSaving}
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
