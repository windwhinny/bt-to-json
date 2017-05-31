"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var ascii = '0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz';
function ats(a) {
    return ascii[a - 48];
}
function sta(s) {
    var index = ascii.indexOf(s);
    if (index === -1)
        return null;
    return index + 48;
}
var Reader = (function () {
    function Reader(buffer) {
        this.buffer = buffer;
        this.index = 0;
    }
    Reader.prototype.isEnd = function () {
        return this.index >= this.buffer.length;
    };
    Reader.prototype.readPieces = function () {
        var end = this.index;
        while (this.buffer[end] !== sta(':') && !this.isEnd()) {
            end++;
        }
        var size = Number(Buffer.from(this.buffer.slice(this.index, end)).toString());
        this.index = end + 1 + size;
        var array = [];
        for (var i = end + 1; i < this.index; i += 20) {
            array.push(this.buffer.slice(i, i + 20));
        }
        return array;
    };
    Reader.prototype.readBuffer = function () {
        var end = this.index;
        while (this.buffer[end] !== sta(':') && !this.isEnd()) {
            end++;
        }
        var size = Number(Buffer.from(this.buffer.slice(this.index, end)).toString());
        this.index = end + 1 + size;
        return Buffer.from(this.buffer.slice(end + 1, this.index));
    };
    Reader.prototype.readDictionaries = function () {
        var map = {};
        while (this.buffer[this.index] !== sta('e')) {
            if (this.isEnd())
                return map;
            var key = this.readString();
            var value = void 0;
            if (['filehash', 'ed2k'].includes(key)) {
                value = this.readBuffer();
            }
            else if (key === 'pieces') {
                value = this.readPieces();
            }
            else {
                value = this.readFromBuffer();
            }
            map[key] = value;
        }
        this.index++;
        return map;
    };
    Reader.prototype.readString = function () {
        return this.readBuffer().toString();
    };
    Reader.prototype.readInt = function () {
        var start = this.index;
        var end = this.index;
        while (this.buffer[end] !== sta('e')) {
            if (this.isEnd())
                return 0;
            end++;
        }
        this.index = end + 1;
        return Number(Buffer.from(this.buffer.slice(start, end)).toString());
    };
    Reader.prototype.readList = function () {
        var array = [];
        while (this.buffer[this.index] !== sta('e')) {
            if (this.isEnd())
                return array;
            var result = this.readFromBuffer();
            array.push(result);
        }
        this.index++;
        return array;
    };
    Reader.prototype.readFromBuffer = function () {
        switch (this.buffer[this.index]) {
            case sta('d'): {
                this.index++;
                return this.readDictionaries();
            }
            case sta('l'): {
                this.index++;
                return this.readList();
            }
            case sta('i'): {
                this.index++;
                return this.readInt();
            }
        }
        return this.readString();
    };
    return Reader;
}());
exports.Reader = Reader;
function readFromFile(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        fs.readFile(filename, function (err, data) {
                            if (err)
                                reject(err);
                            resolve(data);
                        });
                    })];
                case 1:
                    buffer = _a.sent();
                    return [2 /*return*/, readFromBuffer(buffer)];
            }
        });
    });
}
exports.readFromFile = readFromFile;
function readFromBuffer(buffer) {
    var reader = new Reader(buffer);
    return reader.readFromBuffer();
}
exports.readFromBuffer = readFromBuffer;
//# sourceMappingURL=index.js.map