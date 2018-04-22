let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let util = require('util');
let clients = [];

const sqlite3 = require('sqlite3').verbose();


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    //track connected clients via log
    clients.push(socket.id);
    let clientConnectedMsg = 'User connected ' + util.inspect(socket.id) + ', total: ' + clients.length;
    io.emit('chat message', clientConnectedMsg);
    console.log(clientConnectedMsg);

    // open the database
    let db = new sqlite3.Database('love.db');

    let sql = `SELECT *  FROM messages`;
    let allRows = ""
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        allRows = JSON.stringify(rows, null, 2)
        // io.emit('map message', allRows);
        io.emit('map message', rows);
        console.log('multicast: ' + allRows);
        // console.log(`${allRows} `);
    });

    // close the database connection
    db.close();

    //track disconnected clients via log
    socket.on('disconnect', () => {
        clients.pop(socket.id);
        let clientDisconnectedMsg = 'User disconnected ' + util.inspect(socket.id) + ', total: ' + clients.length;
        io.emit('chat message', clientDisconnectedMsg);
        console.log(clientDisconnectedMsg);
    })

    //multicast received message from client
    socket.on('chat message', (msg) => {
        let combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
        io.emit('chat message', combinedMsg);
        console.log('multicast: ' + combinedMsg);
    });

    //multicast received message from client
    socket.on('map message', (msg) => {
        // let combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
        // open the database
        let db = new sqlite3.Database('love.db');

        let sql = `SELECT *  FROM messages`;
        let allRows = ""
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            allRows = JSON.stringify(rows, null, 2)
            // io.emit('map message', allRows);
            io.emit('map message', rows);
            console.log('multicast: ' + allRows);
            // console.log(`${allRows} `);
        });

        // close the database connection
        db.close();
    });
    //multicast received message from client
    socket.on('new map message', (msg) => {
        // let combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
        console.log(msg);
        // let message = JSON.parse(msg);
        let message = msg;
        // open the database
        let db = new sqlite3.Database('love.db');

        let sql = `INSERT INTO messages(title, content, creator_name, x, y, z, map, type, meta) VALUES (?,?,?,?,?,?,?,?,?)`;
        let params = [message.title, message.content, message.creator_name, message.x, message.y, message.z, message.map, message.type, message.meta];

        db.run(sql, params, function (err, rows) {
            if (err) {
                throw err;
            }
            console.log(this.lastID);
            let rowid_sql = `SELECT *  FROM messages WHERE id =  ${this.lastID}`;
            db.get(rowid_sql, [], (err, row) => {
                if (err) {
                    throw err;
                }
                row_string = JSON.stringify(row, null, 2)
                //io.emit('new map message', row_string);
                io.emit('new map message', row);
                console.log('multicast: ' + row_string);
            });
        });
        // close the database connection
        db.close();
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
