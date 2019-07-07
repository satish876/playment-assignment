class Directory {

    constructor({ name, parentPath }) {
        if (!parentPath) parentPath = ""
        if (!name) throw new Error("Directory name is missing")

        this.name = name
        this.parentPath = parentPath
        
        if(name === "root" && !parentPath) {
            this.path = "/"
        } else {
            this.path = parentPath[parentPath.length - 1] === '/' ?
                `${parentPath}${name}` :
                `${parentPath}/${name}`
        }


        this.isDirectory = true
        this.contents = {}
    }
}


module.exports = Directory