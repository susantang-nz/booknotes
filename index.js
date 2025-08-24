import express from "express";
import bodyParser from "body-parser";
import db from './db.js';
import axios from "axios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT books.*, notes.*,
            TO_CHAR(notes.dateread, 'YYYY-MM-DD') AS dateread
            FROM books JOIN notes ON books.id = notes.bookid;`
        );
        // console.log(JSON.stringify(result.rows));
        // console.table(result.rows);
        res.render("index.ejs", { booknotes: result.rows });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).send("Database error.");
    }
});

app.get("/allbooks", async (req, res) => {
    const allbooks = await db.query("SELECT * FROM books");

    const books = allbooks.rows;
    res.render("allbooks.ejs", { books: books, message: null });
});

app.get("/book/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await db.query(`
            SELECT books.*, notes.*,
            TO_CHAR(notes.dateread, 'YYYY-MM-DD') AS dateread
            FROM books JOIN notes ON books.id = notes.bookid
            WHERE books.id = $1;`, [id]
        );
        if (result.rows.length === 0) {
            res.status(404).send("No note found for this book");
        } else {
            res.render("note.ejs", { booknote: result.rows[0] })
        }
    } catch (error) {
        console.log("The book is unable to get: " + error);
    }
});

app.post("/book/:id/edit", async (req, res) => {
    const id = req.params.id;
    const { dateread, rating, summary, note } = req.body;

    try {
        const result = await db.query(
            "SELECT dateread, rating, summary, note FROM notes WHERE bookid=$1", [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("No note found for this book.")
        }

        const oldData = result.rows[0];

        const newDateread = dateread && dateread.trim() !== "" ? dateread : oldData.dateread;
        const newRating = rating && rating.trim() !== "" ? rating : oldData.rating;
        const newSummary = summary && summary.trim() !== "" ? summary : oldData.summary;
        const newNote = note && note.trim() !== "" ? note : oldData.note;

        await db.query(
            "UPDATE notes SET dateread=$1, rating=$2, summary=$3, note=$4 WHERE bookid=$5", [dateread, rating, summary, note]
        );
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }

})

app.get("/add", async (req, res) => {
    res.render("add.ejs", {
        books: [],
        error: null
    });
});

app.post("/search", async (req, res) => {
    const input = req.body.searchInput;
    try {
        const respond = await axios(`https://openlibrary.org/search.json?q=${input}&limit=10&page=1`);
        const books = respond.data.docs.map(book => ({
            title: book.title,
            author: book.author_name ? book.author_name.join(", ") : "Unknown",
            coverurl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "https://via.placeholder.com/128x195?text=No+Cover"
        }));
        console.table(books);
        res.render("search_result.ejs", { books: books })
    } catch (error) {
        console.log("Not able to fetch book info: " + error);
    }
});

app.post("/add-book", async (req, res) => {
    const { title, author, coverurl } = req.body;
    try {
        const existingBook = await db.query("SELECT * FROM books WHERE title = $1 AND author = $2", [title, author]);

        if (existingBook.rows.length > 0) {
            res.render("add.ejs", {
                books: [],
                error: "This book already exists."
            });
        } else {
            await db.query("INSERT INTO books (title, author,coverurl) VALUES ($1,$2,$3)", [title, author, coverurl]);

            const allbooks = await db.query("SELECT * FROM books");

            const books = allbooks.rows;

            res.render("allbooks.ejs", { books: books, message: `[${title} by ${author}] has been added to your book list.` });
        }

    } catch (error) {
        console.log(error);
    }
});

app.post("/add-note", async (req, res) => {
    const title = req.body.bookTitleToAddNote;
    try {
        const book = await db.query("SELECT * FROM books WHERE title = $1", [title]);

        if (book.rows.length > 0) {
            const { author, coverurl } = book.rows[0];
            console.log("Book to add note has been found - " + title, author, coverurl);
            res.render("addnote.ejs", { title: title, author: author, coverurl: coverurl });
        } else {
            console.log("book has not been found.");
        }
    } catch (error) {
        console.log(error);
    }
});

app.post("/add-note/submit", async (req, res) => {
    const { title, rating, dateread, summary, note } = req.body;
    try {
        const bookResult = await db.query(`
            SELECT id FROM books 
            WHERE title = $1`,
            [title]
        );
        if (bookResult.rows.length === 0) {
            return res.send("Book not found.")
        }
        const bookid = bookResult.rows[0].id;

        await db.query(`
            INSERT INTO notes(bookid, dateread, rating, summary, note)
            VALUES ($1, $2, $3, $4, $5)
            `, [bookid, dateread, rating, summary, note]);
        res.redirect("/");
    } catch (error) {
        console.log(error)
    }
});

app.post("/edit", async (req, res) => {
    const id = req.body.id;
    try {
        const booknoteResult = await db.query(`
            SELECT * FROM books
            LEFT JOIN notes 
            ON books.id = notes.bookid
            WHERE books.id = $1`, [id]);

        if (booknoteResult.rows.length === 0) {
            return res.send("Book not found.");
        }

        const booknote = booknoteResult.rows[0];
        res.render("edit.ejs", { booknote: booknote })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
});

app.post("/delete-book", async (req, res) => {
    const title = req.body.bookTitleToDelete;
    console.log("I want to delete: " + title);
    try {
        await db.query("DELETE FROM books WHERE title = $1 ", [title]);
        res.redirect("/allbooks")
    } catch (error) {
        console.log("Can't find this book." + error)
    }
});

app.post("/delete", async (req, res) => {
    try {
        const id = req.body.id;
        await db.query("DELETE FROM notes WHERE bookid = $1 ", [id]);
        await db.query("DELETE FROM books WHERE id = $1 ", [id]);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deleting book and notes");
    }
});

app.listen(port, () =>
    console.log(`Server running on port ${port}`)
);
