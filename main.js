
function findIndexOfString(arr, str) {

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].localeCompare(str) == 0) {
      return i;
    }
  }

  return -1;
}
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
  let srcUsers = users.slice();
  let targetUsers = users.slice();

  let santaMap = [];

  // Fix the probabilities
  if (typeof bias1 !== 'undefined' && typeof bias2 !== 'undefined') {

    let srcIndex = findIndexOfString(srcUsers, bias1);
    let dstIndex = findIndexOfString(targetUsers, bias2);

    let name = srcUsers[srcIndex];
    srcUsers.splice(srcIndex, 1);

    let target = targetUsers[dstIndex];
    targetUsers.splice(dstIndex, 1);

    let tuple = {name: name, target: target};
    santaMap.push(tuple);
  }

  while (srcUsers.length > 0) {
    // Pick a random source user and remove
    let rndSrcIndex = Math.floor((Math.random() * srcUsers.length) + 0);
    let name = srcUsers[rndSrcIndex];


    // Pick a random destination user
    let rndDstIndex = Math.floor((Math.random() * targetUsers.length) + 0);
    let target = targetUsers[rndDstIndex];

    // Bad tuple
    if (name.localeCompare(target) != 0) {
      targetUsers.splice(rndDstIndex, 1);
      srcUsers.splice(rndSrcIndex, 1);

      let tuple = {name: name, target: target};
      santaMap.push(tuple);
    } else {
      if (targetUsers.length == 1) {
        console.error("It broke! Better retry!");
        return undefined;
      }
    }
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

function findTargetInMap(map, target) {

  for (let i = 0; i < map.length; i++) {

    if (typeof map[i].target === 'undefined') {
      console.error("findTargetInMap: typeof map[i].target === 'undefined'");
      console.error(map);
      console.error(target);
      return null;
    }

    if (map[i].target.localeCompare(target) == 0) {
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

  let newSantaMapCompound = {users: santaMapCompound.users.slice(), data: newSantaMap};
  return newSantaMapCompound;
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

function runTestsOnSantaMapCompound(santaMapCompound, secretSantaMapCompound, keyMap, bias1, bias2) {
  let users = santaMapCompound.users;
  let data = santaMapCompound.data;

  let requiredUsers = ["Paul", "Marie", "Rob", "Evert", "Janie", "Louis", "Duncan"];

  if (users.length != requiredUsers.length) {
    console.error("users.length != requiredUsers.length");
    return false;
  }

  // Check that all users are in the map list and the data list
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < requiredUsers.length; j++) {
      if (findIndexOfString(users, requiredUsers[j]) == -1) {
        console.error("Could not find user from requiredUsers in santaMapCompound.users!");
        console.error(requiredUsers[j]);
        return false;
      }

      if (findNameInMap(santaMapCompound.data, requiredUsers[j]) == null) {
        console.error("Could not find user from requiredUsers in santaMapCompound.data!");
        console.error(requiredUsers[j]);
        return false;
      }

      if (findTargetInMap(santaMapCompound.data, requiredUsers[j]) == null) {
        console.error("Could not find target from requiredUsers in santaMapCompound.data!");
        console.error(requiredUsers[j]);
        return false;
      }
    }
  }

  // Make sure x -> x does not exist
  for (let i = 0; i < data.length; i++) {
    if (data[i].name.localeCompare(data[i].target) == 0) {
      console.error("A user has itself as the target!");
      return false;
    }
  }

  // Count cycles
  let cycles = 0;
  for (let i = 0; i < data.length; i++) {
    let name = data[i].name;
    let target = data[i].target;

    let targetTuple = findNameInMap(santaMapCompound.data, target);
    let targetTarget = targetTuple.target;


    if (name.localeCompare(targetTarget) == 0) {
      cycles++;
    }
  }

  if (cycles > 0) {
    console.warn("Detected " + cycles + " cycles!");
  }

  // Try to decrypt all the data
  for (let i = 0; i < keyMap.length; i++) {
    let name = keyMap[i].name;
    let key = keyMap[i].key;
    let target = findNameInMap(santaMapCompound.data, name).target;

    let tuple = decryptSantaMap(secretSantaMapCompound, key);

    if (typeof tuple === null || typeof tuple === undefined) {
      console.error("Unable to decrypt santa map!");
      return false;
    }

    if (tuple.name != name) {
      console.error("Wrong name in encrypted tuple!");
      return false;
    }

    if (tuple.target != target) {
      console.error("Wrong target in encrypted tuple!");
      return false;
    }
  }


  // Test invalid user

  if (findNameInMap(santaMapCompound.data, "L33T_HAX0R") != null) {
    console.error("Found a tuple given an invalid name");
    return false;
  }

  if (findTargetInMap(santaMapCompound.data, "L33T_HAX0R") != null) {
    console.error("Found a tuple given an invalid name");
    return false;
  }

  if (decryptSantaMap(secretSantaMapCompound, "L33T_HAX0R") != null) {
    console.error("Decrypted given an invalid key");
    return false;
  }

  // Test bias
  if (typeof bias1 !== 'undefined' && typeof bias2 !== 'undefined') {
    let bias1Tuple = findNameInMap(santaMapCompound.data, bias1);
    let bias2Tuple = findNameInMap(santaMapCompound.data, bias2);

    if (bias1Tuple.target.localeCompare(bias2Tuple.name) != 0) {
      console.error("Bias did not take effect!");
      return false;
    }
  }

  return true;

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
