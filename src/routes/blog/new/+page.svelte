<script lang="ts">
import { goto } from '$app/navigation';
import { blogApi } from '$lib/api';
import { Form, Input, MarkdownEditor, Select } from '$lib/components/ui';
import { toast } from '$lib/stores/toast';

let judul = $state('');
let konten = $state('');
let status = $state('TERBIT');
let isSaving = $state(false);

async function handleSubmit(e: Event) {
	e.preventDefault();
	isSaving = true;
	try {
		const formData = new FormData();
		formData.append('judul', judul);
		formData.append('konten', konten);
		formData.append('status', status);
		await blogApi.create(formData);
		goto('/blog');
	} catch (err: any) {
		toast.error(err);
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
        placeholder="Tulis konten artikel markdown di sini (ketik '/' untuk menu cepat atau drag & drop gambar)..."
        required
      />
    </div>
  </div>
</Form>
