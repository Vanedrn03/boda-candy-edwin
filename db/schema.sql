-- Run once in the Neon SQL Editor. No guest data is public.
CREATE TABLE IF NOT EXISTS invitations (
 id BIGSERIAL PRIMARY KEY,
 token_hash TEXT NOT NULL UNIQUE,
 label TEXT NOT NULL,
 group_number INTEGER CHECK (group_number BETWEEN 1 AND 5),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS guests (
 id BIGSERIAL PRIMARY KEY,
 invitation_id BIGINT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 attending BOOLEAN,
 responded_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guests_invitation_idx ON guests(invitation_id);
-- Do not insert guest names or invitation tokens into source control.
