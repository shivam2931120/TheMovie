import type { UserResource } from "@clerk/types";

type UnsafeMetadata = UserResource["unsafeMetadata"];
type MetadataPatch = Partial<UnsafeMetadata> | ((current: UnsafeMetadata) => UnsafeMetadata);

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
        latestMetadataByUser.set(user.id, next);

        const updated = await user.update({ unsafeMetadata: next });
        latestMetadataByUser.set(user.id, updated.unsafeMetadata || next);

        return updated;
    };

    saveQueue = saveQueue.then(run, run);
    return saveQueue as Promise<UserResource>;
}
