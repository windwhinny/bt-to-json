import fs = require('fs');

const ascii = '0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz'

function ats (a: number): string {
  return ascii[a - 48];
}

function sta (s: string): number | null {
  let index = ascii.indexOf(s);
  if (index === -1) return null;
  return index + 48;
}

export class Reader {
  index: number = 0;
  constructor(public buffer: Buffer) { }

  isEnd() {
    return this.index >= this.buffer.length;
  }

  readPieces() {
    let end = this.index;
    while (this.buffer[end] !== sta(':') && !this.isEnd()) {
      end++;
    }

    const size = Number(Buffer.from(this.buffer.slice(this.index, end)).toString());
    this.index = end + 1 + size;

    const array: Buffer[] = [];
    for (let i = end + 1; i < this.index; i+=20) {
      array.push(this.buffer.slice(i, i + 20));
    }
    return array;
  }

  readBuffer() {
    let end = this.index;
    while (this.buffer[end] !== sta(':') && !this.isEnd()) {
      end++;
    }

    const size = Number(Buffer.from(this.buffer.slice(this.index, end)).toString());
    this.index = end + 1 + size;
    return Buffer.from(this.buffer.slice(end+1, this.index));
  }

  readDictionaries() {
    const map: any = {};

    while (this.buffer[this.index] !== sta('e')) {
      if (this.isEnd()) return map;
      const key = this.readString();
      let value: any;
      if (['filehash', 'ed2k'].includes(key)) {
        value = this.readBuffer();
      } else if (key === 'pieces') {
        value = this.readPieces();
      } else {
        value = this.readFromBuffer();
      }
      map[key] = value;
    }
    this.index++;
    return map;
  }

  readString(): string {
    return this.readBuffer().toString();
  }

  readInt(): number {
    const start = this.index;
    let end = this.index;
    while(this.buffer[end] !== sta('e')) {
      if (this.isEnd()) return 0;
      end++;
    }
    this.index = end + 1;
    return Number(Buffer.from(this.buffer.slice(start, end)).toString());
  }

  readList() {
    const array: any[] = [];
    while (this.buffer[this.index] !== sta('e')) {
      if (this.isEnd()) return array;
      const result = this.readFromBuffer();
      array.push(result);
    }
    this.index++;
    return array;
  }

  readFromBuffer() {
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
        this.index ++;
        return this.readInt();
      }
    }
    return this.readString();
  }
}

export async function readFromFile(filename: string) {
  const buffer = await new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  }) as Buffer;
  return readFromBuffer(buffer);
}

export function readFromBuffer(buffer: Buffer) {
  const reader = new Reader(buffer);
  return reader.readFromBuffer();
}
