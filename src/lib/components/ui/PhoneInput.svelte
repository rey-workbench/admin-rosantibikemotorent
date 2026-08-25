<script lang="ts">
import { AsYouType, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { onMount } from 'svelte';
import 'flag-icons/css/flag-icons.min.css';

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
	onchange?: (val: string) => void;
}

let {
	id = '',
	label = 'Nomor WhatsApp',
	value = $bindable(''),
	placeholder = '0812-3456-7890 atau +44 7911 123456',
	required = false,
	disabled = false,
	error = '',
	hint = '',
	class: className = '',
	onchange
}: Props = $props();

let actualId = $derived(id || `phone-${Math.random().toString(36).slice(2, 9)}`);
let currentCountry = $state('ID');
let formattedDisplay = $state('');

function processInput(input: string) {
	if (!input) {
		formattedDisplay = '';
		currentCountry = 'ID';
		value = '';
		onchange?.('');
		return;
	}

	const trimmed = input.trim();
	const asYouType = new AsYouType('ID');
	const formatted = asYouType.input(trimmed);
	const detectedCountry = asYouType.getCountry() || 'ID';
	const numberValue = asYouType.getNumberValue();

	currentCountry = detectedCountry;
	formattedDisplay = formatted;

	if (numberValue) {
		value = numberValue;
	} else {
		const cleanDigits = trimmed.replaceAll(/\D/g, '');
		if (cleanDigits.startsWith('0')) {
			value = `+62${cleanDigits.slice(1)}`;
		} else if (cleanDigits.startsWith('62')) {
			value = `+${cleanDigits}`;
		} else if (trimmed.startsWith('+')) {
			value = `+${cleanDigits}`;
		} else {
			value = `+62${cleanDigits}`;
		}
	}

	onchange?.(value);
}

function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
	processInput(e.currentTarget.value);
}

onMount(() => {
	if (value) {
		const parsed = parsePhoneNumberFromString(value);
		if (parsed) {
			currentCountry = parsed.country || 'ID';
			const asYouType = new AsYouType(currentCountry as any);
			formattedDisplay = asYouType.input(value);
		} else {
			processInput(value);
		}
	}
});

let callingCode = $derived.by(() => {
	try {
		return getCountryCallingCode(currentCountry as any);
	} catch {
		return '62';
	}
});
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={actualId} class="text-sm font-medium text-text-secondary">
			{label}
			{#if required}<span class="text-danger">*</span>{/if}
		</label>
	{/if}

	<div class="relative">
		<div
			class="flex items-center bg-input hover:bg-white border border-black/10 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary rounded-xl transition-all {error
				? 'border-danger'
				: ''}"
		>
			<!-- Auto-Detected Flag & Dial Code -->
			<div class="flex items-center gap-2 pl-3.5 pr-2 py-2.25 select-none">
				<span class="fi fi-{currentCountry.toLowerCase()} rounded-xs shadow-xs text-sm shrink-0"></span>
				<span class="text-xs font-semibold text-text-primary">+{callingCode}</span>
			</div>

			<!-- Single Auto-Detecting As-You-Type Input Field -->
			<input
				id={actualId}
				type="tel"
				inputmode="numeric"
				{placeholder}
				{required}
				{disabled}
				value={formattedDisplay}
				oninput={handleInput}
				class="w-full pr-3.5 py-2.25 bg-transparent text-sm font-medium text-text-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
			/>
		</div>
	</div>

	{#if error}
		<p class="text-xs text-danger font-medium">{error}</p>
	{/if}
	{#if hint && !error}
		<p class="text-xs text-text-secondary">{hint}</p>
	{/if}
</div>
