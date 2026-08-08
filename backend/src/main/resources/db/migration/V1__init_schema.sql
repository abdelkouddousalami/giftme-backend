-- ============================================================================
-- GiftMe initial schema
-- ============================================================================

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL,
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ  NOT NULL,
    revoked         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE TABLE products (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(255)    NOT NULL,
    slug                    VARCHAR(255)    NOT NULL UNIQUE,
    description             TEXT,
    short_description       VARCHAR(500),
    price                   NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    category                VARCHAR(100),
    stock                   INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),
    active                  BOOLEAN         NOT NULL DEFAULT TRUE,
    main_image              VARCHAR(500),
    customization_enabled   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);

CREATE TABLE product_gallery_images (
    product_id      BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    position        INTEGER      NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    PRIMARY KEY (product_id, position)
);

CREATE TABLE memories (
    id              BIGSERIAL PRIMARY KEY,
    public_code     VARCHAR(32)  NOT NULL UNIQUE,
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    main_image      VARCHAR(500),
    video_url       VARCHAR(500),
    audio_url       VARCHAR(500),
    music_url       VARCHAR(500),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE memory_gallery_images (
    memory_id       BIGINT       NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    position        INTEGER      NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    PRIMARY KEY (memory_id, position)
);

CREATE TABLE customizations (
    id                  BIGSERIAL PRIMARY KEY,
    image_url           VARCHAR(500),
    image_position      VARCHAR(100),
    image_scale         DOUBLE PRECISION,
    image_rotation      DOUBLE PRECISION,
    text                TEXT,
    text_style          VARCHAR(100),
    font                VARCHAR(100),
    text_color          VARCHAR(20),
    occasion            VARCHAR(100),
    recipient_name      VARCHAR(255),
    gift_message        TEXT,
    video_url           VARCHAR(500),
    audio_url           VARCHAR(500),
    qr_memory_enabled   BOOLEAN      NOT NULL DEFAULT FALSE,
    memory_id           BIGINT       REFERENCES memories(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE customers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(30)  NOT NULL UNIQUE,
    email           VARCHAR(255),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id                  BIGSERIAL PRIMARY KEY,
    order_number        VARCHAR(40)     NOT NULL UNIQUE,
    tracking_code       VARCHAR(20)     NOT NULL UNIQUE,
    user_id             BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    customer_id         BIGINT          REFERENCES customers(id) ON DELETE SET NULL,
    customer_name       VARCHAR(255)    NOT NULL,
    phone               VARCHAR(30)     NOT NULL,
    email               VARCHAR(255),
    city                VARCHAR(120)    NOT NULL,
    address             TEXT            NOT NULL,
    notes               TEXT,
    subtotal            NUMERIC(10, 2)  NOT NULL CHECK (subtotal >= 0),
    delivery_fee        NUMERIC(10, 2)  NOT NULL CHECK (delivery_fee >= 0),
    total               NUMERIC(10, 2)  NOT NULL CHECK (total >= 0),
    payment_method      VARCHAR(20)     NOT NULL,
    payment_status      VARCHAR(20)     NOT NULL,
    order_status        VARCHAR(20)     NOT NULL,
    estimated_delivery  DATE,
    version             BIGINT          NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_order_number ON orders(order_number);
CREATE UNIQUE INDEX idx_order_tracking_code ON orders(tracking_code);
CREATE INDEX idx_order_phone ON orders(phone);
CREATE INDEX idx_order_status ON orders(order_status);
CREATE INDEX idx_order_created_at ON orders(created_at);
CREATE INDEX idx_order_customer_id ON orders(customer_id);

CREATE TABLE order_items (
    id                      BIGSERIAL PRIMARY KEY,
    order_id                BIGINT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id              BIGINT          NOT NULL REFERENCES products(id),
    product_name_snapshot   VARCHAR(255)    NOT NULL,
    unit_price              NUMERIC(10, 2)  NOT NULL CHECK (unit_price >= 0),
    quantity                INTEGER         NOT NULL CHECK (quantity > 0),
    total_price             NUMERIC(10, 2)  NOT NULL CHECK (total_price >= 0),
    customization_id        BIGINT          REFERENCES customizations(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE TABLE tracking_events (
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status          VARCHAR(20)  NOT NULL,
    description     VARCHAR(500) NOT NULL,
    admin_note      VARCHAR(500),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_tracking_events_order_id ON tracking_events(order_id);
