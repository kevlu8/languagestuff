// express
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// path
const path = require('path');

// load dict
// ../dict.txt, pairs of words
// cantonesejyutping englishmeaning
const fs = require('fs');
const dict = fs.readFileSync(path.join(__dirname, '../dict.txt'), 'utf8').split('\n');

// delete last empty line
dict.pop();

// shuffle array
function shuffle() {
	for (let i = 0; i < dict.length; i++) {
		const random = Math.floor(Math.random() * dict.length);
		const temp = dict[i];
		dict[i] = dict[random];
		dict[random] = temp;
	}
}

shuffle();

let dictidx = 0;

app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/fs*', (req, res) => {
	// check if user has cookie password: "$ecr3tFS"
	if (req.cookies.password != "$ecr3tFS") {
		res.send("You don't have permission to access this page.");
		return;
	}
	let filepath = req.path;
	filepath = filepath.substring(3);
	if (filepath === "") filepath = "/";
	// check if it's a folder
	if (fs.statSync(filepath).isDirectory()) {
		let ret = "";
		let files = fs.readdirSync(filepath);
		for (let i = 0; i < files.length; i++) {
			ret += files[i] + "\n";
		}
		res.send(ret);
		return;
	}
	fs.readFile(filepath, (err, data) => {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			res.send(data);
		}
	});
});

app.get('/canto', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/canto.html'));
});

app.get('/canto/get', (req, res) => {
	// get a random word paired with its meaning
	if (dictidx === dict.length) {
		dictidx = 0;
		shuffle();
	}
	const pair = dict[dictidx].split(' ');
	dictidx++;
	res.send(pair);
});

app.post('/canto/add', (req, res) => {
	// add a new word to the dict
	const newWord = req.body.word;
	const newMeaning = req.body.meaning;
	const newPair = newWord + ' ' + newMeaning;
	dict.push(newPair);
	fs.appendFile(path.join(__dirname, '../dict.txt'), newPair + '\n', () => {});
	res.send('Added ' + newPair);
});

app.post('/canto/delete', (req, res) => {
	// delete a word from the dict
	const wordToDelete = req.body.word;

	// delete the line with the word
	for (let i = 0; i < dict.length; i++) {
		if (dict[i].split(' ')[0] === wordToDelete) {
			dict.splice(i, 1);
			break;
		}
	}

	// rewrite the dict
	fs.writeFile(path.join(__dirname, '../dict.txt'), dict.join('\n') + '\n', () => {});
	res.end();
});

app.listen(port, () => {
	  console.log(`Server is listening on port ${port}`);
});