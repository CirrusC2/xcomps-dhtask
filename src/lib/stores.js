import { writable } from "svelte/store"

const viewStore = writable("home")
const compStore = writable("{}")
const fetchStatusStore = writable("")

export { viewStore, compStore, fetchStatusStore }