import type { UserResource } from "@clerk/types";

type UnsafeMetadata = UserResource["unsafeMetadata"];
type MetadataPatch = Partial<UnsafeMetadata> | ((current: UnsafeMetadata) => UnsafeMetadata);
const MAX_UNSAFE_METADATA_BYTES = 7 * 1024;

const latestMetadataByUser = new Map<string, UnsafeMetadata>();
let saveQueue: Promise<unknown> = Promise.resolve();

async function readLatestMetadata(user: UserResource) {
    const cached = latestMetadataByUser.get(user.id) || {};

    try {
        const reloaded = await user.reload();
        return {
            ...cached,
            ...(reloaded.unsafeMetadata || {}),
        };
    } catch {
        return {
            ...cached,
            ...(user.unsafeMetadata || {}),
        };
    }
}

export function saveUnsafeMetadata(user: UserResource, patch: MetadataPatch) {
    const run = async () => {
        const current = await readLatestMetadata(user);
        const next = typeof patch === "function" ? patch(current) : { ...current, ...patch };
        try {
            const metadataBytes = new TextEncoder().encode(JSON.stringify(next)).byteLength;
            if (metadataBytes > MAX_UNSAFE_METADATA_BYTES) {
                throw new Error("Account storage is full. Remove older saved items before syncing more.");
            }

            const updated = await user.update({ unsafeMetadata: next });
            latestMetadataByUser.set(user.id, updated.unsafeMetadata || next);
            return updated;
        } catch (error) {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("themovie-account-storage-warning", {
                    detail: { message: error instanceof Error && error.message.includes("storage is full")
                        ? error.message
                        : "Account sync failed. This change may not persist." },
                }));
            }
            throw error;
        }
    };

    saveQueue = saveQueue.then(run, run);
    return saveQueue as Promise<UserResource>;
}
