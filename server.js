const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const util = require("util");
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());
// GET Route for homepage
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// GET Route for feedback page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);
// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);
// Function to write data to the JSON file given a destination and some content
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );
// Function to read data from a given a file and append some content
const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

// GET Route for retrieving all the notes
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile("./db/db.json").then((data) => {
    res.json(JSON.parse(data));
    notes = JSON.parse(data);
  });
});

// POST Route for a new UX/UI note
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      id: notes.length + 1,
      title,
      text,
    };

    readAndAppend(newNote, "./db/db.json");
    res.json(`note added successfully 🚀`);
  } else {
    res.error("Error in adding tip");
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const index = notes.findIndex((note) => note.id == id);
  if (index === -1) {
    res.status(404).send("Note not found");
    return;
  }
  notes.splice(index, 1);
  writeToFile("./db/db.json", notes);
  res.sendStatus(204);
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
