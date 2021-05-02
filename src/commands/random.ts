import crypto from "crypto";

class Random {
  private _s1: number;
  private _s2: number;
  private _s3: number;

  private _count: number = 0;
  private _period: number = 6953607871644;

  constructor(s1?: number, s2?: number, s3?: number) {
    this._s1 = Math.max(s1 || 0, 0) || crypto.randomBytes(4).readUInt32BE();
    this._s2 = Math.max(s2 || 0, 0) || crypto.randomBytes(4).readUInt32BE();
    this._s3 = Math.max(s3 || 0, 0) || crypto.randomBytes(4).readUInt32BE();
  }

  public next(): number {
    this._s1 = (171 * this._s1) % 30269;
    this._s2 = (172 * this._s2) % 30307;
    this._s3 = (170 * this._s3) % 30323;

    this._count = (this._count + 1) % this._period;
    return (this._s1 / 30269 + this._s2 / 30307 + this._s3 / 30323) % 1;
  }

  public peek(): number {
    return (
      (((171 * this._s1) % 30269) / 30269 +
        ((172 * this._s2) % 30307) / 30307 +
        ((170 * this._s3) % 30323) / 30323) %
      1
    );
  }

  public range(min: number, max: number) {
    return min + ~~(this.next() * (max - min + 1));
  }

  public pick<T>(items: T[]): T {
    return items[~~(this.next() * items.length)];
  }

  public get count() {
    return this._count;
  }

  public get s1() {
    return this._s1;
  }

  public get s2() {
    return this._s2;
  }

  public get s3() {
    return this._s3;
  }
}

export default new Random();
