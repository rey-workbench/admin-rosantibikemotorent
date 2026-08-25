<script lang="ts">
import { Carta, MarkdownEditor } from 'carta-md';
import { code } from '@cartamd/plugin-code';
import { slash } from '@cartamd/plugin-slash';
import { attachment } from '@cartamd/plugin-attachment';
import { blogApi } from '$lib/api';
import 'carta-md/default.css';
import '@cartamd/plugin-code/default.css';
import '@cartamd/plugin-slash/default.css';
import '@cartamd/plugin-attachment/default.css';

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
					return url;
				} catch (err: any) {
					console.error('Upload image failed:', err);
					return null;
				}
			}
		})
	]
});

let charCount = $derived((value || '').length);
let wordCount = $derived((value || '').trim() ? (value || '').trim().split(/\s+/).length : 0);
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={id} class="text-sm font-medium text-text-secondary">
			{label}
			{#if required}<span class="text-danger">*</span>{/if}
		</label>
	{/if}

	<div
		class="carta-theme-container rounded-xl border border-black/10 bg-bg-secondary shadow-xs focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all overflow-hidden {error
			? 'border-danger'
			: ''} {disabled ? 'opacity-60 pointer-events-none' : ''}"
	>
		<MarkdownEditor
			{carta}
			bind:value
			{placeholder}
			mode="tabs"
			userLabels={{ writeTab: 'Tulis', previewTab: 'Pratinjau' }}
		/>

		<!-- Editor Footer / Status Bar -->
		<div
			class="flex items-center justify-between px-4 py-2 border-t border-black/5 bg-bg-primary/50 text-xs text-text-secondary select-none"
		>
			<span class="flex items-center gap-1.5">
				<svg class="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 1118 0z" />
				</svg>
				<span>Markdown didukung &bull; Ketik <kbd class="px-1 py-0.5 bg-bg-secondary border border-black/10 rounded text-[10px] font-mono font-semibold text-text-primary">/</kbd> untuk menu cepat</span>
			</span>
			<span class="font-medium font-mono text-[11px] text-text-secondary">
				{wordCount} kata &bull; {charCount} karakter
			</span>
		</div>
	</div>

	{#if error}
		<p class="text-xs text-danger font-medium">{error}</p>
	{/if}
	{#if hint && !error}
		<p class="text-xs text-text-secondary">{hint}</p>
	{/if}
</div>
