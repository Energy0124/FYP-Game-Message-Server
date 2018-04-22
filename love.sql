CREATE TABLE messages
(
    title TEXT,
    content TEXT,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    creator_name TEXT,
    x REAL,
    y REAL,
    z REAL,
    map TEXT,
    type TEXT,
    meta TEXT,
    id INTEGER PRIMARY KEY AUTOINCREMENT
);