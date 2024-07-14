(function(){
class Message {
    constructor(lang) {
        this._lang = lang || (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage || 'en';
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
                        summary:'テスト例外。引数不正です。\n',
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
                        summary:'Test exception. Invalid argument.\n',
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
    }
    get msg() { return this._message[(this._message.hasOwnProperty(this._lang) ? this._lang : 'ja')] }
    get cmn() { return this._common[(this._message.hasOwnProperty(this._lang) ? this._lang : 'ja')] }
}
class AssertError extends Error {
    constructor(msg, cause) {
        super(msg, {cause,cause});
        this.name = 'AssertError';
        this.cause = cause;
    }
}
class BaseAssertion {
    constructor(M) { this._M = M }
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
}
class NormalAssertion extends BaseAssertion {
    constructor(M) { super(M) }
    t(fn) { this._normal(fn) }
    f(fn) { this._normal(fn, true) }
    _normal(fn, isFalseSuccess) {
        if (this.__isAsyncFunction(fn)) { this._nAsync(fn, isFalseSuccess) }
        else if (this.__isFn(fn)) { this._nFn(fn, isFalseSuccess) }
        else if (this.__isBool(fn)) { this._nB(fn, isFalseSuccess) }
        else { this._consoleFail(this._M.msg.normal.exception.return, this.t) }
        //else { this._consoleFail(`テスト例外。引数は真偽値かそれを返す関数であるべきです。`, this.t) }
    }
    _nAsync(fn, isFalseSuccess) {
        fn().then((bool)=>{
            this.__nCheck(bool, isFalseSuccess)
        }).catch(err=>{
            this.__failMsgErr(isFalseSuccess, err)
        })
    }
    _nFn(fn, isFalseSuccess) {
        try {
            const bool = fn()
            this.__nCheck(bool, isFalseSuccess)
        } catch(err) {
            this.__failMsgErr(isFalseSuccess, err)
        }
    }
    _nB(fn, isFalseSuccess) {
        if (isFalseSuccess ? fn : !fn) { this._consoleFail(this.__failMsg(isFalseSuccess), this.t) }
    }
    __nCheck(bool, isFalseSuccess) {
        if (!this.__isBool(bool)) { return this._consoleFail(this._M.msg.normal.exception.fnReturn, this.t) }
        //if (!this.__isBool(bool)) { return this._consoleFail('テスト例外。テストコードは最後に真偽値を返してください。', this.t) }
        if (isFalseSuccess ? bool : !bool) { return this._consoleFail(this.__failMsg(isFalseSuccess), this.t) }
    }
    __failMsg(isFalseSuccess) {
        const ea = [this._M.cmn.true, this._M.cmn.false]
        if (isFalseSuccess) { ea.reverse() }
        return this._M.msg.normal.fail.value(...ea)
//        const j = ['真','偽']
//        if (isFalseSuccess) { j.reverse() }
//        return `テスト失敗。${j[0]}であるべき所が${j[1]}です。`
    }
    __failMsgErr(isFalseSuccess, err) { this._consoleError(this._M.msg.normal.exception.throw(this._M.cmn[isFalseSuccess ? 'false' : 'true']), err, this.t) }
    //__failMsgErr(isFalseSuccess, err) { this._consoleError(`テスト例外。${isFalseSuccess ? '偽' : '真'}であるべき所で例外発生しました。`, err, this.t) }
}

class ExceptionAssertion extends BaseAssertion {
    constructor(M) { super(M) }
//class ErrorAssertion extends BaseAssertion {
    e(type, msg, fn) {
        if (this._ePrmErr(type, msg, fn)) return
        return this._error(type, msg, fn)
    }
    _ePrmErr(type, msg, fn) {
        let eMsgs = []
        if ([type,msg,fn].some(v=>this.__isNullOrUndefined(v))) { eMsgs.push(`引数は次の3つ必要です:\n1. 期待する例外型\n2. 期待する例外メッセージ(String/RegExp)\n3. 例外発生する無名関数`) }
        if (!this.__isGenealogy(type, Error)) { eMsgs.push(`第一引数は期待する例外型でありErrorかそれを継承した型であるべきです。`) }
        if (!this.__isStr(msg)) { eMsgs.push(`第二引数は期待する例外メッセージを示す文字列型Stringか正規表現RegExp型であるべきです。`) }
        if (!(this.__isAsyncFunction(fn)) && 'function'!==typeof fn) {eMsgs.push(`第三引数は例外を発生させる関数であるべきです。`)}
        if (0<eMsgs.length) {
            this._consoleFail('テスト例外。引数不正です。\n' + eMsgs.join('\n'), this.t)
            return true
        }
    }
    _error(type, msg, fn) {
        if (this.__isAsyncFunction(fn)) { this._eAsync(type, msg, fn) }
        else if (this.__isFn(fn)) { this._eFn(type, msg, fn) }
//        else { this._consoleFail(`テスト例外。第三引数は例外を発生させる関数であるべきです。`, this.t) }
    }
    _eAsync(type, msg, fn) {
        fn().then((bool)=>{
            this._consoleFail(this.__errorMsg(), this.t)
        }).catch(err=>{
            this.__eCheck(type, msg, err)
        })
    }
    _eFn(type, msg, fn) {
        try {
            const bool = fn()
            this._consoleFail(this.__errorMsg(), this.t)

        } catch(err) {
            this.__eCheck(type, msg, err)
        }
    }
    __eCheck(type, msg, err) {
        console.log(type, msg, err)
        const eMsgs = [this.__eCheckTypeMsg(type, err), this.__eCheckMsgMsg(msg, err)].filter(v=>v)
        if (0<eMsgs.length) this._consoleFail(`テスト失敗: ${2<=eMsgs.length ? '\n' : ''}${eMsgs.join('\n')}`, this.t)
    }
    __eCheckTypeMsg(type, err) {
//        if (err instanceof type) { return '' }
//        return `型が違います。\n期待値: ${type}\n実際値: ${err.constructor.name}`
        if (err.constructor.name === type.name) { return '' }
        return `型が違います。\n期待値: ${type.name}\n実際値: ${err.constructor.name}`
    }
    __eCheckMsgMsg(msg, err) {
        if (msg instanceof RegExp) {
            if (msg.test(msg)) { return '' }
            return `メッセージが違います。\n期待値: ${msg}\n実際値: ${err.message}`
        }
        if ('string'===typeof msg || msg instanceof String) {
            if (msg===err.message) { return '' }
            return `メッセージが違います。\n期待値: ${msg}\n実際値: ${err.message}`
        }
//        throw new AssertError(`メッセージの型は文字列Stringか正規表現RegExpのいずれかのみ有効です。`)
    }
    __errorMsg() { return `テスト失敗。例外発生すべき所で例外発生せず正常終了しました。` }
}
class Assertion {
    constructor(lang) {
        this._count = {error:0, fail:0, success:0}
        this._M = new Message(lang)
        this._normal = new NormalAssertion(this._M)
        this._exception = new ExceptionAssertion(this._M)
    }
    t(fn) { this._normal.t(fn) }
    f(fn) { this._normal.f(fn) }
    e(type, msg, fn) { this._exception.e(type, msg, fn) }
}
window.Assertion = Assertion
})()