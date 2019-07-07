const { assert, should, expect} = require('chai');
const FileManager = require("../util/file-manager")

const fs = new FileManager()

describe('mkdir', function () {
    it('mkdir folder, must pass', function () {
        const { error , message} = fs.makeDirectory("folder")
        assert.isUndefined(error)
        assert.isDefined(message);
        assert.equal(message, "CREATED");
        assert.isDefined(fs._getDirectory("/folder"));
        assert.equal(fs._getDirectory("/folder").name, "folder");
    });

    
    it('mkdir folder again, it must fail', function () {
        const { error } = fs.makeDirectory("folder")
        assert.isDefined(error)
        assert.equal(error.message, 'DIRECTORY ALREADY EXISTS')
    });
    
    it('mkdir with relative path must pass', function () {
        fs.changeDirectory("folder")
        const { error, message } = fs.makeDirectory("../folder2")
        assert.isUndefined(error)
        assert.isDefined(message);
        assert.equal(message, "CREATED");
        assert.isDefined(fs._getDirectory("/folder2"));
        assert.equal(fs._getDirectory("/folder2").name, "folder2");
    });

    it('mkdir with absolute path must pass', function () {
        const { error, message } = fs.makeDirectory("/folder2/level2")
        assert.isUndefined(error)
        assert.isDefined(message);
        assert.equal(message, "CREATED");
        assert.isDefined(fs._getDirectory("/folder2/level2"));
        assert.equal(fs._getDirectory("/folder2/level2").name, "level2");
    });

    it('mkdir with nonexistent absolute path must fail', function () {
        const { error } = fs.makeDirectory("/folder3/level2")
        assert.isDefined(error)
        assert.equal(error.message, "INVALID PATH");
        assert.equal(fs._getDirectory("/folder3/level2").error, "INVALID PATH")
    });

    it('mkdir relative path must pass', function () {
        fs.changeDirectory("/folder2/level2")
        const { error } = fs.makeDirectory("../../folder3")
        assert.isUndefined(error)
        assert.equal(fs._getDirectory("/folder3").name, "folder3");
    });

    it('mkdir for existing dir using relative path must fail', function () {
        fs.changeDirectory("/folder2/level2")
        const { error } = fs.makeDirectory("../../folder3")
        assert.isDefined(error)
        assert.equal(error.message, 'DIRECTORY ALREADY EXISTS');
    });
});

describe("change directory", () => {
    before(() => {
        fs.reset()
        fs.makeDirectory("/folder1")
        fs.makeDirectory("/folder1/level1")
        fs.makeDirectory("/folder1/level1/level2")
        fs.makeDirectory("/folder2")
        fs.makeDirectory("/folder2/level1")
        fs.makeDirectory("/folder2/level1/level2")
        fs.makeDirectory("/folder3")
    })

    it("cd folder1, must pass", () => {
        const { error, message } = fs.changeDirectory("folder1")
        assert.isUndefined(error)
        assert.isDefined(message)
        assert.equal(message, "REACHED")
    })

    it("cd folder1/level2, must fail", () => {
        const { error, message } = fs.changeDirectory("level2")
        assert.isDefined(error)
        assert.isUndefined(message)
        assert.equal(error, "INVALID PATH")
    })

    it("cd ../folder2, must pass", () => {
        const { error, message } = fs.changeDirectory("../folder2")
        assert.isUndefined(error)
        assert.isDefined(message)
        assert.equal(message, "REACHED")
    })

    it("cd ./, must pass", () => {
        const { error, message } = fs.changeDirectory("/")
        assert.isUndefined(error)
        assert.isDefined(message)
        assert.equal(message, "REACHED")
    })

    it("cd folder1/level1/level2, must pass", () => {
        const { error, message } = fs.changeDirectory("folder1/level1/level2")
        assert.isUndefined(error)
        assert.isDefined(message)
        assert.equal(message, "REACHED")
    })

    it("cd ../../../folder3/level1, must fail", () => {
        const { error, message } = fs.changeDirectory("../../../folder3/level1")
        assert.isDefined(error)
        assert.isUndefined(message)
        assert.equal(error, "INVALID PATH")
    })

    it("cd ../../../folder3, must pass", () => {
        const { error, message } = fs.changeDirectory("../../../folder3")
        assert.isUndefined(error)
        assert.isDefined(message)
        assert.equal(message, "REACHED")
    })
})

describe("remove directory", () => {
    before(() => {
        before(() => {
            fs.reset()
            fs.makeDirectory("/folder1")
            fs.makeDirectory("/folder1/level1")
            fs.makeDirectory("/folder1/level1/level2")
            fs.makeDirectory("/folder2")
            fs.makeDirectory("/folder2/level1")
            fs.makeDirectory("/folder2/level1/level2")
            fs.makeDirectory("/folder3")
        })
    })

    it("rm /folder3, must pass", () => {
        const {error, message} = fs.removeDirectories("/folder3")
        assert.isUndefined(error)
        assert.isDefined(message)
        assert.equal(message, "REMOVED")
        assert.deepEqual(fs._getDirectory("/folder3"), { error: "INVALID PATH"})
    })

    it("rm /folder3, must fail", () => {
        const {error, message} = fs.removeDirectories("/folder3")
        assert.isDefined(error)
        assert.isUndefined(message)
        assert.equal(error, "INVALID PATH")
    })

    it("rm level2 at path /folder1/level1, must pass", () => {
        fs.changeDirectory("/folder1/level1")
        const {error, message} = fs.removeDirectories("level2")
        assert.isUndefined(error)
        assert.isDefined(message)
        assert.equal(message, "REMOVED")
        assert.deepEqual(fs._getDirectory("level2"), { error: "INVALID PATH"})
    })

    it("rm ../../folder2/level1 at path /folder1/level1, must pass", () => {
        fs.changeDirectory("/folder1/level1")
        const { error, message } = fs.removeDirectories("../../folder2/level1")
        assert.isUndefined(error)
        assert.isDefined(message)
        assert.equal(message, "REMOVED")
        assert.deepEqual(fs._getDirectory("/folder2/inner1"), { error: "INVALID PATH" })
    })
})