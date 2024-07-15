(function(){
/*
class Message {
    constructor(lang) {
        this._lang = (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage || 'en';
        this._common = {
            en: {
                'test':'Test',
                'success':'Successful',
                'fail':'Failed',
                'exception':'Exception',
                'true':'True',
                'false':'False',
                'expected':'Expected',
                'actual':'Actual',
                'augument':'Augument',
                'join':' ',
                'period': '. ',
            },
            ja: {
                'test':'テスト',
                'success':'成功',
                'fail':'失敗',
                'exception':'例外',
                'true':'真',
                'false':'偽',
                'expected':'期待値',
                'actual':'実際値',
                'join':'',
                'period': '。',
            },
        }
        smry(lang, ...keys) { // テスト[失敗/例外]。Test [fail/exception]. 
            keys.push(this._common[lang].test.toUpperCase())
            return keys.map(k=>this._common[k].toLowerCase()).join(this._common.join) + this._common.period
        }
        jaSmry(...keys) { return smry('ja', ...keys) }
        enSmry(...keys) { return smry('en', ...keys) }

        jaSmry(...keys) { return keys.map(k=>this._common[k]).join('') }
        jaCmn(...keys) { return keys.map(k=>this._common[k]).join('') }
        enCmn(...keys) { return keys.map(k=>this._common[k]).join(' ') }
        joinCmn(j, ...keys) { return keys.map(k=>this._common[k]).join(j) }
        this._message = {
            ja: {
                normal: {
                    exception: {
                        return: `${this._jaSmry('exception')}引数は真偽値かそれを返す関数であるべきです。`,
                        fnReturn: `${this._jaSmry('exception')}テストコードは最後に真偽値を返してください。`,
//                        return:`${this._jaCmn(['test','exception'])}。引数は真偽値かそれを返す関数であるべきです。`,
//                        return:`${this._joinCmn('', ['test','exception'])}。引数は真偽値かそれを返す関数であるべきです。`,
//                        return:`${this._joinCmn('', ['test','exception'])}。引数は真偽値かそれを返す関数であるべきです。`,
                        //return:`${['test','exception'].map(k=>this._common[k]).join('')}。引数は真偽値かそれを返す関数であるべきです。`,
//                        return:`テスト例外。引数は真偽値かそれを返す関数であるべきです。`,
//                        fnReturn:'テスト例外。テストコードは最後に真偽値を返してください。',
                    },
                    fail: {
                        value:(e,a)=>`${this._jaSmry('fail')}${e}であるべき所が${a}です。`,
                        exception:(e)=>`${this._jaSmry('fail')}${e}であるべき所で例外発生しました。`,
//                        value:(e,a)=>`テスト失敗。${e}であるべき所が${a}です。`,
//                        exception:(e)=>`テスト失敗。${e}であるべき所で例外発生しました。`,
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
                }
            },
            en: {
                normal: {
                    exception: {
                        return:`テスト例外。引数は真偽値かそれを返す関数であるべきです。`,
                        fnReturn:'テスト例外。テストコードは最後に真偽値を返してください。',
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
                }
            },


        }
    }
}
const messages = {
    en: {
        common: {
            'result': {
                'success': 'Test successful. ',
                'fail': 'Test failed. ',
                'error': 'Test exception. '
            },
        }
        normal: {
            'true':'True',
            'false':'False',
            'fail': 'Fail'
            'exception': 'exception',
            exception: {
                augument:'引数は真偽値かそれを返す関数であるべきです。',
                runtime:{
                    return: 'テストコードは最後に真偽値を返してください。',
                    exception: 'であるべき所で例外発生しました。'
                }
            },
            exception: {
                augument: {
                    : '引数は真偽値かそれを返す関数であるべきです。'
                }
            'AugumentException': {
                : '引数は真偽値かそれを返す関数であるべきです。'
            },
            RuntimeException: {
                'テストコードは最後に真偽値を返してください。'
            }
            }
        },
        error: {

        }
    }
    ja: {
        common: {
            'result': {
                'success': 'テスト成功。',
                'fail': 'テスト失敗。',
                'error': 'テスト例外。'
            },
        }
        normal: {
            'true':'真',
            'false':'偽',
            'fail': '失敗',
            'success': '成功',
            'exception': '例外',
            exception: {
                augument: {
                    : '引数は真偽値かそれを返す関数であるべきです。'
                }
            }
        },
        exception: {
            augument: {
                : '引数は真偽値かそれを返す関数であるべきです。'
            }
        }
        'AugumentException': {
            : '引数は真偽値かそれを返す関数であるべきです。'
        }

    }
}
*/
class AssertError extends Error {
    constructor(msg, cause) {
        super(msg, {cause,cause});
        this.name = 'AssertError';
        this.cause = cause;
    }
}
class BaseAssertion {
    static _consoleFail(msg, caller) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, caller ?? this._result);
            console.error(msg + '\n', this.stack)
        } else { console.error(msg) }
    }
    static _consoleError(msg, err, caller) {
        if (Error.captureStackTrace) {
            const errs = this._recursionCause([err])
            const init = []
            const errsNl = [msg, ...errs].reduce((a,v)=>{a.push(v);a.push('\n');return a;},init)
            errsNl.pop()
            console.error(...errsNl)
        } else { console.error(msg) }
    }
    static _recursionCause(errs) {
        const last = errs[errs.length-1]
        if (last.hasOwnProperty('cause') && last.cause) {
            errs.push(last.cause)
            return this._recursionCause(errs)
        } else { return errs }
    }
    static __isBool(v) { return 'boolean'===typeof v }
    static __isFn(v) { return 'function'===typeof v }
    static __isStr(v) { return 'string'===typeof v || v instanceof String }
    static __isAsyncFunction(v) { return v instanceof (async()=>{}).constructor }
    static __isNullOrUndefined(v) {
        if (v === null) return true;
        if(v === undefined) return true;
        return false;
    }
    static __isGenealogy(a, e) { // aがeの系譜（同一または子孫クラス）であれば真を返す
        if (a instanceof e || a.constructor.name === e.constructor.name) { return true }
        if (a.prototype) { return this.__isGenealogy(a.prototype, e) }
        return false
    }
}
class NormalAssertion extends BaseAssertion {
    static t(fn) { this._normal(fn) }
    static f(fn) { this._normal(fn, true) }
    static _normal(fn, isFalseSuccess) {
        if (this.__isAsyncFunction(fn)) { this._nAsync(fn, isFalseSuccess) }
        else if (this.__isFn(fn)) { this._nFn(fn, isFalseSuccess) }
        else if (this.__isBool(fn)) { this._nB(fn, isFalseSuccess) }
        else { this._consoleFail(`テスト例外。引数は真偽値かそれを返す関数であるべきです。`, this.t) }
    }
    static _nAsync(fn, isFalseSuccess) {
        fn().then((bool)=>{
            this.__nCheck(bool, isFalseSuccess)
        }).catch(err=>{
            this.__failMsgErr(isFalseSuccess, err)
        })
    }
    static _nFn(fn, isFalseSuccess) {
        try {
            const bool = fn()
            this.__nCheck(bool, isFalseSuccess)
        } catch(err) {
            this.__failMsgErr(isFalseSuccess, err)
        }
    }
    static _nB(fn, isFalseSuccess) {
        if (isFalseSuccess ? fn : !fn) { this._consoleFail(this.__failMsg(isFalseSuccess), this.t) }
    }
    static __nCheck(bool, isFalseSuccess) {
        if (!this.__isBool(bool)) { return this._consoleFail('テスト例外。テストコードは最後に真偽値を返してください。', this.t) }
        if (isFalseSuccess ? bool : !bool) { return this._consoleFail(this.__failMsg(isFalseSuccess), this.t) }
    }
    static __failMsg(isFalseSuccess) {
        const j = ['真','偽']
        if (isFalseSuccess) { j.reverse() }
        return `テスト失敗。${j[0]}であるべき所が${j[1]}です。`
    }
    static __failMsgErr(isFalseSuccess, err) { this._consoleError(`テスト例外。${isFalseSuccess ? '偽' : '真'}であるべき所で例外発生しました。`, err, this.t) }
}
class ErrorAssertion extends BaseAssertion {
    static e(type, msg, fn) {
        if (this._ePrmErr(type, msg, fn)) return
        return this._error(type, msg, fn)
    }
    static _ePrmErr(type, msg, fn) {
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
    static _error(type, msg, fn) {
        if (this.__isAsyncFunction(fn)) { this._eAsync(type, msg, fn) }
        else if (this.__isFn(fn)) { this._eFn(type, msg, fn) }
//        else { this._consoleFail(`テスト例外。第三引数は例外を発生させる関数であるべきです。`, this.t) }
    }
    static _eAsync(type, msg, fn) {
        fn().then((bool)=>{
            this._consoleFail(this.__errorMsg(), this.t)
        }).catch(err=>{
            this.__eCheck(type, msg, err)
        })
    }
    static _eFn(type, msg, fn) {
        try {
            const bool = fn()
            this._consoleFail(this.__errorMsg(), this.t)

        } catch(err) {
            this.__eCheck(type, msg, err)
        }
    }
    static __
    static __eCheck(type, msg, err) {
        console.log(type, msg, err)
        const eMsgs = [this.__eCheckTypeMsg(type, err), this.__eCheckMsgMsg(msg, err)].filter(v=>v)
        if (0<eMsgs.length) this._consoleFail(`テスト失敗: ${2<=eMsgs.length ? '\n' : ''}${eMsgs.join('\n')}`, this.t)
    }
    static __eCheckTypeMsg(type, err) {
//        if (err instanceof type) { return '' }
//        return `型が違います。\n期待値: ${type}\n実際値: ${err.constructor.name}`
        if (err.constructor.name === type.name) { return '' }
        return `型が違います。\n期待値: ${type.name}\n実際値: ${err.constructor.name}`
    }
    static __eCheckMsgMsg(msg, err) {
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
    static __errorMsg() { return `テスト失敗。例外発生すべき所で例外発生せず正常終了しました。` }
}
class Assertion {
    constructor() {
        this._count = {error:0, fail:0, success:0}
    }
    t(fn) { NormalAssertion.t(fn) }
    f(fn) { NormalAssertion.f(fn) }
    e(type, msg, fn) { ErrorAssertion.e(type, msg, fn) }
}
window.Assertion = Assertion
})()
