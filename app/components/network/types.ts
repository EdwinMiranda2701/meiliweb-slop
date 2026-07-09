/**
 * Local types for the Meilisearch Network topology (>= 1.37).
 *
 * These local types keep the editable UI model explicit and normalize optional
 * fields returned by the client into stable empty records and nullable identity
 * values. Network updates still use the endpoint's complete PATCH payload because
 * the current client exposes only narrower, operation-specific update helpers.
 *
 * @see https://www.meilisearch.com/docs/reference/api/network
 */

export type Remote = {
  url: string
  searchApiKey: string | null
  writeApiKey: string | null
}

export type Shard = {
  remotes: string[]
}

export type NetworkTopology = {
  self: string | null
  leader: string | null
  remotes: Record<string, Remote>
  shards: Record<string, Shard>
}

/**
 * Partial payload for PATCH /network.
 *
 * - `remotes`: a `null` value removes that remote (auto-removed from shards too).
 * - `shards`: each entry supports `remotes` (replace all), `addRemotes`, `removeRemotes`,
 *   applied in that order. A `null` shard value removes the shard.
 */
export type NetworkUpdate = {
  self?: string | null
  leader?: string | null
  remotes?: Record<string, Partial<Remote> | null>
  shards?: Record<string, { remotes?: string[]; addRemotes?: string[]; removeRemotes?: string[] } | null>
}
