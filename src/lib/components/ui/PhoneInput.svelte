<script lang="ts">
import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { onMount } from 'svelte';
import { fly } from 'svelte/transition';
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
	placeholder = '812 3456 7890',
	required = false,
	disabled = false,
	error = '',
	hint = '',
	class: className = '',
	onchange
}: Props = $props();

let actualId = $derived(id || `phone-${Math.random().toString(36).slice(2, 9)}`);
let country = $state('ID');
let display = $state('');
let isOpen = $state(false);
let search = $state('');
let container: HTMLElement | undefined = $state();
let inputEl: HTMLInputElement | undefined = $state();

const countries = getCountries()
	.map((c) => {
		try {
			return {
				code: c,
				name: new Intl.DisplayNames(['id', 'en'], { type: 'region' }).of(c) || c,
				dial: getCountryCallingCode(c)
			};
		} catch {
			return null;
		}
	})
	.filter(Boolean)
	.sort((a, b) => a!.name.localeCompare(b!.name)) as { code: string; name: string; dial: string }[];

let filtered = $derived(
	countries.filter(
		(c) =>
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.dial.includes(search) ||
			c.code.toLowerCase().includes(search.toLowerCase())
	)
);

let dialCode = $derived.by(() => {
	try {
		return getCountryCallingCode(country as any);
	} catch {
		return '62';
	}
});

function formatNumber(input: string, targetCountry = country) {
	const raw = input.trim();
	if (!raw) return { display: '', val: '', code: targetCountry };

	if (raw.startsWith('+')) {
		const ayt = new AsYouType();
		const formatted = ayt.input(raw);
		const detected = ayt.getCountry() || targetCountry;
		const dial = getCountryCallingCode(detected as any);
		const disp = formatted.startsWith(`+${dial}`) ? formatted.slice(dial.length + 1).trim() : formatted;
		return { display: disp, val: ayt.getNumberValue() || raw, code: detected };
	}

	const digits = raw.replaceAll(/\D/g, '');
	if (!digits) return { display: '', val: '', code: targetCountry };

	const dial = getCountryCallingCode(targetCountry as any);
	const nat = digits.startsWith('0') ? digits.slice(1) : digits;
	const ayt = new AsYouType(targetCountry as any);
	const formatted = ayt.input(`+${dial}${nat}`);
	const disp = formatted.startsWith(`+${dial}`) ? formatted.slice(dial.length + 1).trim() : formatted;

	return { display: disp || nat, val: `+${dial}${nat}`, code: targetCountry };
}

function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
	const res = formatNumber(e.currentTarget.value);
	country = res.code;
	display = res.display;
	value = res.val;
	onchange?.(value);
}

function chooseCountry(c: { code: string; dial: string }) {
	country = c.code;
	isOpen = false;
	search = '';
	if (display) {
		const res = formatNumber(display, c.code);
		display = res.display;
		value = res.val;
		onchange?.(value);
	}
	inputEl?.focus();
}

onMount(() => {
	if (value) {
		const parsed = parsePhoneNumberFromString(value);
		if (parsed?.country) {
			country = parsed.country;
			const res = formatNumber(parsed.nationalNumber || value, country);
			display = res.display;
		} else {
			const res = formatNumber(value);
			country = res.code;
			display = res.display;
		}
	}

	const onOutside = (e: MouseEvent) => {
		if (container && !container.contains(e.target as Node)) isOpen = false;
	};
	document.addEventListener('click', onOutside);
	return () => document.removeEventListener('click', onOutside);
});
</script>

<div class="flex flex-col gap-1.5 {className}" bind:this={container}>
	{#if label}
		<label for={actualId} class="text-sm font-medium text-text-secondary">
			{label}{#if required}<span class="text-danger">*</span>{/if}
		</label>
	{/if}

	<div class="relative">
		<div
			class="flex items-stretch bg-input hover:bg-white border border-black/10 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary rounded-xl transition-all {error
				? 'border-danger'
				: ''}"
		>
			<button
				type="button"
				onclick={() => { if (!disabled) isOpen = !isOpen; }}
				class="flex items-center gap-1.5 px-3 py-2.25 hover:bg-black/5 rounded-l-xl text-sm font-medium text-text-primary transition-all cursor-pointer select-none {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
				title="Pilih kode negara"
			>
				<span class="fi fi-{country.toLowerCase()} rounded-xs shadow-xs text-sm shrink-0"></span>
				<span class="text-xs font-semibold text-text-primary">+{dialCode}</span>
				<svg class="w-3 h-3 text-text-secondary transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			<input
				bind:this={inputEl}
				id={actualId}
				type="tel"
				inputmode="numeric"
				{placeholder}
				{required}
				{disabled}
				value={display}
				oninput={handleInput}
				class="w-full px-3 py-2.25 bg-transparent text-sm font-medium text-text-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
			/>
		</div>

		{#if isOpen}
			<div
				transition:fly={{ y: -6, duration: 150 }}
				class="absolute left-0 top-full mt-1.5 w-72 max-h-72 bg-white border border-black/10 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col"
			>
				<div class="p-2 border-b border-black/5 bg-surface">
					<input
						type="text"
						bind:value={search}
						placeholder="Cari negara / kode..."
						class="w-full px-3 py-1.5 bg-input border border-black/10 rounded-lg text-xs text-text-primary outline-none focus:border-primary"
						onclick={(e) => e.stopPropagation()}
					/>
				</div>

				<div class="overflow-y-auto max-h-56 divide-y divide-black/5">
					{#each filtered as c}
						<button
							type="button"
							onclick={() => chooseCountry(c)}
							class="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-surface transition-colors cursor-pointer {c.code === country ? 'bg-primary/5 text-primary font-semibold' : 'text-text-primary'}"
						>
							<span class="fi fi-{c.code.toLowerCase()} rounded-xs shadow-xs text-sm shrink-0"></span>
							<span class="flex-1 truncate">{c.name}</span>
							<span class="text-text-secondary font-mono text-[11px]">+{c.dial}</span>
						</button>
					{/each}
					{#if filtered.length === 0}
						<div class="px-3 py-4 text-center text-xs text-text-secondary">Negara tidak ditemukan</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-xs text-danger font-medium">{error}</p>
	{/if}
	{#if hint && !error}
		<p class="text-xs text-text-secondary">{hint}</p>
	{/if}
</div>
