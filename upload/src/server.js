const express = require('express');

const cors = require('cors');

const app = express();

const bcrypt = require('bcrypt-nodejs');

const knex = require('knex');

const Clarifai = require('clarifai');

const app2 = new Clarifai.App({
  apiKey: '34f22a97c3454b4a887b94723d122509'
});


const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'test',
    database : 'smartbrain'
  }
});

// db.select('*').from('users').then(data => {
// 	console.log(data);
// });

app.use(cors());

app.use(express.json());

app.get('/', (req,res) => {
	res.send(database.users);
})

app.post('/signin', (req,res) =>{
	const {email, password} = req.body;
	if(!email || !password ) {
		return res.status(400).json('incorrect form submission')
	}
	db.select('email', 'hash').from('login')
	  .where('email','=', email)
	  .then(data => {
	  	const isValid = bcrypt.compareSync(password, data[0].hash);
	  	if(isValid) {
	  		return db.select('*').from('users')
	  		.where('email','=',email)
	  		.then(user => {
	  			res.json(user[0]);
	  		})
	  		.catch(err => res.status(400).json("unable to get user"))
	  	} else{
	  	res.status(400).json("wrong credentials")
	  	}
	  })
	  .catch(err => {
	  	res.status(400).json("wrong credentials")
	  })
})

app.post('/register',(req,res) => {
	const {email, name, password } = req.body;
	if(!email || !password || !name) {
		return res.status(400).json('incorrect form submission')
	}
	const hash = bcrypt.hashSync(password);

	db.transaction(trx => {
		trx.insert({
			hash, email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			console.log(loginEmail[0].email);
			return trx('users') 
			.returning('*')
			.insert({
				email: loginEmail[0].email,
				name: name,
				joined: new Date()
			})
			.then(user => {
				res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
		
	.catch(err => res.status(400).json("Unable to register."));
})

app.get('/profile/:id', (req,res) => {
	const {id} = req.params;
	db.select('*').from('users').where({
		id: id
	})
	.then( user => {
		if(user.length){
		res.json(user[0])
		} else {
			res.status(400).json('not found')
		}  
	})
	.catch(err => res.status(400).json('error getting user'));
})
 
 app.put('/image', (req,res) => {
 	const {id} = req.body;
	db('users').where('id','=',id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0].entries);
	})
	.catch(err => res.status(400).join('unable to get entries'));
 })

app.post('/imageurl', (req, res) => {
	app2.models
	   .predict(Clarifai.FACE_DETECT_MODEL,req.body.input)
	   .then(data => {
	   	res.json(data);
	   })
	   .catch(err => res.status(400).json('unable to work with api'))
	   })
	    
	   
	   // Load hash from your password DB.
	   
	   
	   
	   app.listen(3001, () => {
	 console.log("app is ok.");
}) 
