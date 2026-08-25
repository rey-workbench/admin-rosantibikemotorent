<script lang="ts">
import { Carta, MarkdownEditor } from 'carta-md';
import { code } from '@cartamd/plugin-code';
import { slash } from '@cartamd/plugin-slash';
import { attachment } from '@cartamd/plugin-attachment';
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
				return URL.createObjectURL(file);
			}
		})
	]
});
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={id} class="text-sm font-medium text-text-secondary">
			{label}
			{#if required}<span class="text-danger">*</span>{/if}
		</label>
	{/if}

	<div
		class="carta-theme-container rounded-xl border border-border bg-bg-secondary shadow-xs focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all {error
			? 'border-danger'
			: ''} {disabled ? 'opacity-60 pointer-events-none' : ''}"
	>
		<MarkdownEditor {carta} bind:value {placeholder} mode="tabs" />
	</div>

	{#if error}
		<p class="text-xs text-danger font-medium">{error}</p>
	{/if}
	{#if hint && !error}
		<p class="text-xs text-text-secondary">{hint}</p>
	{/if}
</div>
