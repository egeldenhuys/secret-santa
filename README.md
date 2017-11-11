# secret-santa
Secret Santa web page

## Process
- Static HTML and JavaScript
- Create random map of source -> destination store in JSON
- Create random secret key for each source
- Encrypt their mapping with their key
- User opens web page and enters their secret key
- We try to decrypt all the data using their key
- The data data that is successfully decrypted must belong to them
- Display them their secret santa target

```
JSON containing encrypted data:

{
"usermap": ["<ENCRYPTED>", "<ENCRYPTED>", "<ENCRYPTED>"...]
}

Where <Encrypted> is in the form source:target
```