import express from "express";
import bodyParser from "body-parser";
import db from './db.js';
import axios from "axios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

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


app.get("/add", async (req, res) => {
    res.render("add.ejs");
})

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
