-- Hot-path indexes — keeps the app fast as user count grows.
-- Each one targets a query that runs on every page view or every poll tick.

-- Users
CREATE INDEX IF NOT EXISTS idx_users_role_active     ON users(role, "isActive");
CREATE INDEX IF NOT EXISTS idx_users_wilaya_online   ON users(wilaya, "isOnline") WHERE role = 'TRANSPORTER';
CREATE INDEX IF NOT EXISTS idx_users_created         ON users("createdAt" DESC);

-- Transport requests
CREATE INDEX IF NOT EXISTS idx_req_client_status     ON transport_requests("clientId", status);
CREATE INDEX IF NOT EXISTS idx_req_assigned          ON transport_requests("assignedTransporterId", status) WHERE "assignedTransporterId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_req_status_type       ON transport_requests(status, "transportType");
CREATE INDEX IF NOT EXISTS idx_req_service           ON transport_requests("serviceCategory", status);
CREATE INDEX IF NOT EXISTS idx_req_created           ON transport_requests("createdAt" DESC);

-- Bids
CREATE INDEX IF NOT EXISTS idx_bids_request          ON bids("requestId", status);
CREATE INDEX IF NOT EXISTS idx_bids_transporter      ON bids("transporterId", status);

-- Notifications (polled every 25s per user)
CREATE INDEX IF NOT EXISTS idx_notif_user_read       ON notifications("userId", read, "createdAt" DESC);

-- Ratings
CREATE INDEX IF NOT EXISTS idx_rating_transporter    ON ratings("transporterId");
