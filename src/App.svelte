<script>
    import { onMount } from "svelte"
    import { get } from "svelte/store"
    import CompsView from "./views/CompsView.svelte";
    import HomeView from "./views/HomeView.svelte";
    import { viewStore, compStore } from "./lib/stores";
    import { fetchDhtaskComps } from "./lib/fetch.js"

    onMount(async () => {
        const comp = JSON.parse(get(compStore) || "{}")
        if (!comp?.comp_id) {
            try {
                const comps = await fetchDhtaskComps()
                if (comps?.length === 1) {
                    compStore.set(JSON.stringify(comps[0]))
                }
            } catch (_) { /* ignore - user can select manually */ }
        }
    })
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg">
    <div class="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
        <img src="/dhtask_logo.png" alt="DHTask" class="h-8 w-auto" />
    </div>
</header>

<main class="min-h-screen pt-14 pb-6">
    {#if $viewStore == "home"}
        <HomeView/>
    {:else if $viewStore == "comps"}
        <CompsView/>
    {/if}
</main>
