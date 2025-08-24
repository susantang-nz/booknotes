DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS books;
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(225),
    coverurl VARCHAR(225)
);
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    bookid INT NOT NULL UNIQUE,
    dateread DATE,
    rating INT,
    summary TEXT,
    note TEXT,
    FOREIGN KEY (bookid) REFERENCES books(id) ON DELETE CASCADE
);
INSERT INTO books (title, author, coverurl)
VALUES (
        'How to Talk So Kids Will Listen & Listen So Kids Will Talk',
        'Adele Faber & Elaine Mazlish',
        'https://covers.openlibrary.org/b/isbn/9781451663884-M.jpg'
    ),
    (
        'Surrounded by Idiots',
        'Thomas Erikson',
        'https://covers.openlibrary.org/b/isbn/9781250179937-M.jpg'
    ),
    (
        'Atomic Habits',
        'James Clear',
        'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg'
    );
INSERT INTO notes (bookid, dateread, rating, summary, note)
VALUES (
        1,
        '2024-03-24',
        7,
        'Great book, very interesting.',
        'Nam vel mi molestie, tincidunt dolor ornare, condimentum tellus. Vestibulum dapibus elit sit amet elit facilisis mattis. Morbi pulvinar ex ipsum, pharetra condimentum sem consectetur non. Ut volutpat ultrices dui, sed convallis metus efficitur sed. Nam non tellus in eros pretium vulputate. Nullam vulputate placerat risus. Integer rutrum lacinia sem placerat porta. Proin ac justo enim. Integer facilisis feugiat felis eget aliquet.'
    ),
    (
        2,
        '2024-11-29',
        9,
        'Another great book, learn a lot from it.',
        'Vivamus velit sem, consequat non interdum in, tincidunt a libero. Praesent elementum vitae velit nec tempus. Phasellus vitae posuere eros. Pellentesque id elit ac arcu laoreet aliquam. Etiam lorem ligula, pellentesque volutpat ante ac, egestas porta felis.'
    ),
    (
        3,
        '2025-8-18',
        9,
        'Nunc molestie gravida metus in porttitor. Morbi tristique ante urna.',
        'Mauris eget velit nec dolor dictum iaculis quis ac leo. Sed at elit sit amet sem mollis pulvinar nec at purus. Integer condimentum risus est, in bibendum arcu imperdiet non. Vivamus ut dignissim justo. Praesent turpis justo, pretium et odio eu, sagittis tincidunt diam. Etiam commodo augue id nisi fermentum, id lacinia enim feugiat. Vestibulum feugiat sollicitudin orci.'
    );