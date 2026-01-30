<script lang="ts">
    import { Upload } from "lucide-svelte";

    interface Props {
        label: string;
        preview?: string;
        accept?: string;
        onchange: (file: File) => void;
        class?: string;
    }

    let {
        label,
        preview = "",
        accept = "image/*",
        onchange,
        class: className = "",
    }: Props = $props();

    function handleChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            onchange(file);
        }
    }
</script>

<div class="flex flex-col gap-1.5 {className}">
    <span class="text-sm font-medium text-text-secondary">{label}</span>
    <div
        class="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
    >
        {#if preview}
            <img
                src={preview}
                alt="Preview"
                class="max-w-[200px] max-h-[150px] object-cover rounded-md mx-auto mb-4"
            />
        {/if}
        <label
            class="flex flex-col items-center gap-2 cursor-pointer text-text-muted hover:text-text-secondary transition-colors"
        >
            <Upload size={24} />
            <span class="text-sm">Klik untuk upload</span>
            <input type="file" {accept} onchange={handleChange} hidden />
        </label>
    </div>
</div>
