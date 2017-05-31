/// <reference types="node" />
export declare class Reader {
    buffer: Buffer;
    index: number;
    constructor(buffer: Buffer);
    isEnd(): boolean;
    readPieces(): Buffer[];
    readBuffer(): Buffer;
    readDictionaries(): any;
    readString(): string;
    readInt(): number;
    readList(): any[];
    readFromBuffer(): any;
}
export declare function readFromFile(filename: string): Promise<any>;
export declare function readFromBuffer(buffer: Buffer): any;
