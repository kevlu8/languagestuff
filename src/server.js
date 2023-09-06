// express
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

// path
const path = require('path');

// load dict
// ../dict.txt, pairs of words
// cantonesejyutping englishmeaning
const fs = require('fs');
const dict = fs.readFileSync(path.join(__dirname, '../dict.txt'), 'utf8').split('\n');

// delete last empty line
dict.pop();

app.use(bodyParser.json());

app.get('/', (req, res) => {
	// send main.html
	res.sendFile(path.join(__dirname, '../public/main.html'));
});

app.get('/practice', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/practice.html'));
});

app.get('/control', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/control.html'));
});

app.get('/get', (req, res) => {
	// get a random word paired with its meaning
	const random = Math.floor(Math.random() * dict.length);
	const pair = dict[random].split(' ');
	res.send(pair);
});

app.post('/add', (req, res) => {
	// add a new word to the dict
	const newWord = req.body.word;
	const newMeaning = req.body.meaning;
	const newPair = newWord + ' ' + newMeaning;
	dict.push(newPair);
	fs.appendFile(path.join(__dirname, '../dict.txt'), newPair + '\n', () => {});
	res.send('Added ' + newPair);
});

app.post('/delete', (req, res) => {
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