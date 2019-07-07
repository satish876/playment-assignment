// const fs = require("fs")

const Directory = require("./directory")

class FileManager {
    constructor() {
        // this clas has 2 attributes, __rootDir & _currentDir
        this.reset()
    }

    reset() {
        // will reset current dir to root
        // also, this will clear the session

        this._setRoot(
            new Directory({
                name: "root"
            })
        )

        this._currentDir = this._getRoot();
    }

    makeDirectory(path) {
        /**
         * creates a new directory
         * path argument can be an absolute path
         * path argument can be a relative path to current directory
         */

        if (!path || path.length === 0) {
            // handles the missing path
            return {
                error: "NAME MISSING"
            }
        }

        {
            // check if current directory exists
            // this is to handle the case if we remove the current directory

            const { error } = this._getDirectory(this._currentDir.path)
            if (error) {
                return {
                    error: "NO SUCH DIRECTORY"
                }
            }
        }

        try {

            const isNameAPath = path.indexOf("/") > -1
            let directory = this._currentDir;

            if (isNameAPath) {
                // if the argument is a path then do
                //    1. Check if the path is valid
                //    2. if not throw an error and return
                //    3. or else, get the parent directory, create and new dir and save it


                // get the directory path and path to its parent from argument 
                const indexOfDir = path.lastIndexOf("/")
                const dirName = path.substr(indexOfDir + 1)
                let containingDir;

                // calculate the absoulte path to parent directory
                if (path[0] === "/") {
                    // provided path is an absolute path
                    containingDir = path.substr(0, indexOfDir)
                } else {
                    // provided path is a relative path
                    // now we convert it to an absolute path
                    containingDir = this._resolvePath(path.substr(0, indexOfDir))
                }

                // here we check if parent directory exists
                const { error, ...dir } = this._getDirectory(!containingDir ? "/" : containingDir)
                if (error) throw new Error("INVALID PATH")

                // parent directory exists and now we proceed to create a new directory
                path = dirName
                directory = dir
            }

            // check if the directory already exists
            const existingDirectories = this._getSubDirectoriesName(directory)
            const findIndexIfExists = existingDirectories.indexOf(path)

            if (findIndexIfExists > -1) throw new Error("DIRECTORY ALREADY EXISTS")

            // create a new Directory
            const newDir = new Directory({
                name: path,
                parentPath: directory.path
            })

            // newly created directory will be added to contents of current directory
            directory.contents[path] = newDir

            // this.save()

        } catch (error) {
            return {
                error: error || "FAILED TO CREATE"
            }
        }
        // console.log(this._currentDir.path + '/' + path, "=>", this._getDirectory(this._currentDir.path + '/' + name));
        return {
            message: "CREATED"
        }
    }

    _getSubDirectoriesName(dir) {
        // returns all the sub-directories within a directory
        // loop through the contents of directory and return their names

        const names = Object.keys(dir.contents)
        const subDirs = []
        let name

        for (let i = 0; i < names.length; i++) {
            name = names[i]

            // all directories have their isDirectory set TRUE
            // another way to check if its a directory is by checking 'constructor.name' property
            if (!!dir.contents[name].isDirectory) {
                subDirs.push(dir.contents[name].name)
            }
        }
        return subDirs
    }

    listContents() {
        // ls command
        // prints all the sub-directories

        const contents = this._getSubDirectoriesName(this._currentDir)
        console.log(
            contents.join("\t")
        );
    }

    getCurrent() {
        // returns the absolute path of current directory 
        return this._currentDir.path
    }

    removeDirectories(path) {
        // rmdir command

        if (!path) return {
            error: "INVALID PATH"
        }

        // prevent removal of root directory
        // if we need to remove the root dir, we can reset the session instead

        if (path === "/") {
            return {
                error: "FAILED"
            }
        }

        const isAbsoultePath = path[0] === "/"
        const pathToParent = path.substr(0, path.lastIndexOf("/"))
        const dirName = path.substr(path.lastIndexOf("/") + 1)

        const absolutePathToParent = isAbsoultePath ?
            pathToParent :
            this._resolvePath(pathToParent)

        const { error, ...parentDirectory } = this._getDirectory(absolutePathToParent)

        if (error) {
            return { error }
        }

        // return error if we try to remove a non-existent sub directory
        if (!parentDirectory.contents[dirName]) {
            return {
                error: "INVALID PATH"
            }
        }

        // finally remove the sub directory

        parentDirectory.contents[dirName] = undefined
        delete parentDirectory.contents[dirName]

        // this.save()
        return {
            message: "REMOVED"
        }
    }

    changeDirectory(toPath) {
        // cd command

        if (!toPath || toPath === "/") {
            this._currentDir = this._getRoot()
            return {
                message: "REACHED"
            }
        }

        const isAbsoultePath = toPath[0] === "/"

        try {
            let path = toPath

            // if we receive a relative path, we convert it to absoulte path
            // this is due to _getDirectory(), which accepts an absoulte path and returns the dir object

            if (!isAbsoultePath) {
                path = this._resolvePath(toPath)
            }

            const currDir = this._getDirectory(path)
            if (currDir.error) {
                return {
                    error: currDir.error
                }
            }

            // set the current directory on successful operation
            this._currentDir = currDir

            return {
                message: "REACHED"
            }
        } catch (error) {
            return {
                error: "FAILED"
            }
        }
    }

    _resolvePath(relativePath) {
        // resolves a path relative to current directory

        /**
         * relativePath is split into sub paths,
         * for every .., we go 1 directory up, from the current directory
         * for every valid sub path, we go down that path, from the current directory
         */

        const currentPaths = this._currentDir.path.split("/")
        const paths = relativePath.split("/")

        for (let i = 0; i < paths.length; i++) {
            if (!paths[i]) continue

            if (paths[i] === "..") {
                if (currentPaths.length > 0) currentPaths.pop()
            } else {
                currentPaths.push(paths[i])
            }
        }

        return currentPaths.join("/")
    }

    _getDirectory(path) {
        // accepts an absolute path and returns the directory object if path exists
        // can be used to check is a path exists or not

        /**
         * this function tries to traverses the path starting form root, down the path,
         * until it encounters an invalid/non-existent path
         * or it finally finds the requested path
         */
        const folders = path.split("/")
        let dir;

        try {
            dir = folders.reduce((acc, folder) => {
                if (folder.length === 0 || folder === "root") return acc

                // here we find that the sub-directory don't exist
                if (!acc.contents[folder]) throw new Error()

                acc = acc.contents[folder]
                return acc
            }, this._getRoot())

        } catch (error) {
            return {
                error: "INVALID PATH"
            }
        }
        return dir
    }


    _getRoot() {
        return this.__rootDir
    }

    _setRoot(dir) {
        this.__rootDir = dir
    }

    // save() {
    //     fs.writeFile('files.json', JSON.stringify(this._getRoot()), (err) => {
    //         if (err) throw err;
    //     });
    // }

}
module.exports = FileManager