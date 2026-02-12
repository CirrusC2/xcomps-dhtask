<script>
    import { onDestroy } from 'svelte'
    import { CapacitorHttp } from "@capacitor/core"
    import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
    import { Preferences } from '@capacitor/preferences'
    import { compStore, viewStore } from "../lib/stores.js"
    import { APP_VERSION, taskFileName } from "../lib/consts.js"

    let taskDownloadSuccess = false

	let selectedClass = null  // { class_id, class_name, entrants }
	let selectedPilot = null  // entrant with tsk_path
	let lastCompIdForTask = null
	let showPilotList = false

	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = showPilotList ? 'hidden' : ''
	}
	onDestroy(() => {
		if (typeof document !== 'undefined') document.body.style.overflow = ''
	})

	$: comp = JSON.parse($compStore)
	$: if (comp.comp_id && comp.comp_id !== lastCompIdForTask) {
		lastCompIdForTask = comp.comp_id
		selectedClass = null
		selectedPilot = null
	}
	$: compClasses = comp?.classes ? Object.entries(comp.classes).map(([id, c]) => ({ class_id: id, ...c })) : []
	$: if (comp?.comp_id && compClasses.length === 1) {
		selectedClass = compClasses[0]
	}
	$: classEntrants = selectedClass?.entrants ?? []

    let downloadFolders = []

	function getPilotTskPath(pilot) {
		if (!pilot) return null
		if (pilot.tsk_path) return pilot.tsk_path
		const activeTask = pilot.task_files?.find((t) => t.active_task)
		return activeTask?.tsk_path ?? null
	}

	async function downloadTask() {
		const tskPath = getPilotTskPath(selectedPilot)
		if (!tskPath) return
        if (downloadFolders.length === 0) {
            alert("Please select at least one folder to download the task to.\n\nIf you don't see any folders above, no XCSoar folders were found in Android/media. This often happens on emulators—try on a real device with XCSoar installed.")
            return
        }
        console.log("Downloading task:", tskPath)
        console.log("To folders:", downloadFolders)

        const taskFileRes = await CapacitorHttp.get({ url: tskPath }) 

        if (taskFileRes.status != 200) {
            console.log(taskFileRes)
            alert(`Failed to fetch task file: ${taskFileRes.status} (Try restarting the app)`)
            return
        }

        for (const folder of downloadFolders) {
            const filePath = `Android/media/${folder.name}/${taskFileName}`

            try {
                const result = await Filesystem.writeFile({
                    path: filePath,
                    data: taskFileRes.data,
                    directory: Directory.ExternalStorage,
                    encoding: Encoding.UTF8
                })
    
                console.log(`Task file written to ${folder.name}:`, result)

                taskDownloadSuccess = true
                setTimeout(() => taskDownloadSuccess = false, 1500)
            } catch (e) {
                console.log(`Error writing task file to ${folder.name}:`, e)
                alert(`Unable to write task file to ${folder.name}: ` + e.message)
            }
        }
	}

    async function findSoarFolders() {
        try {
            const result = await Filesystem.readdir({
                path: "Android/media",
                directory: Directory.ExternalStorage
            })
            console.log("Read dir result:", result)

            var soarFolders = result.files.filter(info => info.name.includes('soar') && info.type == "directory")
                .map((info) => ({ name: info.name, preferred: false }))

            console.log("SOAR folders:", soarFolders)

            soarFolders = await checkPreferred(soarFolders)

            console.log("SOAR folders with preferred:", soarFolders)

            return soarFolders
        } catch (e) {
            alert('Unable to read SOAR folders: ' + e.message)
            console.log("Error reading SOAR folders:", e)
            return []
        }
    }

    async function checkPreferred(soarFolders) {
        // const preferredFoldersRaw = await Preferences.get({ key: "preferredFolders" })
        // const preferredFolders = JSON.parse(preferredFoldersRaw?.value || "[]")

        // console.log("Raw preferred folders from preferences:", preferredFoldersRaw)
        // console.log("preferred folders from preferences:", preferredFolders)

        // downloadFolders
        //     .push(...preferredFolders?.filter(f => soarFolders.some(sf => sf.name === f))?.map((name) => ({ name, preferred: true })) || [])

        // console.log("Download folders:", downloadFolders)

        // return soarFolders.map(folder => ({
        //     ...folder,
        //     preferred: preferredFolders?.includes(folder.name) || false
        // }))

        return await Promise.all(soarFolders.map(async (folder) => {
            const preferredRaw = await Preferences.get({ key: folder.name })
            var preferred = (preferredRaw?.value || "true") == "true" // true by default

            if (preferred) {
                downloadFolders.push(folder)
            }

            return {
                ...folder,
                preferred
            }
        }))
    }

    function handleToggle(e, soarFolder) {
        if (e.target.checked) {
            downloadFolders.push(soarFolder)

            // Preferences.set({ key: "preferredFolders", value: JSON.stringify(downloadFolders.map(f => f.name)) })
            Preferences.set({ key: soarFolder.name, value: "true" })
        } else {
            downloadFolders = downloadFolders.filter(f => f.name !== soarFolder.name)

            // Preferences.set({ key: "preferredFolders", value: JSON.stringify(downloadFolders.map(f => f.name)) })
            Preferences.set({ key: soarFolder.name, value: "false" })
        }
        console.log(downloadFolders)
    }
</script>

