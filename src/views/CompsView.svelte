<script>
	import { fetchDhtaskComps } from "../lib/fetch.js"
	import { viewStore, compStore, fetchStatusStore } from "../lib/stores"
	import { onMount } from "svelte"

	let compsPromise = null

	onMount(() => {
		compsPromise = fetchDhtaskComps()
	})

	function setComp(comp) {
		compStore.set(JSON.stringify(comp))
		viewStore.set("home")
	}
</script>

<div class="px-4 py-6 pb-24 max-w-lg mx-auto">
	{#await compsPromise}
		<div class="flex flex-col items-center justify-center gap-4 py-12">
			<div class="loading loading-spinner loading-lg text-primary"></div>
			<p class="text-sm text-base-content/80">{$fetchStatusStore || "Fetching contests…"}</p>
		</div>
	{:then comps}
		{#if comps.length === 1}
			{ setComp(comps[0]) }
			<div class="flex flex-col items-center justify-center gap-4 py-12">
				<div class="loading loading-spinner loading-lg text-primary"></div>
				<p class="text-sm text-base-content/80">Opening contest…</p>
			</div>
		{:else}
		<div class="space-y-3">
			<h1 class="text-lg font-semibold text-base-content mb-2">Select contest</h1>
			{#each comps as comp}
				<button
					on:click={() => setComp(comp)}
					class="w-full p-4 bg-base-200/90 rounded-2xl border border-base-300/80 text-left hover:bg-base-300/60 active:bg-base-300/80 transition-colors shadow-sm hover:shadow-md"
				>
					<span class="font-medium text-base-content">{ comp.comp_name }</span>
				</button>
			{/each}
		</div>
		{/if}
	{:catch error}
		<div class="alert alert-error shadow-sm">
			<span class="font-semibold">Unable to load contests</span>
			<p class="text-sm opacity-90">{error.message}</p>
		</div>
	{/await}
</div>

<div class="fixed bottom-0 left-0 right-0 p-4 bg-base-200/95 backdrop-blur-sm border-t border-base-300 max-w-lg mx-auto">
	<button class="btn btn-outline btn-neutral w-full rounded-xl font-medium" on:click={() => viewStore.set("home")}>
		<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
		Back
	</button>
</div>