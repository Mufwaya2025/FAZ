CREATE TABLE ads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'image', 'google_adsense', 'custom_script'
    image_url VARCHAR(255),
    target_url VARCHAR(255),
    ad_unit_id VARCHAR(255),
    slot_id VARCHAR(255),
    script_content TEXT,
    placement VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
