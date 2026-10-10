-- Database is automatically created from POSTGRES_DB environment variable
-- No need to create database manually since PostgreSQL container handles this

DROP TABLE IF EXISTS test;
DROP TABLE IF EXISTS Favourite_Items;
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
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255),
    added_by INT REFERENCES Users(user_id) ON DELETE SET NULL,
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (group_id, media_type, movie_id)
);

CREATE TABLE Favourite_Lists (
    list_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    list_name VARCHAR(100) DEFAULT 'My favourites',
    share_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE Favourite_Items (
    list_id INT REFERENCES Favourite_Lists(list_id) ON DELETE CASCADE,
    movie_id INT NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255),
    release_year INT,
    vote_average NUMERIC(3, 1),
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (list_id, media_type, movie_id)
);

CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE NOT NULL,
    movie_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
    review_text TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT NOW()
);
