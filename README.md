# bt-to-json
A node module for parse `.torrent` file to json format.

## Install
```
$ npm install bt-to-json --save
```

## Useage
```javascript
import { readFromFile, readFromBuffer } from 'btToJson';

let result;
result = await readFromFile('test.torrent');
result = readFromBuffer(buffer);
```

