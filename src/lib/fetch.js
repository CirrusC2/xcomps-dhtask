import { CapacitorHttp } from "@capacitor/core"
import { DHTASK_JSON_URL } from "./consts.js"
import { fetchStatusStore } from "./stores.js"

async function fetchDhtaskComps() {
    try {
        fetchStatusStore.set("Querying json.dhtask.com…")

        const res = await CapacitorHttp.get({
            url: DHTASK_JSON_URL,
            connectTimeout: 30000,
            readTimeout: 60000
        })

        fetchStatusStore.set("Connected to json.dhtask.com")

        if (res.status != 200) {
            throw new Error("Failed to fetch contests from " + DHTASK_JSON_URL + ": " + res.status)
        }

        fetchStatusStore.set("Loading contests…")

        // CapacitorHttp may return data as string on Android - parse if needed
        let comps = res.data
        if (typeof comps === "string") {
            try {
                comps = JSON.parse(comps)
            } catch (e) {
                throw new Error("Invalid response from " + DHTASK_JSON_URL)
            }
        }
        if (!Array.isArray(comps)) {
            throw new Error("Invalid response from " + DHTASK_JSON_URL)
        }

        return comps
    } finally {
        fetchStatusStore.set("")
    }
}

export { fetchDhtaskComps }
