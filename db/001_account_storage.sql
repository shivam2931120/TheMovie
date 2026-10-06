CREATE TABLE IF NOT EXISTS account_features (
  user_id text NOT NULL,
  feature text NOT NULL,
  data jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 1,
  mutation_id text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, feature)
);
CREATE TABLE IF NOT EXISTS recommendation_events (
  user_id text NOT NULL,
  event_id uuid NOT NULL,
  item_id bigint NOT NULL CHECK (item_id > 0),
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  kind text NOT NULL CHECK (kind IN ('impression','click','rating','watch','rewatch','watchlist','dismiss','episode')),
  value double precision,
  source text NOT NULL DEFAULT 'app',
  model text,
  request_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);
CREATE INDEX IF NOT EXISTS recommendation_events_training ON recommendation_events(created_at, user_id);
CREATE TABLE IF NOT EXISTS recommendation_rate_limits (
  user_id text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL,
  PRIMARY KEY(user_id, window_start)
);
CREATE TABLE IF NOT EXISTS account_deletions (
  user_id text PRIMARY KEY,
  deleted_at timestamptz NOT NULL DEFAULT now()
);
