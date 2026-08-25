<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { blogApi } from '$lib/api';
import { Form, Input, MarkdownEditor, Select } from '$lib/components/ui';
import { toast } from '$lib/stores/toast';
import type { BlogPost } from '$lib/types';

let blog: BlogPost | null = $state(null);
let judul = $state('');
let konten = $state('');
let status = $state('TERBIT');
let isLoading = $state(true);
let isSaving = $state(false);

const blogId = $derived(page.params.id ?? '');

onMount(async () => {
	try {
		blog = await blogApi.getById(blogId);
		judul = blog.judul;
		konten = blog.konten || '';
		status = blog.status || 'TERBIT';
	} catch (err: any) {
		toast.error(err);
	} finally {
		isLoading = false;
	}
});

async function handleSubmit(e: Event) {
	e.preventDefault();
	isSaving = true;
	try {
		const formData = new FormData();
		formData.append('judul', judul);
		formData.append('konten', konten);
		formData.append('status', status);
		await blogApi.update(blogId, formData);
		goto('/blog');
	} catch (err: any) {
		toast.error(err);
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
  <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
    <div class="md:col-span-2">
      <Input
        id="judul"
        label="Judul"
        bind:value={judul}
        placeholder="Judul artikel"
        required
      />
    </div>
    <div>
      <Select
        id="status"
        label="Status Publikasi"
        bind:value={status}
        options={[
          { value: 'TERBIT', label: 'Published (Terbit)' },
          { value: 'DRAFT', label: 'Draft' }
        ]}
        required
      />
    </div>
    <div class="md:col-span-3">
      <MarkdownEditor
        id="konten"
        label="Konten Artikel"
        bind:value={konten}
        {blogId}
        placeholder="Tulis konten artikel markdown di sini (ketik '/' untuk menu cepat atau drag & drop gambar)..."
        required
      />
    </div>
  </div>
</Form>
