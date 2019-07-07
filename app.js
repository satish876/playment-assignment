const readline = require('readline');
const FileManager = require("./util/file-manager")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log("Application started...");

rl.prompt()

const fs = new FileManager()

rl.on("line", function (input) {
    input = input.trim()
    const keywords = input.split(" ")

    // find and store the command and args if any
    command = keywords[0].trim()
    const args = keywords[1] ? keywords[1].trim() : null

    if (input === "session clear") {
        // reset the root
        fs.reset()
        successMessage("SESSION CLEARED")

    } else if (command === "cd") {
        // change directory command

        const { error, message } = fs.changeDirectory(args)

        if (error) {
            errorMessage(error)
        } else {
            successMessage(message);
        }

    } else if (command === "mkdir") {
        // make directory command

        const { error, message } = fs.makeDirectory(args)

        if (error) {
            errorMessage(error)
        } else {
            successMessage(message);
        }

        // remove directory command
    } else if (command === "rm") {
        const { error, message } = fs.removeDirectories(args)

        if (error) {
            errorMessage(error)
        } else {
            successMessage(message);
        }

    } else if (command === "pwd") {
        // gets the current absolute path
        console.log(fs.getCurrent());

    } else if (command === "ls") {

        fs.listContents()

    } else if (command == "clear" || command === ".clear") {
        ///clears the console

        console.clear()

    } else {
        errorMessage("CANNOT RECOGNIZE INPUT")
    }

    rl.prompt()
})

function errorMessage(message) {
    console.error(`ERR: ${message}`)
}

function successMessage(message) {
    console.log(`SUCC: ${message}`);
}

process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});