<div class="px-4 py-6 max-w-lg mx-auto flex flex-col gap-6">
	<!-- Save location -->
	<section class="bg-base-200/90 rounded-2xl border border-base-300/80 shadow-sm overflow-hidden">
		<div class="px-5 py-4 border-b border-base-300/80">
			<h2 class="font-semibold text-base text-base-content">Save location</h2>
			<p class="text-sm text-base-content/70 mt-0.5">Choose folder(s) to save the TSK file</p>
		</div>
		<div class="p-4">
			{#await findSoarFolders()}
				<div class="flex items-center gap-3 py-2">
					<div class="loading loading-spinner loading-sm text-primary"></div>
					<p class="text-sm text-base-content/80">Finding XCSoar folders…</p>
				</div>
			{:then soarFolders}
				{#if soarFolders.length > 0}
					<p class="text-xs font-medium text-base-content/60 uppercase tracking-wide mb-3">Folders with "soar" in the name</p>
					<div class="space-y-1">
						{#each soarFolders as soarFolder}
							<label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-base-300/50 active:bg-base-300/70 transition-colors">
								<input type="checkbox" class="toggle toggle-primary" checked={ soarFolder.preferred } on:change={ (e) => handleToggle(e, soarFolder) } />
								<span class="text-sm font-medium">{ soarFolder.name }</span>
							</label>
						{/each}
					</div>
				{:else}
					<div class="alert alert-warning shadow-sm">
						<div class="flex flex-col gap-2">
							<span class="font-semibold">No save location available</span>
							<p class="text-sm opacity-90">No XCSoar folders were found in Android/media. Install XCSoar from <a href="https://xcsoar.org/download" class="link link-hover" target="_blank" rel="noopener">xcsoar.org</a>.</p>
						</div>
					</div>
				{/if}
			{/await}
		</div>
	</section>

	<!-- Contest selection -->
	<button
		class="btn btn-primary btn-lg w-full rounded-xl shadow-md hover:shadow-lg transition-shadow font-semibold h-14 text-base"
		on:click={() => viewStore.set("comps")}
	>
		{ comp.comp_name ? comp.comp_name : "Select contest" }
	</button>

	<!-- Task selection -->
	<section class="bg-base-200/90 rounded-2xl border border-base-300/80 shadow-sm overflow-hidden">
		<div class="px-5 py-4 border-b border-base-300/80">
			<h2 class="font-semibold text-base text-base-content">Choose your task</h2>
			<p class="text-sm text-base-content/70 mt-0.5">Select class and pilot to download your task file</p>
		</div>
		<div class="p-4">
			{#if comp.comp_name}
				<div class="flex flex-col gap-4">
					<div class="dropdown dropdown-start w-full">
						<button type="button" tabindex="0" class="btn btn-outline btn-neutral w-full justify-between rounded-xl font-medium">
							<span class="truncate">{ selectedClass ? selectedClass.class_name : "Select class" }</span>
							<svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
						</button>
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<ul class="dropdown-content menu bg-base-200 rounded-xl border border-base-300 z-20 w-72 max-h-60 overflow-y-auto shadow-xl mt-2" tabindex="0">
							{#each compClasses as cls}
								<li><button on:click={() => { selectedClass = cls; selectedPilot = null; document.activeElement?.blur() }}>{ cls.class_name }</button></li>
							{/each}
						</ul>
					</div>

					{#if selectedClass}
						<button
							class="btn btn-outline btn-neutral w-full justify-between rounded-xl font-medium"
							on:click={() => showPilotList = true}
						>
							<span class="truncate">{ selectedPilot ? selectedPilot.name : "Select pilot" }</span>
							<svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
						</button>
					{/if}

					<div class="flex flex-col sm:flex-row gap-3 pt-2">
						<button
							on:click={() => downloadTask()}
							class="btn btn-primary flex-1 rounded-xl font-semibold { getPilotTskPath(selectedPilot) ? "" : "btn-disabled" }"
						>
							{ getPilotTskPath(selectedPilot) ? "Download task file" : "Select contest, class & pilot" }
						</button>
						{#if taskDownloadSuccess}
							<span class="flex items-center justify-center sm:justify-start gap-2 text-success font-semibold px-4">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
								Downloaded
							</span>
						{/if}
					</div>
				</div>
			{:else}
				<p class="text-sm text-base-content/70 py-2">Select a contest above to view tasks</p>
			{/if}
		</div>
	</section>

	<footer class="text-center pt-4">
		<p class="text-xs text-base-content/50">
			Task data from <a href="https://json.dhtask.com" class="link link-primary hover:underline">json.dhtask.com</a>
		</p>
		<p class="text-xs text-base-content/40 mt-1">XComps for DHTask v{ APP_VERSION }</p>
	</footer>
</div>

<!-- Pilot selection modal (bottom sheet for reliable scroll on Android) -->
{#if showPilotList}
	<div
		class="fixed inset-0 z-50 flex flex-col justify-end"
		role="dialog"
		aria-modal="true"
		aria-labelledby="pilot-modal-title"
	>
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			aria-label="Close"
			on:click={() => showPilotList = false}
		></button>
		<div class="relative z-10 bg-base-200 rounded-t-2xl border-t border-base-300 shadow-2xl flex flex-col max-h-[85vh] min-h-0">
			<div class="flex items-center justify-between px-5 py-4 border-b border-base-300 shrink-0">
				<h2 id="pilot-modal-title" class="font-semibold text-lg">Select pilot</h2>
				<button class="btn btn-ghost btn-sm btn-circle" aria-label="Close" on:click={() => showPilotList = false}>✕</button>
			</div>
			<div
				class="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden overscroll-contain p-2"
				style="-webkit-overflow-scrolling: touch; touch-action: pan-y; transform: translateZ(0);"
			>
				<ul class="menu menu-vertical">
					{#each classEntrants as entrant}
						<li>
							<button
								class="w-full text-left justify-start whitespace-normal rounded-xl px-4 py-3"
								on:click={() => {
									selectedPilot = entrant
									showPilotList = false
								}}
							>
								{ entrant.name }
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
{/if}