-- Dhanalaxmi Group — WhatsApp Leads (SQL)
-- Every WhatsApp action on the website first collects a reference, the client's
-- name and mobile number (plus date and time slot for site visits) and then
-- opens WhatsApp with the message prepared.
--
-- The browser keeps a local copy in localStorage under "dl_whatsapp_leads" so a
-- lead is never lost if WhatsApp does not open. In production, POST the same
-- object to a backend that writes into this table.

CREATE TABLE IF NOT EXISTS whatsapp_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,     -- e.g. DL-1A2B3C
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    product_id TEXT,                    -- prop_101 ... prop_105 (NULL for general enquiry)
    product_name TEXT,
    visit_date TEXT,                    -- YYYY-MM-DD for site visits
    visit_time TEXT,                    -- e.g. 11:30 AM
    source TEXT,                        -- which button/page opened WhatsApp
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_product ON whatsapp_leads (product_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_created ON whatsapp_leads (created_at);
