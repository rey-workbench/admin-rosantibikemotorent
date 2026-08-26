<script lang="ts">
import { attachment } from '@cartamd/plugin-attachment';
import { code } from '@cartamd/plugin-code';
import { slash } from '@cartamd/plugin-slash';
import { Carta, MarkdownEditor } from 'carta-md';
import { onMount } from 'svelte';
import 'carta-md/default.css';
import '@cartamd/plugin-code/default.css';
import '@cartamd/plugin-slash/default.css';
import '@cartamd/plugin-attachment/default.css';
import { Check, Copy, Image as ImageIcon, Loader2, Trash2 } from '@lucide/svelte';
import { blogApi } from '$lib/api';
import { toast } from '$lib/stores/toast';

interface Props {
	id?: string;
	label?: string;
	value?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	hint?: string;
	class?: string;
	blogId?: string;
	onUpload?: (file: File) => Promise<string | null>;
}

let {
	id = '',
	label = '',
	value = $bindable(''),
	placeholder = 'Tulis konten artikel markdown di sini (ketik "/" untuk menu cepat, atau drag & drop gambar)...',
	required = false,
	disabled = false,
	error = '',
	hint = '',
	class: className = '',
	blogId,
	onUpload
}: Props = $props();

let isMounted = $state(false);
let deletingUrls = $state<Set<string>>(new Set());
let copiedUrl = $state<string | null>(null);

let imagesInContent = $derived.by(() => {
	if (!value) return [];
	const matches = [...value.matchAll(/!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g)];
	const uniqueMap = new Map<string, { alt: string; url: string; fullTag: string }>();
	for (const m of matches) {
		if (!uniqueMap.has(m[2])) {
			uniqueMap.set(m[2], {
				alt: m[1] || 'Gambar artikel',
				url: m[2],
				fullTag: m[0]
			});
		}
	}
	return Array.from(uniqueMap.values());
});

async function handleDeleteImage(img: { url: string; fullTag: string }) {
	if (!confirm('Hapus gambar ini dari Cloudinary dan konten artikel?')) return;

	const nextDeleting = new Set(deletingUrls);
	nextDeleting.add(img.url);
	deletingUrls = nextDeleting;

	try {
		await blogApi.deleteImage(img.url);
		const escapedUrl = img.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		value = value.replace(new RegExp(`!\\[.*?\\]\\(${escapedUrl}\\)`, 'g'), '').trim();
		toast.success('Gambar berhasil dihapus dari Cloudinary');
	} catch (err: any) {
		const msg = err?.response?.data?.message || err?.message || 'Gagal menghapus gambar';
		toast.error(msg);
	} finally {
		const next = new Set(deletingUrls);
		next.delete(img.url);
		deletingUrls = next;
	}
}

async function handleCopyTag(img: { url: string; fullTag: string }) {
	await navigator.clipboard.writeText(img.fullTag);
	copiedUrl = img.url;
	toast.success('Tag markdown disalin');
	setTimeout(() => {
		if (copiedUrl === img.url) copiedUrl = null;
	}, 2000);
}

const carta = new Carta({
	sanitizer: false,
	extensions: [
		code(),
		slash(),
		attachment({
			async upload(file: File) {
				if (onUpload) {
					return onUpload(file);
				}
				try {
					const url = await blogApi.uploadImage(file, blogId);
					toast.success('Gambar berhasil diunggah');
					return url;
				} catch (err: any) {
					const msg = err?.response?.data?.message || err?.message || 'Gagal mengunggah gambar';
					toast.error(msg);
					return null;
				}
			}
		})
	]
});

onMount(() => {
	isMounted = true;
});

let charCount = $derived((value || '').length);
let wordCount = $derived((value || '').trim() ? (value || '').trim().split(/\s+/).length : 0);
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={id} class="text-xs font-semibold uppercase tracking-wider text-text-secondary">
			{label}
			{#if required}
				<span class="text-danger">*</span>
			{/if}
		</label>
	{/if}

	<div
		class="carta-theme-container rounded-xl border border-black/10 bg-bg-secondary shadow-xs focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all overflow-hidden {error
			? 'border-danger focus-within:border-danger focus-within:ring-danger/10'
			: ''} {disabled ? 'opacity-50 pointer-events-none' : ''}"
	>
		{#if isMounted}
			<MarkdownEditor {carta} bind:value {placeholder} mode="tabs" />
		{:else}
			<div class="p-4 min-h-75 text-text-secondary text-sm flex items-center justify-center">
				Memuat editor...
			</div>
		{/if}
	</div>

	<div class="flex justify-between items-center px-1">
		<div class="text-xs text-text-secondary">
			{wordCount} kata &bull; {charCount} karakter
		</div>
	</div>

	{#if imagesInContent.length > 0}
		<div class="mt-2 p-3 bg-bg-secondary/70 border border-black/5 rounded-xl flex flex-col gap-2.5">
			<div class="flex items-center justify-between text-xs font-semibold text-text-secondary">
				<div class="flex items-center gap-1.5">
					<ImageIcon class="w-3.5 h-3.5 text-primary" />
					<span>Gambar Terlampir ({imagesInContent.length})</span>
				</div>
				<span class="text-[11px] font-normal text-text-secondary">Klik ikon tong sampah untuk auto-delete dari Cloudinary</span>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
				{#each imagesInContent as img (img.url)}
					<div class="flex items-center gap-2.5 p-2 bg-white/80 border border-black/5 rounded-lg shadow-xs overflow-hidden group">
						<img
							src={img.url}
							alt={img.alt}
							class="w-12 h-12 object-cover rounded-md bg-bg-secondary border border-black/5 shrink-0"
						/>
						<div class="flex-1 min-w-0">
							<p class="text-xs font-medium text-text-primary truncate">{img.alt}</p>
							<p class="text-[10px] text-text-secondary truncate">{img.url}</p>
						</div>
						<div class="flex items-center gap-1 shrink-0">
							<button
								type="button"
								class="p-1.5 text-text-secondary hover:text-text-primary hover:bg-black/5 rounded-md transition-colors"
								title="Salin tag markdown"
								onclick={() => handleCopyTag(img)}
							>
								{#if copiedUrl === img.url}
									<Check class="w-3.5 h-3.5 text-success" />
								{:else}
									<Copy class="w-3.5 h-3.5" />
								{/if}
							</button>
							<button
								type="button"
								class="p-1.5 text-danger/80 hover:text-danger hover:bg-danger/10 rounded-md transition-colors disabled:opacity-50"
								title="Hapus gambar dari Cloudinary"
								disabled={deletingUrls.has(img.url)}
								onclick={() => handleDeleteImage(img)}
							>
								{#if deletingUrls.has(img.url)}
									<Loader2 class="w-3.5 h-3.5 animate-spin" />
								{:else}
									<Trash2 class="w-3.5 h-3.5" />
								{/if}
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if error}
		<p class="text-xs text-danger font-medium">{error}</p>
	{/if}
	{#if hint && !error}
		<p class="text-xs text-text-secondary">{hint}</p>
	{/if}
</div>
