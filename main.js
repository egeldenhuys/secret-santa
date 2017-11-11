
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
    console.log("Applying the bias");

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
    console.log("Picking user...");
    // Pick a random source user and remove
    let rndSrcIndex = Math.floor((Math.random() * srcUsers.length) + 0);
    console.log(rndSrcIndex);
    console.log(srcUsers.length);
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
        console.error("It broke!");
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
