// server.js

const express = require('express')
const server = express()
const resize = require('./resize')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

// Load config
require('dotenv').config()

server.use(express.json())

server.use(function (err, req, res, next) {
    res.status(400).send({'message': err.toString()});
    return
});
//Config port
PORT = process.env.APP_PORT || 8000


server.get('/width/:width/height/:height/:path(*).:ext(jpg|png|gif)', (req, res) => {
    const cache_path = 'cache' + req.url
    let format = req.params.ext;
    if (format.toLowerCase() === 'gif') {
        try {
            let readStream = fs.createReadStream(req.params.path + '.' + format).on('error', function (error) {
                res.type('application/json');
                res.status(400).send({'message': error.toString()})
            });
            res.type(`image/${format.toLowerCase() || 'png'}`);
            readStream.pipe(res);
            return
        } catch (e) {
            res.status(400).send({'message': e.toString()})
        }
    }
    fs.access(cache_path, fs.F_OK, (err) => {
        if (err) {
            let file_path = req.params.path + '.' + req.params.ext
            fs.access(file_path, fs.F_OK, (err_file) => {
                if (err_file) {
                    res.status(404).send('No image')
                    return
                }

                let width = parseInt(req.params.width)
                let height = parseInt(req.params.height)
                if (width > 1200 || height > 1200) {
                    res.send('Dai vai')
                    return
                }
                res.type(`image/${format || 'png'}`)
                resize(file_path, format.toLowerCase(), width, height).pipe(res)
                let cache_dir = path.dirname(cache_path)
                fse.ensureDir(cache_dir)
                resize(file_path, format.toLowerCase(), width, height).toFile(cache_path)
                return
            })

        } else {
            res.type(`image/${format || 'png'}`)
            let readStream = fs.createReadStream(cache_path);
            readStream.pipe(res);
            return
        }

    })
})


server.get('/width/:width/:path(*).:ext(jpg|png|gif)', (req, res) => {
    const cache_path = 'cache' + req.url
    let format = req.params.ext
    if (format.toLowerCase() === 'gif') {
        try {
            let readStream = fs.createReadStream(req.params.path + '.' + format).on('error', function (error) {
                res.type('application/json')
                res.status(400).send({'message': error.toString()})
            });
            res.type(`image/${format.toLowerCase() || 'png'}`)
            readStream.pipe(res);
            return
        } catch (e) {
            res.status(400).send({'message': e.toString()})
        }
    }
    fs.access(cache_path, fs.F_OK, (err) => {
        if (err) {
            let file_path = req.params.path + '.' + req.params.ext
            fs.access(file_path, fs.F_OK, (err_file) => {
                if (err_file) {
                    res.status(404).send('No image')
                    return
                }

                let width = parseInt(req.params.width)
                if (width > 1200) {
                    res.send('Dai vai')
                    return
                }
                res.type(`image/${format || 'png'}`)
                resize(file_path, format.toLowerCase(), width, null).pipe(res)
                let cache_dir = path.dirname(cache_path)
                fse.ensureDir(cache_dir)
                resize(file_path, format.toLowerCase(), width, null).toFile(cache_path)
                return
            })

        } else {
            res.type(`image/${format || 'png'}`)
            let readStream = fs.createReadStream(cache_path);
            readStream.pipe(res);
            return
        }

    })
})

server.get('/height/:height/:path(*).:ext(jpg|png|gif)', (req, res) => {
    const cache_path = 'cache' + req.url
    let format = req.params.ext
    if (format.toLowerCase() === 'gif') {
        try {
            let readStream = fs.createReadStream(req.params.path + '.' + format).on('error', function (error) {
                res.type('application/json')
                res.status(400).send({'message': error.toString()})
            });
            res.type(`image/${format.toLowerCase() || 'png'}`)
            readStream.pipe(res);
            return
        } catch (e) {
            res.status(400).send({'message': e.toString()})
        }
    }

    fs.access(cache_path, fs.F_OK, (err) => {
        if (err) {
            let file_path = req.params.path + '.' + req.params.ext
            fs.access(file_path, fs.F_OK, (err_file) => {
                if (err_file) {
                    res.status(404).send('No image')
                    return
                }

                let height = parseInt(req.params.height)
                if (height > 1200) {
                    res.send('Dai vai')
                    return
                }
                res.type(`image/${format.toLowerCase() || 'png'}`)
                resize(file_path, format.toLowerCase(), null, height).pipe(res)
                let cache_dir = path.dirname(cache_path)
                fse.ensureDir(cache_dir)
                resize(file_path, format.toLowerCase(), null, height).toFile(cache_path)
                return
            })

        } else {
            res.type(`image/${format || 'png'}`)
            let readStream = fs.createReadStream(cache_path);
            readStream.pipe(res);
            return
        }

    })
})

server.post('/brands', (req, res) => {
    /*
     *  res = {
     *    'path': 'a/asus.png',
     *    'data': <base64 encoded>
     *  }
     */
    try {
        let buff = new Buffer(req.body.data, 'base64')
        if (buff == null) res.status(400).send({message: 'data invalid'})
        else {
            var code = req.body.code;
            var path_url = path.join('media', 'brands', code.substr(0, 1), req.body.code + '.png')
            savePath = path.join(path_url)
            saveDir = path.dirname(savePath)
            fs.exists(saveDir, exists => {
                if (!exists) fs.mkdirSync(saveDir, {recursive: true})
                let data = req.body.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
                fs.writeFile(savePath, data[2], 'base64', (err) => {
                    if (err) res.status(400).send({message: 'Save image error'})
                    else res.status(200).send({message: 'Save file success', 'path': path_url})
                })
            })
        }
    } catch (e) {
        res.status(500).send({message: e.toString()})
    }
})

server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}!`)
})
