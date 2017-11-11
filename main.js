// Returns a santaMap
/*
{
  "validUsers": ["Bob"...],
  "data":
  [
    {"name":"Bob","target":"Susan"},
    {"name":"Susan","target":"Bob"},
    {"name":"Fred","target":"Johno"}
  ]
}
*/
function generateSantaMap(users, bias1, bias2) {

  // Create Copy of array
  let userArray = users.slice();

  let queue = [];
  let santaMap = [];

  // Create random queue from the given user array
  while (userArray.length > 0) {
    let rndIndex = Math.floor((Math.random() * userArray.length) + 0);
    queue.push(userArray[rndIndex])

    // remove name from users array
    userArray.splice(rndIndex, 1);
  }

  // Make the queue biased
  // bias1 will be at front
  // bias2 will be after bias1
  // Thus bias1 will always get bias2 as a target
  let foundCounter = 0;

  if (typeof bias1 !== 'undefined' && typeof bias2 !== 'undefined') {
    // Remove bias1 and bias2 from the queue
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].localeCompare(bias1) == 0) {
          queue.splice(i, 1);
          foundCounter++;
          break;
        }
      }

    // Remove bias2
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].localeCompare(bias2) == 0) {
          queue.splice(i, 1);
          foundCounter++
          break;
        }
      }

    if (foundCounter != 2) {
      console.error("Bias does not exist in user array!");
      return undefined;
    }
    // Ass bias1 and 2 to the back
    queue.push(bias1);
    queue.push(bias2);

    // Rotate the queue n - 2 times right
    for (let i = 0; i < queue.length - 2; i++) {
      let tmp = queue.shift();
      queue.push(tmp);
    }
  }

  // Use the queue for the santa map
  for (let i = 0; i < queue.length; i++) {
    // Rotate array left, and record who was at front
    let name = queue.shift();
    queue.push(name);

    let target = queue[0];
    let tuple = {name: name, target: target};

    santaMap.push(tuple);
  }

  let santaCompound = {users: users, data: santaMap};
  return santaCompound;
}


/*
Generate random secret keys for the users
Returns in the form
{
  [
    {"name": "Bob", "key": "L33T_HAX0R"},
    {"name": "Sarah", "key": "MLP"}
  ]
}
*/
function generateSecretKeyMap(users) {

  let secretKeyMap = []

  for (let i = 0; i < users.length; i++) {
    let name = users[i];
    let pass = randomPassword(8);
    let tuple = {name: name, key: pass};
    secretKeyMap.push(tuple);
  }

  return secretKeyMap;
}

// Find a user in the data structure of the form
// Returns the tuple for that user
/*
[
  {"name":"Bob","key":"Susan"},
  {"name":"Susan","key":"Bob"},
  {"name":"Fred","key":"Johno"}
]
*/
function findNameInMap(map, name) {

  for (let i = 0; i < map.length; i++) {
    if (map[i].name.localeCompare(name) == 0) {
      return map[i];
    }
  }

  return null;
}

// https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption
// Encrypt each user's data with their own key
/*

{
  "validUsers": ["Bob"...]
  [
    {"name":"SDGsdfs","target":"SDf345gerwer"},
  ]
}
*/
function encryptSantaMap(santaMapCompound, secretKeyMap) {

  let santaMap = santaMapCompound.data;

  let newSantaMap = []

  for (let i = 0; i < santaMap.length; i++) {
    let tuple = findNameInMap(secretKeyMap, santaMap[i].name);

    if (tuple == null) {
      console.error("Could not find a name in the key map!");
      return undefined;
    }

    let newName = CryptoJS.AES.encrypt(santaMap[i].name, tuple.key);
    let newTarget = CryptoJS.AES.encrypt(santaMap[i].target, tuple.key);

    let newTuple = {name: newName.toString(), target: newTarget.toString()};
    newSantaMap.push(newTuple);
  }

  santaMapCompound.data = newSantaMap;
  return santaMapCompound;
}

function isStringInArray(arr, str) {

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].localeCompare(str) == 0) {
      return true;
    }
  }

  return false;
}

// Try to decrypt all fields, return the one we could encrypt
function decryptSantaMap(encryptedSantaMapCompound, key) {

  let encryptedSantaMap = encryptedSantaMapCompound.data;

  for (let i = 0; i < encryptedSantaMap.length; i++) {
    let newName = "";
    try {
      newName = CryptoJS.AES.decrypt(encryptedSantaMap[i].name, key).toString(CryptoJS.enc.Utf8);
    } catch (e) {

      // void
    }

    if (isStringInArray(encryptedSantaMapCompound.users, newName)) {
      let newTarget = "";

      try {
        newTarget = CryptoJS.AES.decrypt(encryptedSantaMap[i].target, key).toString(CryptoJS.enc.Utf8);
      } catch (e) {
        return undefined;
      }

      let tuple = {name: newName, target: newTarget};
      return tuple;
    }

  }

  return null;
}


// https://jsfiddle.net/Guffa/DDn6W/
function randomPassword(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
}
