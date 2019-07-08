# Playment Assingment

## Instalation

Run these commands on your terminal. (Assuming you have git and npm configured)
```
git clone git@github.com:satish876/playment-assignment.git
cd playment-assignment
npm i && npm start
```

## Available commands

1. cd path
2. mkdir path
3. rm path

   Note: path can be absoulte as well as relative
1. ls
2. pwd
3. session clear
4. .clear or clear
   
   to clear the terminal



## Directory object

### When a directory is created, it has these attributes
1. **name**

   Name of the directory

2. **path**

   Absolute path to this directory
3. **parentPath**

   Absolute path to its parent directory
4. **contents**

   A hash containing all the sub directories.

   When ever a sub directory is created, it will be added to this contents object
5. **isDirectory**

   this is set true for all the directory objects



### Sample directoy object

If we have directory structure like this,

```
/root
/root/folder1
/root/folder1/inner1
/root/folder2 
```

Then the directory object will look like this

```
{
    "name": "root",
    "parentPath": "",
    "path": "/",
    "isDirectory": true,
    "contents": {
        "folder1": {
            "name": "folder1",
            "parentPath": "/",
            "path": "/folder1",
            "isDirectory": true,
            "contents": {
                "level1": {
                    "name": "level1",
                    "parentPath": "/folder1",
                    "path": "/folder1/level1",
                    "isDirectory": true,
                    "contents": {}
                }
            }
        },
        "folder2": {
            "name": "folder2",
            "parentPath": "/",
            "path": "/folder2",
            "isDirectory": true,
            "contents": {}
        }
    }
}
```