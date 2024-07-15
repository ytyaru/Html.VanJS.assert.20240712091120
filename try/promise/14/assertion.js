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
    constructor(M) { this._M = M; this._asyncs = []; }
    _consoleFail(msg, caller) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, caller ?? this._result);
            console.error(msg + '\n', this.stack)
        } else { console.error(msg) }
    }
    _consoleError(msg, err, caller) {
        if (Error.captureStackTrace) {
            const errs = this._recursionCause([err])
            const init = []
            const errsNl = [msg, ...errs].reduce((a,v)=>{a.push(v);a.push('\n');return a;},init)
            errsNl.pop()
            console.error(...errsNl)
        } else { console.error(msg) }
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
        return (stacks[callerIndex]) ? stacks.slice(callerIndex).filter(line=>-1===line.indexOf(removeTxt)).join('\n') : 'Unknown'
    }
}
class BoolAssertion extends BaseAssertion {
    //constructor(M,C,isFalseSuccess) { super(M); this._caller=this.assert; this._count=C; this._isFalseSuccess=isFalseSuccess;}
    constructor(M,C,isFalseSuccess) {
        super(M)
        this._caller=this.assert
        this._count=C
        this._isFalseSuccess=isFalseSuccess
        this._asyncDict = {}
    }
    get count() { return this._count }
    assert(fn) {
        //if (this.__isAsyncFunction(fn)) { this._count.pending++; this._asyncs.push(fn) }
        if (this.__isAsyncFunction(fn)) { this._count.pending++; this._asyncDict[fn] = this.__getCaller(); this._asyncs.push(fn) }
        else if (this.__isFn(fn)) { this._nFn(fn) }
        else if (this.__isBool(fn)) { this._nB(fn) }
        else { this._consoleFail(this._M.msg.normal.exception.return, this._caller) } // テスト例外。引数は真偽値かそれを返す関数であるべきです。
    }
    _getAsyncPromises() {
        const promises = []
        for (let fn of this._asyncs) {
            promises.push(new Promise((resolve,reject)=>{
                fn().then((bool)=>{
                //fn().then((bool)=>{
                    console.log(bool, this._isFalseSuccess)
//                    this.__nCheck(bool, this._isFalseSuccess)
//                    resolve(this._isFalseSuccess===bool) // テスト成功：真、失敗：偽
                    const eMsg = this.__nCheckMsg(bool)
                    //if (eMsg) { reject(new AssertError(eMsg)) }
                    //if (eMsg) { console.log(this._asyncDict[fn]); reject(new AssertError(eMsg)) }
                    if (eMsg) { console.log(this._asyncDict[fn]); reject(new AssertError(eMsg + '\n' + this._asyncDict[fn])) }
                    else {resolve(this._isFalseSuccess===bool)} // テスト成功：真、失敗：偽
                }).catch(err=>{
//                    this.__exceptMsg(this._isFalseSuccess, err)
                    //reject(err) // テスト例外だが殺してエラーメッセージ表示のみ
                    this._count.exception++; 
                    //reject(new AssertError(this._M.msg.normal.exception.throw(this._M.cmn[this._isFalseSuccess ? 'false' : 'true'])))
                    console.log(this._asyncDict[fn])
                    reject(new AssertError(
                        this._M.msg.normal.exception.throw(this._M.cmn[this._isFalseSuccess ? 'false' : 'true'])
                        + '\n' + this._asyncDict[fn]
                    ))
                })
            }))
        }
        return promises
    }
    _nFn(fn) {
        try {
            const bool = fn()
//            this.__nCheck(bool)
            const eMsg = this.__nCheckMsg(bool)
            if (eMsg) { throw new AssertError(eMsg) }
        } catch(err) {
//            this.__exceptMsg(err)
            this._count.exception++; 
            throw new AssertError(this._M.msg.normal.exception.throw(this._M.cmn[this._isFalseSuccess ? 'false' : 'true']))
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
        //if (!this.__isBool(bool)) { this._count.fail++; return this._consoleFail(this._M.msg.normal.exception.fnReturn, this._caller) }
        if (!this.__isBool(bool)) { this._count.exception++; return this._consoleFail(this._M.msg.normal.exception.fnReturn, this._caller) }
        // テスト失敗：Eであるべき所がAです。
        if (this._isFalseSuccess ? bool : !bool) { console.log(`__nCheck(bool):${this.__failMsg()}`, this._count);this._count.fail++; return this._consoleFail(this.__failMsg(), this._caller) }
        //if (this._isFalseSuccess ? bool : !bool) { console.log(`__nCheck(bool):${this.__failMsg()}`, this._count);this._count.fail++; return this._consoleFail(this.__failMsg(), this._caller); throw new AssertError(this.__failMsg()); }
        this._count.success++
        return true
    }
    __failMsg() {
        const ea = [this._M.cmn.true, this._M.cmn.false]
        if (this._isFalseSuccess) { ea.reverse() }
//        this._count.fail++
        return this._M.msg.normal.fail.value(...ea) // テスト失敗。${j[0]}であるべき所が${j[1]}です。
    }
    __exceptMsg(err) { console.log(`__exceptMsg(err)`);this._count.exception++; this._consoleError(this._M.msg.normal.exception.throw(this._M.cmn[this._isFalseSuccess ? 'false' : 'true']), err, this._caller) } // テスト例外。${isFalseSuccess ? '偽' : '真'}であるべき所で例外発生しました。

}
class TrueAssertion extends BoolAssertion {
    constructor(M,C){super(M,C,false)}
}
class FalseAssertion extends BoolAssertion {
    constructor(M,C){super(M,C,true)}
}
class ExceptionAssertion extends BaseAssertion {
    //constructor(M) { super(M); this._count={exception:0, fail:0, success:0}; }
    constructor(M,C) { super(M); this._count=C; }
    e(type, msg, fn) {
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
        if (this.__isAsyncFunction(fn)) { this._count.pending++; this._asyncs.push([type, msg, fn]); }
        //if (this.__isAsyncFunction(fn)) { this._eAsync(type, msg, fn) }
        else if (this.__isFn(fn)) { this._eFn(type, msg, fn) }
    }
    /*
    _getAsyncPromises() {
        const promises = []
        for (let a of this._asyncs) {
            const [type, msg, fn] = a
            promises.push(new Promise((resolve,reject)=>{
                try {
                    const bool = fn()
                    this._consoleFail(this.__errorMsg(), this.e)
                    resolve()
                } catch(err) {
                    this.__eCheck(type, msg, err)
                    reject(err)
                }
            }))
        }
        console.log(promises)
        return promises
    }
    */
    _getAsyncPromises() {
        const promises = []
        for (let a of this._asyncs) {
            const [type, msg, fn] = a
            promises.push(new Promise((resolve,reject)=>{
                fn().then((bool)=>{
                    this._consoleFail(this.__errorMsg(), this.e)
                    reject(new AssertError(this.__errorMsg()))
                }).catch(err=>{
                    resolve(this.__eCheck(type, msg, err))
                })
                /*
                try {
                    const bool = fn()
                    this._consoleFail(this.__errorMsg(), this.e)
                    resolve()
                } catch(err) {
                    this.__eCheck(type, msg, err)
                    reject(err)
                }
                */
            }))
        }
        //console.log(promises)
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
            const bool = fn()
            this._consoleFail(this.__errorMsg(), this.e)
        } catch(err) {
            this.__eCheck(type, msg, err)
        }
    }
    __eCheck(type, msg, err) {
        const eMsgs = [this.__eCheckTypeMsg(type, err), this.__eCheckMsgMsg(msg, err)].filter(v=>v)
        if (0<eMsgs.length) { // テスト失敗: ...
            this._consoleFail(`${this._M.msg.exception.runtime.summary(eMsgs.length)}${eMsgs.join('\n')}`, this.e)
            this._count.fail++
            return false
        } else { this._count.success++; return true; }
    }
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
    __errorMsg() { this._count.exception++; return this._M.msg.exception.runtime.noneException }
}
class Assertion {
    constructor(lang) {
        this._count = {pending:0, exception:0, fail:0, success:0}
        this._M = new Message(lang)
//        this._normal = new NormalAssertion(this._M, this._count)
//        this._except = new ExceptionAssertion(this._M, this._count)
        this._t = new TrueAssertion(this._M, this._count)
        this._f = new FalseAssertion(this._M, this._count)
        this._e = new ExceptionAssertion(this._M, this._count)
    }
    t(fn) { this._t.assert(fn) }
    f(fn) { this._f.assert(fn) }
    e(type, msg, fn) { this._e.e(type, msg, fn) }
    /*
    get count() {
        const c = {pending:0, exception:0, fail:0, success:0}
        for (let a of ['normal','except']) {
            console.log()
            for (let k of Object.keys(this[`_${a}`].count)) {
                c[k] += this[`_${a}`].count[k]
            }
        }
        return c
    }
    */
    get count() { return this._count }
    fin(onFinishedAsync, onFinishedSync) {
        //if ('function'===typeof onFinished) { onFinishedSync(this.count) } // 同期テスト完了後実行
        this._runOnFinished(onFinishedSync, '同期テスト結果: ')
        if (0 < this.count.pending) { // 非同期テスト実行＆完了後実行
            //console.log('fin')
//            console.log(this._normal._getAsyncPromises())
//            console.log(this._except._getAsyncPromises())
            Promise.allSettled([
//            Promise.all([
                ...this._t._getAsyncPromises(),
                ...this._f._getAsyncPromises(),
                ...this._e._getAsyncPromises(),],
//            Promise.all(
//                ...this._normal._getAsyncPromises(), 
//                ...this._except._getAsyncPromises(),
            ).then((results)=>{
                for (let res of results) {
                    console.log(res)
                    if ('rejected'===res.status) {
                        this._t._consoleError(`非同期テストで例外発生しました。`, res.reason, this.fin)
                    }
                }
            })
            .catch(err=>this._t._consoleError(`非同期テストで例外発生しました。`, err, this.fin))
            .finally(()=>{
                this._count.pending = 0
                this._runOnFinished(onFinishedAsync, '非同期テスト結果: ')
//                if ('function'===typeof onFinished) {
//                    onFinishedAsync(this.count)
//                }
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
