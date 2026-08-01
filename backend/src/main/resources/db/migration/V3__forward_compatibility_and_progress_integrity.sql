-- Forward-only changes for databases that existed before Flyway was introduced.
-- V1 intentionally creates missing tables, but IF NOT EXISTS does not add
-- columns to tables created by the former Hibernate ddl-auto workflow.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE practice_problems ADD COLUMN IF NOT EXISTS examples JSONB;
ALTER TABLE practice_problems ADD COLUMN IF NOT EXISTS test_set_version VARCHAR(255);

ALTER TABLE forgot_password ADD COLUMN IF NOT EXISTS otp_consumed BOOLEAN;
ALTER TABLE forgot_password ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMP;
ALTER TABLE forgot_password ADD COLUMN IF NOT EXISTS reset_proof_hash VARCHAR(128);
ALTER TABLE forgot_password ADD COLUMN IF NOT EXISTS reset_proof_purpose VARCHAR(64);
ALTER TABLE forgot_password ADD COLUMN IF NOT EXISTS reset_proof_expiration_time TIMESTAMP;
ALTER TABLE forgot_password ADD COLUMN IF NOT EXISTS reset_proof_consumed BOOLEAN;
ALTER TABLE forgot_password ADD COLUMN IF NOT EXISTS request_count INTEGER;
ALTER TABLE forgot_password ADD COLUMN IF NOT EXISTS request_window_started_at TIMESTAMP;

ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS time_spent INTEGER;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE execution_receipts ADD COLUMN IF NOT EXISTS runtime DOUBLE PRECISION;
ALTER TABLE execution_receipts ADD COLUMN IF NOT EXISTS memory INTEGER;

-- Preserve one topic aggregate per learner while making the constraint safe for
-- existing databases that accumulated duplicates under read-then-insert.
DELETE FROM user_progress
 WHERE id IN (
    SELECT duplicate_id
      FROM (
        SELECT id AS duplicate_id,
               ROW_NUMBER() OVER (PARTITION BY user_id, topic_id ORDER BY id) AS row_number
          FROM user_progress
      ) duplicates
     WHERE row_number > 1
 );

ALTER TABLE user_progress
    ADD CONSTRAINT ux_user_progress_user_topic UNIQUE (user_id, topic_id);
