-- Database is automatically created from POSTGRES_DB environment variable
-- No need to create database manually since PostgreSQL container handles this

DROP TABLE IF EXISTS test;
DROP TABLE IF EXISTS Favourite_Lists;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Group_Members;
DROP TABLE IF EXISTS Group_Movies;
DROP TABLE IF EXISTS Groups;
DROP TABLE IF EXISTS Users;


CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    description TEXT
);

INSERT INTO test (description) VALUES ('bar'), ('baz'), ('qux');

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) UNIQUE NOT NULL,
    owner_id INT REFERENCES Users(user_id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE Group_Members (
    group_id INT REFERENCES Groups(group_id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE Group_Movies (
    group_id INT REFERENCES Groups(group_id) ON DELETE CASCADE,
    movie_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (group_id, movie_id)
);

CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE NOT NULL,
    movie_id INT NOT NULL,
    review_text TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Favourite_Lists (
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    movie_id INT NOT NULL,
    list_name VARCHAR(100) DEFAULT 'Omat suosikit',
    share_token UUID DEFAULT gen_random_uuid(),
    PRIMARY KEY (user_id, movie_id)
);