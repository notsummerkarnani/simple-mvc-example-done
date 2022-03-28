// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat model
const { Cat } = models;

// get the Dog model
const { Dog } = models;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);

// default fake data so that we have something to work with until we make a real Dog
const defaultDogData = {
  name: 'unknown',
  age: 0,
  breed: 'unknown',
};

// object for us to keep track of the last Dog we made and dynamically update it sometimes
let lastDogAdded = new Dog(defaultDogData);

// Function to handle rendering the index page.
const hostIndex = (req, res) => {
  /* res.render will render the given view from the views folder. In this case, index.
                   We pass it a number of variables to populate the page.
                */
  res.render('index', {
    currentName: lastAdded.name || lastDogAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// Function for rendering the page1 template
// Page1 has a loop that iterates over an array of cats
const hostPage1 = async (req, res) => {
  try {
    const docs = await Cat.find({}).lean().exec();

    // Once we get back the docs array, we can send it to page1.
    return res.render('page1', { cats: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

// Function to render the untemplated page2.
const hostPage2 = (req, res) => {
  res.render('page2');
};

// Function to render the untemplated page3.
const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = async (req, res) => {
  try {
    const docs = await Dog.find({}).lean().exec();

    return res.render('page4', { dogs: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find dogs' });
  }
};

// Get name will return the name of the last added cat.
const getName = (req, res) => res.json({ name: lastAdded.name });

// Get dog name will return the name of the last added cat.
const getDogName = (req, res) => res.json({ name: lastDogAdded.name });

// Function to create a new cat in the database
const setName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }

  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(catData);

  try {
    await newCat.save();

    lastAdded = newCat;
    return res.json({
      name: lastAdded.name,
      beds: lastAdded.bedsOwned,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }
};

// Function to create a new dog in the database
const setDogName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.age || !req.body.breed) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'firstname, lastname, age and breed are all required' });
  }

  const dogData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    age: req.body.age,
    breed: req.body.breed,
  };

  const newDog = new Dog(dogData);

  try {
    await newDog.save();

    lastDogAdded = newDog;
    return res.json({
      name: lastDogAdded.name,
      age: lastDogAdded.age,
      breed: lastDogAdded.breed,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create dog' });
  }
};

// Function to handle searching a cat by name.
const searchName = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  try {
    const doc = await Cat.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    // Otherwise, we got a result and will send it back to the user.
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

// Function to handle searching a dog by name and then add its age by one
const searchDogName = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  try {
    const doc = await Dog.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }

    doc.age++;

    const savePromise = doc.save();

    // If we successfully save/update them in the database, send back the cat's info.
    return savePromise.then(() => res.json({
      name: doc.name,
      age: doc.age,
      breed: doc.breed,
    }));
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const updateLast = (req, res) => {
  // First we will update the number of bedsOwned.
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

const updateLastDog = (req, res) => {
  // First we will update the number of bedsOwned.
  lastDogAdded.age++;

  const savePromise = lastDogAdded.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastDogAdded.name,
    age: lastDogAdded.age,
    breed: lastDogAdded.breed,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  getName,
  getDogName,
  setName,
  setDogName,
  updateLast,
  updateLastDog,
  searchName,
  searchDogName,
  notFound,
};
