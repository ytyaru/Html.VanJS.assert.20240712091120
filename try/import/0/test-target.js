/*
export class TestTargetError extends Error {
    constructor(msg, cause) {
        super(msg, {cause,cause});
        this.name = 'TestTargetError';
        this.cause = cause;
    }
}
*/
/*
export default class TestTarget {
    getTrue() { return true }
    getFalse() { return false }
    throwError() { throw new TestTargetError('例外を投げます。') }
    async getTrueAsync() { return new Promise((resolve)=>resolve(true)) }
    async getFalseAsync() { return new Promise((resolve)=>resolve(false)) }
    //async throwErrorAsync() { return new Promise((resolve)=>resolve(new Error('例外を投げます。'))) }
    async throwErrorAsync() { return new Promise((resolve,reject)=>reject(new TestTargetError('例外を投げます。'))) }
    isAge(age) { return Number.isInteger(age) && 0<=age && age<=100 }
    async isAgeAsync(age) { return new Promise((resolve, reject)=>{
        if (Number.isInteger(age) && 0<=age && age<=100) {resolve(age)}
        else{reject(new TypeError(`第一引数ageは年齢を表す0以上100以下の整数値であるべきです。`))}
    }) }
}
*/
export default class C {}
