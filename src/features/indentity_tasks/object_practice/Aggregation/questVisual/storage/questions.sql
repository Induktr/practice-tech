CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  correctAnswer INTEGER NOT NULL,
  invalidAnswer INTEGER NOT NULL
);

INDEXED BY id;