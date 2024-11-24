const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.static("."));

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("video"), async (req, res) => {
    if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).send("No file uploaded");
    }

    try {
        console.log("File Received:", req.file);

        const auth = new google.auth.GoogleAuth({
            keyFile: "video-testimonial-429422-c391dc9a70c9.json", // Ensure the file path is correct
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });

        const driveService = google.drive({ version: "v3", auth });
        const fileMetadata = {
            name: `${req.file.originalname}`,
            parents: ["1qjxBCNrgj6gps-T3CSwqXvyq84VxYt_t"], // Ensure the folder ID is correct
        };
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(path.join(__dirname, req.file.path)),
        };

        const file = await driveService.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id",
        });
        console.log("File Uploaded to Google Drive:", file.data.id);
        fs.unlinkSync(path.join(__dirname, req.file.path));

        res.send(`File Uploaded Successfully: ${file.data.id}`);
    } catch (err) {
        if (err.response) {
            console.error("Error uploading file to Google Drive:", err.response.data);
        } else {
            console.error("Error uploading file to Google Drive:", err);
        }
        res.status(500).send("Error Uploading to Google Drive");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
