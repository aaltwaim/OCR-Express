
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { createWorker } = require('tesseract.js')
const Tesseract = require('tesseract.js')
const worker = createWorker();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: storage }).single('avatar');

app.set("view engine", "ejs");
app.get('/', (req, res) => {
    res.render("index");
})
app.post('/upload', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) return console.log("error: ", err);
            Tesseract
                .recognize(data)
                .then(result => {
                    const matches = result.data.text.match(/\d+/g);
                    const longest = matches.reduce(
                        function (a, b) {
                            return a.length > b.length ? a : b;
                        }
                    );
                    res.send(longest)
                })
                .finally(() => worker.terminate());

        })
    });
});

//Start up server
const PORT = 5000 || process.env.PORT
app.listen(PORT, () => console.log(`port number ${PORT}`))