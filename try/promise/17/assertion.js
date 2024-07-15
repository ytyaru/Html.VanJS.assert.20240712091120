(function(){
class Message {
    constructor(lang) {
        this._common = {
            ja: {'true':'真','false':'偽'},
            en: {'true':'true','false':'false'},
        }
        this._message = {
            ja: {
                normal: {
                    exception: {
                        return: 'テスト例外。引数は真偽値かそれを返す関数であるべきです。',
                        fnReturn: 'テスト例外。テストコードは最後に真偽値を返してください。',
                        throw:(e)=>`テスト例外。${e}であるべき所で例外発生しました。`,
                    },
                    fail: {
                        value:(e,a)=>`テスト失敗。${e}であるべき所が${a}です。`,
                        exception:(e)=>`テスト失敗。${e}であるべき所で例外発生しました。`,
                    },
                },
                exception: {
                    augument:{
                        summary:(num)=>`テスト例外。引数不正です。${2<=num ? '\n' : ''}`,
                        triple:`引数は次の3つ必要です:\n1. 期待する例外型\n2. 期待する例外メッセージ(String/RegExp)\n3. 例外発生する無名関数`,
                        first:`第一引数は期待する例外型でありErrorかそれを継承した型であるべきです。`,
                        second:`第二引数は期待する例外メッセージを示す文字列型Stringか正規表現RegExp型であるべきです。`,
                        third:`第三引数は例外を発生させる関数であるべきです。`,
                    },
                    runtime:{
                        //fnReturn: 'テスト例外。テストコードは最後に真偽値を返してください。',
                        fnReturn: 'テスト例外。テストコードは例外発生させてください。例外発生しない上にPromiseを返すのは間違いです。あるいはテストコードを非同期関数async()=>{await Promise; return Boolean;}の形にしてください。',
                        summary:(num)=>`テスト失敗: ${2<=num ? '\n' : ''}`,
                        type:(e,a)=>`型が違います。\n期待値: ${e}\n実際値: ${a}`,
                        msg:(e,a)=>`メッセージが違います。\n期待値: ${e}\n実際値: ${a}`,
                        noneException:`テスト失敗。例外発生すべき所で例外発生せず正常終了しました。`,
                    },
                },
            },
            en: {
                normal: {
                    exception: {
                        return: 'Test exception. The argument should be a boolean value or a function that returns one.',
                        fnReturn: 'Test exception. Please return a boolean value at the end of your test code.',
                    },
                    fail: {
                        value:(e,a)=>`Test failed. Where ${e} should be, it is ${a}.`,
                        exception:(e)=>`Test failed. An exception occurred where ${e} should be.`,
                    },
                },
                exception: {
                    augument:{
                        summary:(num)=>`Test exception. Invalid argument.${2<=num ? '\n' : ''}`,
                        triple:`The following three arguments are required:\n1. Expected exception type\n2. Expected exception message (String/RegExp)\n3. Anonymous function that raises the exception.`,
                        first:`The first argument is the expected exception type, which should be Error or a type that inherits from it.`,
                        second:`The second argument should be a string type String or regular expression RegExp type indicating the expected exception message.`,
                        third:`The third argument should be the function that raises the exception.`,
                    },
                    runtime:{
                        summary:(num)=>`Test failed: ${2<=num ? '\n' : ''}`,
                        type:(e,a)=>`Type is different.\nExpected: ${e}\nActual: ${a}`,
                        msg:(e,a)=>`Message is different.\nExpected: ${e}\nActual: ${a}`,
                        noneException:`Test failed. The program completed normally without generating an exception where it should have occurred.`,
                    },
                },
            }
        }
        this.#initLang(lang)
    }
    get msg() { return this._message[(this._message.hasOwnProperty(this._lang) ? this._lang : 'ja')] }
    get cmn() { return this._common[(this._message.hasOwnProperty(this._lang) ? this._lang : 'ja')] }
    #initLang(lang) {
        if (this.#hasDict(lang)) { this._lang = lang }
        else {
            const l = this.#getLang
            if (this.#hasDict(l)) { this._lang = l }
            else { this._lang = 'en' }
        }
    }
    get #validLang() { return this.has(this._lang) ? this._lang : 'en' }
    #hasDict(lang) { return ([...Object.keys(this._common)].includes(lang) && [...Object.keys(this._message)].includes(lang)) }
    get #getLang() { return (window.navigator.languages && window.navigator.languages[0]) ||
        window.navigator.language ||
        window.navigator.userLanguage ||
        window.navigator.browserLanguage;
    }
}
class AssertError extends Error {
    constructor(msg, cause) {
        super(msg, {cause,cause});
        this.name = 'AssertError';
        this.cause = cause;
    }
}
class BaseAssertion {
    constructor(M) { this._M = M; this._asyncs = []; this._asyncDict = {};}
    _consoleFail(msg, caller) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, caller ?? this._result);
            const s = this.stack.split('\n')
            s.shift() // 先頭にある Error 削除
            console.error(msg + '\n', this.__delStacks(s).join('\n'))
        } else { console.error(msg) }
    }
    _consoleError(msg, err, caller) {
        if (Error.captureStackTrace) {
            //const errs = this._recursionCause([err])
            //const init = []
            //const stacks = errs.map(e=>this.__delStacks(e.stack)).flat()
            //console.error(msg, '\n', stacks.join('\n'))
            //console.log(msg)
            //console.log(this._getErrorStacks(err).join('\n'))
            //console.error(msg, '\n', this._getErrorStacks(err).join('\n'))
            console.error([...new Set([...msg.split('\n'), ...this._getErrorStacks(err)])].join('\n'))
        } else { console.error(msg) }
    }
    _getErrorStacks(err) {
        const errs = this._recursionCause([err])
        console.log(errs)
        //return [...new Set(s.filter(line=>-1===line.indexOf('assertion.js:')))]
        return errs.map(e=>this.__delStacks(e.stack)).flat()
    }
    _recursionCause(errs) {
        const last = errs[errs.length-1]
        if (last.hasOwnProperty('cause') && last.cause) {
            errs.push(last.cause)
            return this._recursionCause(errs)
        } else { return errs }
    }
    __isBool(v) { return 'boolean'===typeof v }
    __isFn(v) { return 'function'===typeof v }
    __isStr(v) { return 'string'===typeof v || v instanceof String }
    __isAsyncFunction(v) { return v instanceof (async()=>{}).constructor }
    __isNullOrUndefined(v) {
        if (v === null) return true;
        if(v === undefined) return true;
        return false;
    }
    __isGenealogy(a, e) { // aがeの系譜（同一または子孫クラス）であれば真を返す
        if (a instanceof e || a.constructor.name === e.constructor.name) { return true }
        if (a.prototype) { return this.__isGenealogy(a.prototype, e) }
        return false
    }
    __getCaller(removeTxt) {
        const error = new Error();
        const stack = error.stack || '';
        const stacks = stack.split('\n');
        const callerIndex = stacks.findIndex(line => line.includes('__getCaller'));
        if (!removeTxt) {removeTxt='assertion.js:'} // このファイル名が含まれるスタックトレースは削除する
        return (stacks[callerIndex]) ? this.__delStacks(stacks.slice(callerIndex)).join('\n') : 'Unknown'
    }
    __delStacks(stacks) {
        const s = Array.isArray(stacks) ? stacks : (this.__isStr(stacks) ? stacks.split('\n') : null)
        if (null===s) { throw new AssertError(`内部エラー。__delStacksの引数は文字列かその配列であるべきです。`) }
        return s.filter(line=>-1===line.indexOf('assertion.js:'))
        //return [...new Set(s.filter(line=>-1===line.indexOf('assertion.js:')))]
    }
}
class BoolAssertion extends BaseAssertion {
    constructor(M,C,isFalseSuccess) {
        super(M)
        this._caller = this.assert
        this._count = C
        this._isFalseSuccess = isFalseSuccess
//        this._asyncDict = {}
        this._asyncs = []
    }
    get count() { return this._count }
    assert(fn) {
        //if (this.__isAsyncFunction(fn)) { this._count.pending++; this._asyncDict[fn] = this.__getCaller(); this._asyncs.push(fn) }
        //if (this.__isAsyncFunction(fn)) { this._count.pending++; this._asyncDict[fn] = this.__getCaller(); }
        if (this.__isAsyncFunction(fn)) { this._count.pending++; this._asyncs.push([fn, this.__getCaller()]); }
        else if (this.__isFn(fn)) { this._nFn(fn) }
        else if (this.__isBool(fn)) { this._nB(fn) }
        else { this._consoleFail(this._M.msg.normal.exception.return, this._caller) } // テスト例外。引数は真偽値かそれを返す関数であるべきです。
    }
    _getAsyncPromises() {
        const promises = []
        //for (let fn of this._asyncs) {
        //console.log(Object.keys(this._asyncDict))
        //for (let fn of Object.keys(this._asyncDict)) {
        //for (let [fn, stack] of this._asyncs) {
        for (let i=0; i<this._asyncs; i++) {
            promises.push(new Promise((resolve,reject)=>{
                const fn = this._asyncs[i][0]
                const stack = this._asyncs[i][1]
                fn().then((bool)=>{
                    const eMsg = this.__nCheckMsg(bool)
                    //if (eMsg) { reject(new AssertError(eMsg + '\n' + this._asyncDict[fn])) }
                    if (eMsg) { reject(new AssertError(eMsg + '\n' + stack)) }
                    else {resolve(this._isFalseSuccess===bool)} // テスト成功：真、失敗：偽
                }).catch(err=>{
                    this._count.exception++; 
                    reject(new AssertError(
                        this._M.msg.normal.exception.throw(this._M.cmn[this._isFalseSuccess ? 'false' : 'true'])
                        + '\n' + stack
                        //+ '\n' + this._asyncDict[fn]
                    ))
                })
            }))
        }
        return promises
    }
    _nFn(fn) {
        try {
            const bool = fn()
            const eMsg = this.__nCheckMsg(bool)
            if (eMsg) {this._consoleFail(eMsg, this._caller)}
        } catch(err) {
            this.__exceptMsg(err)
        }
    }
    _nB(fn) {
        if (this._isFalseSuccess ? fn : !fn) { this._count.fail++; this._consoleFail(this.__failMsg(), this._caller) }
    }
    __nCheckMsg(bool) {
        if (!this.__isBool(bool)) { this._count.exception++; return this._M.msg.normal.exception.fnReturn }
        if (this._isFalseSuccess ? bool : !bool) { this._count.fail++; return this.__failMsg(); }
        this._count.success++
        return ''
    }
    __nCheck(bool) {
        console.log(bool, this._isFalseSuccess)
        // テスト例外。テストコードは最後に真偽値を返してください。
        if (!this.__isBool(bool)) { this._count.exception++; return this._consoleFail(this._M.msg.normal.exception.fnReturn, this._caller) }
        // テスト失敗：Eであるべき所がAです。
        if (this._isFalseSuccess ? bool : !bool) { this._count.fail++; return this._consoleFail(this.__failMsg(), this._caller) }
        // テスト成功
        this._count.success++
        return true
    }
    __failMsg() {
        const ea = [this._M.cmn.true, this._M.cmn.false]
        if (this._isFalseSuccess) { ea.reverse() }
        return this._M.msg.normal.fail.value(...ea) // テスト失敗。${j[0]}であるべき所が${j[1]}です。
    }
    __exceptMsg(err) { this._count.exception++; this._consoleError(this._M.msg.normal.exception.throw(this._M.cmn[this._isFalseSuccess ? 'false' : 'true']), err, this._caller) } // テスト例外。${isFalseSuccess ? '偽' : '真'}であるべき所で例外発生しました。
}
class TrueAssertion extends BoolAssertion {
    constructor(M,C){super(M,C,false)}
}
class FalseAssertion extends BoolAssertion {
    constructor(M,C){super(M,C,true)}
}
class ExceptionAssertion extends BaseAssertion {
    constructor(M,C) { super(M); this._count=C; }
    assert(type, msg, fn) {
        if (this._ePrmErr(type, msg, fn)) return
        return this._error(type, msg, fn)
    }
    get count() { return this._count }
    _ePrmErr(type, msg, fn) {
        let eMsgs = []
        // `引数は次の3つ必要です:\n1. 期待する例外型\n2. 期待する例外メッセージ(String/RegExp)\n3. 例外発生する無名関数`
        if ([type,msg,fn].some(v=>this.__isNullOrUndefined(v))) { eMsgs.push(this._M.msg.exception.augument.triple) }
        // `第一引数は期待する例外型でありErrorかそれを継承した型であるべきです。`
        if (!this.__isGenealogy(type, Error)) { eMsgs.push(this._M.msg.exception.augument.first) }
        // `第二引数は期待する例外メッセージを示す文字列型Stringか正規表現RegExp型であるべきです。`
        if (!this.__isStr(msg)) { eMsgs.push(this._M.msg.exception.augument.second) }
        // `第三引数は例外を発生させる関数であるべきです。`
        if (!(this.__isAsyncFunction(fn)) && 'function'!==typeof fn) {eMsgs.push(this._M.msg.exception.augument.third)}
        if (0<eMsgs.length) {
            this._consoleFail(this._M.msg.exception.augument.summary(eMsgs.length) + eMsgs.join('\n'), this.e)
            return true
        }
    }
    _error(type, msg, fn) {
        //if (this.__isAsyncFunction(fn)) { this._count.pending++; this._asyncs.push([type, msg, fn]); }
        //if (this.__isAsyncFunction(fn)) {this._count.pending++; this._asyncDict[fn] = this.__getCaller(); this._asyncs.push(fn);}
        if (this.__isAsyncFunction(fn)) { this._count.pending++; this._asyncs.push([type, msg, fn, this.__getCaller()]); }
        else if (this.__isFn(fn)) { this._eFn(type, msg, fn) }
    }
    _getAsyncPromises() {
        const promises = []
        //for (let a of this._asyncs) {
        //    const [type, msg, fn] = a
        for (let i=0; i<this._asyncs.length; i++) {
            promises.push(new Promise((resolve,reject)=>{
                const [type, msg, fn, stack] = this._asyncs[i]
                //console.log(type, msg, fn, stack)
                fn().then((bool)=>{
                    //this._consoleFail(this.__errorMsg(), this.e)
                    //reject(new AssertError(this.__errorMsg()))
                    //this._count.exception++; 
                    this._count.fail++; 
                    reject(new AssertError(this.__errorMsg()+'\n'+stack))
                }).catch(err=>{
                    //resolve(this.__eCheck(type, msg, err))
//                    resolve(this.__eCheckMsgs(type, msg, err, stack))
                    const eMsgs = this.__eCheckMsgs(type, msg, err)
                    if (0===eMsgs.length) { this._count.success++; resolve(true) }
                    else {
                        this._count.fail++
                        reject(new AssertError(`${this._M.msg.exception.runtime.summary(eMsgs.length)}` + eMsgs.join('\n')))
//                        reject(new AssertError(
//                            `${this._M.msg.exception.runtime.summary(eMsgs.length)}` + 
//                            eMsgs.join('\n')+'\n'+this._getErrorStacks(err).join('\n')))
                    }
                    //this.__delStacks(stack).join('\n')
                })
            }))
        }
        return promises
    }
    _eAsync(type, msg, fn) {
        fn().then((bool)=>{
            this._consoleFail(this.__errorMsg(), this.e)
        }).catch(err=>{
            this.__eCheck(type, msg, err)
        })
    }
    _eFn(type, msg, fn) {
        try {
            console.log('A')
            const bool = fn()
            console.log('B')
            if (bool instanceof Promise) { this._count.exception++; return this._consoleFail(this._M.msg.exception.runtime.fnReturn, this.e);}
            //if (bool instanceof Promise) { this.exception++; throw new AssertError(this._M.msg.exception.runtime.fnReturn);}
            //if (!this.__isBool(bool)) { this.exception++; throw new AssertError(this._M.msg.exception.runtime.fnReturn);}
            this._count.fail++
            this._consoleFail(this.__errorMsg(), this.e)
            return false
        } catch(err) {
//            this.__eCheck(type, msg, err)
            const eMsgs = this.__eCheckMsgs(type, msg, err)
            //if (0===eMsgs.length) { this._count.success++; resolve(true) }
            if (0===eMsgs.length) { this._count.success++; return true; }
            else {
//                console.log('AAAAAAAAAAAAAa')
                this._count.fail++;
                //this._consoleFail(this.__errorMsg(), this.e)
                this._consoleError(`${this._M.msg.exception.runtime.summary(eMsgs.length)}`+eMsgs.join('\n'), err, this.e)
//                this._consoleError(`${this._M.msg.exception.runtime.summary(eMsgs.length)}` + 
//                    eMsgs.join('\n')+'\n'+this._getErrorStacks(err).join('\n'), err, this.e)
//                this._consoleFail(`${this._M.msg.exception.runtime.summary(eMsgs.length)}` + 
//                    eMsgs.join('\n')+'\n'+this._getErrorStacks(err).join('\n'))), this.e)
//                this._consoleError(``, new AssertError(), this.e)
//                reject(new AssertError(
//                `${this._M.msg.exception.runtime.summary(eMsgs.length)}` + 
//                eMsgs.join('\n')+'\n'+this._getErrorStacks(err).join('\n'))) }
            }
        }
    }
    __eCheck(type, msg, err, stack) {
        const eMsgs = [this.__eCheckTypeMsg(type, err), this.__eCheckMsgMsg(msg, err)].filter(v=>v)
        if (0<eMsgs.length) { // テスト失敗: ...
            //this._consoleFail(`${this._M.msg.exception.runtime.summary(eMsgs.length)}${eMsgs.join('\n')}`, this.e)
            console.log(stack)
            this._consoleError(`${this._M.msg.exception.runtime.summary(eMsgs.length)}${eMsgs.join('\n')}\n${stack}`, err, this.e)
            this._count.fail++
            return false
        } else { this._count.success++; return true; }

    }
    /*
    __eCheck(type, msg, err) {
        const eMsgs = [this.__eCheckTypeMsg(type, err), this.__eCheckMsgMsg(msg, err)].filter(v=>v)
        if (0<eMsgs.length) { // テスト失敗: ...
            this._consoleFail(`${this._M.msg.exception.runtime.summary(eMsgs.length)}${eMsgs.join('\n')}`, this.e)
            this._count.fail++
            return false
        } else { this._count.success++; return true; }
    }
    */
    __eCheckMsgs(type, msg, err) { return [this.__eCheckTypeMsg(type, err), this.__eCheckMsgMsg(msg, err)].filter(v=>v) }
    __eCheckTypeMsg(type, err) {
//        if (err instanceof type) { return '' }
        if (err.constructor.name === type.name) { return '' }
//        return `型が違います。\n期待値: ${type.name}\n実際値: ${err.constructor.name}`
        return this._M.msg.exception.runtime.type(type.name, err.constructor.name)
    }
    __eCheckMsgMsg(msg, err) {
        if (msg instanceof RegExp) {
            if (msg.test(msg)) { return '' }
//            return `メッセージが違います。\n期待値: ${msg}\n実際値: ${err.message}`
            return this._M.msg.exception.runtime.msg(msg, err.message)
        }
        if ('string'===typeof msg || msg instanceof String) {
            if (msg===err.message) { return '' }
//            return `メッセージが違います。\n期待値: ${msg}\n実際値: ${err.message}`
            return this._M.msg.exception.runtime.msg(msg, err.message)
        }
    }
    //__errorMsg() { return `テスト失敗。例外発生すべき所で例外発生せず正常終了しました。` }
    //__errorMsg() { this._count.exception++; return this._M.msg.exception.runtime.noneException }
    __errorMsg() { return this._M.msg.exception.runtime.noneException }
}
class Assertion {
    constructor(lang) {
        this._count = {pending:0, exception:0, fail:0, success:0}
        this._M = new Message(lang)
        this._t = new TrueAssertion(this._M, this._count)
        this._f = new FalseAssertion(this._M, this._count)
        this._e = new ExceptionAssertion(this._M, this._count)
    }
    t(fn) { this._t.assert(fn) }
    f(fn) { this._f.assert(fn) }
    e(type, msg, fn) { this._e.assert(type, msg, fn) }
    get count() { return this._count }
    fin(onFinishedAsync, onFinishedSync) {
        this._runOnFinished(onFinishedSync, '同期テスト結果: ')
        if (0 < this.count.pending) { // 非同期テスト実行＆完了後実行
            Promise.allSettled([
                ...this._t._getAsyncPromises(),
                ...this._f._getAsyncPromises(),
                ...this._e._getAsyncPromises(),],
            ).then((results)=>{
                //console.log(results.length, results)
                for (let res of results) { // res.[status,value,reason]
                    //if ('fulfilled'===res.status) { this._count.pending--; }
                    if ('fulfilled'===res.status) { }
                    if ('rejected'===res.status) {
                        this._t._consoleError(`非同期テストで例外発生しました。`, res.reason, this.fin)
                    }
                }
//                this._count.pending = 0
                this._count.pending -= results.length
            })
            .catch(err=>this._t._consoleError(`非同期テスト一括実行で例外発生しました。`, err, this.fin))
            .finally(()=>{
                this._runOnFinished(onFinishedAsync, '非同期テスト結果: ')
            })
        }
    }
    _runOnFinished(onFinished, msg) {
        const fn = 'function'===typeof onFinished ? onFinished : (count)=>console.log(msg, count)
        fn(this.count)
    }
    _runOnFinishedSync(onFinished) { // 同期テスト完了後実行
        const fn = 'function'===typeof onFinished ? onFinished : (count)=>console.log(count)
        fn(this.count)
    }
    _runOnFinishedAsync(onFinished) {
        console.log(count)
    }
}
window.Assertion = Assertion
})()
