-- ============================================================================
-- Seed data: default admin account + initial catalog
--
-- SECURITY: this password is committed to source control - fine for local/dev
-- use, but change it immediately in any shared or production environment.
-- Login identifier "aelalami" / password "abdo@3214" (bcrypt hash below).
-- ============================================================================

INSERT INTO users (email, full_name, phone, password_hash, role, enabled)
VALUES (
    'aelalami',
    'GiftMe Admin',
    NULL,
    '$2a$10$lR4r6xiGET2yE7tqVJ/XnOFYnRk0zKQjDfFi3CRSqR9r87Q0l07nC',
    'ADMIN',
    TRUE
);

INSERT INTO products (name, slug, description, short_description, price, category, stock, active, main_image, customization_enabled)
VALUES
(
    'Personalized Puzzle',
    'personalized-puzzle',
    'Sublimation Puzzle 29x20cm. Turn your favorite photo into a beautiful keepsake puzzle - a unique, personal gift for any occasion.',
    'Sublimation Puzzle 29x20cm',
    149.00,
    'Puzzles',
    100,
    TRUE,
    NULL,
    TRUE
),
(
    'Personalized Mug',
    'personalized-mug',
    'A custom ceramic mug printed with your own photo, text, or design. Dishwasher and microwave safe.',
    'Custom photo mug',
    99.00,
    'Mugs',
    150,
    TRUE,
    NULL,
    TRUE
),
(
    'QR Memory Experience',
    'qr-memory-experience',
    'A scannable keepsake linked to a private online memory page featuring photos, videos, audio messages and music - relive the moment anytime.',
    'Scan to relive the memory',
    179.00,
    'Memories',
    100,
    TRUE,
    NULL,
    TRUE
);
