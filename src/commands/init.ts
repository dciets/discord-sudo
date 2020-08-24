import fs from "fs";
import path from "path";

export default () =>
    fs.promises
        .readdir(__dirname, { withFileTypes: true })
        .then((files) => files.filter((file) => file.isDirectory()))
        .then((directories) =>
            directories.map((dir) => {
                try {
                    require(path.join(__dirname, dir.name));
                } catch (e) {
                    console.error("unable to load", dir.name, e);
                }
            })
        );
