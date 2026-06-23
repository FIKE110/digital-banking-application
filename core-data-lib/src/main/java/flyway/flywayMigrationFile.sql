CREATE TABLE account (
 id BIGSERIAL PRIMARY KEY,
 account_number VARCHAR (225),
 created_at TIMESTAMP,
 updated_at TIMESTAMP,
 created_by VARCHAR(255),
 updated_by VARCHAR(255);
)

CREATE TABLE customer_profile (
   id BIGSERIAL PRIMARY KEY,

    first_name VARCHAR (255),
    last_name VARCHAR (255),
    phone_number VARCHAR (255),
   created_at TIMESTAMP,
   updated_at TIMESTAMP,
   created_by VARCHAR (255),
   updated_by VARCHAR (255)
)

CREATE TABLE transaction (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(255),
    amount VARCHAR (255),
    transactional_type (255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255);

)

CREATE TABLE user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR (255),
    email VARCHAR (255),
    password VARCHAR (255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255);
)
