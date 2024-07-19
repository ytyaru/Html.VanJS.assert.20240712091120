class Assert { // テストする。例外発生を殺してconsole.errorに変換する。処理を止めずに実行できる。
    constructor(options) {
        this._o = options ?? {label:'テスト'}
        this._a = new Assertion()
        this._c = {fail:0, success:0}
        this._d = new Drawer()
        this._isError = false
    }
    static of(options) {
        const a = new Assert()
        return [a, a._a]
//        return new Assert()
    }
    test(options, ..._cases) { // opt:{label:'',setup:()=>return target,tearDonw:(target)=>}
        try {
            this._runTest(..._cases)
//            this._drawFin()
        } catch (err) {
            this._isError = true
//            this._drawError()
        }
        return this
    }
    _runTest(options, ..._cases) {
        try {
            const target = options?.hasOwnProperty('setup') ? options.setup() : undefined
            this._a.target = target
            for (let _case of _cases) {
                const result = Assertion._isFn(_case) ? _case(target) : _case
                //this._resolve(options, target, _case)
            }
        } catch (err) { throw err }
        finally {
            if (options?.hasOwnProperty('tearDonw')) { options.tearDonw(target) }
        }
    }
//    _resolve(options, target, _case) {
//        if (Assertion._isPromise(_case)) { _case(target).then(res=>res) }
//        else if (Assertion._isFn(_case)) { return _case(target) }
//        else { return _case }
//    }
    fin() {
        this._d.options = {...this._o, count:this._a.count}
        this._d.draw(this._isError)
    }
}
/*
class Assert { // テストする。例外発生を殺してconsole.errorに変換する。処理を止めずに実行できる。
    static of(options) { // ファイル名絞込文字列, ラベル
        return new Assertion()
    }
    static test(options, ..._cases) { // opt:{label:'',setup:()=>return target,tearDonw:(target)=>}
        try {
            this._runTest(..._cases)
            this._drawFin()
        } catch (err) {
            this._drawError()
        }
    }
    static _runTest(options, ..._cases) {
        const target = options?.hasOwnProperty('setup') ? options.setup() : undefined
        for (let _case of _cases) {
            const result = Assertion._isFn(_case) ? _case(target) : _case
        }
        if (options?.hasOwnProperty('tearDonw')) { options.tearDonw(target) }
    }
    static fin() {

    }
    static _draw() {
        
    }
    static _drawFin() { // 結果がどうあれ最後まで完了した
        
    }
    static _drawError() { // テスト実行中に例外発生した
        
    }
}
*/
class Assertion {
    constructor() {
        this._count = {
            success: 0,
            fail: 0,
        }
        this.target = null
    }
    static of(options) { // ファイル名絞込文字列, ラベル
        return new Assertion()
    }
    //get count() { return this._count }
    get count() { const o = {...this._count}; return Object.freeze(o); }
    _countup(isSuccess){if(isSuccess){this._count.success++}else{this._count.fail++}}
    t(valueOrFn) { // 正常系テスト。成功なら真、失敗なら偽を返す。
        try {
            const isSuccess = this._getActual(valueOrFn)
            //const isSuccess = Assertion._getActual(valueOrFn)
            this._countup(isSuccess)
            //if (!isSuccess) this._errorStack(`テスト失敗。真であるべき所が偽である。`, this.ok)
            if (!isSuccess) Assertion._errorStack(`テスト失敗。真であるべき所が偽である。`, this.t)
            return isSuccess 
        }
        //catch (err) {this._countup();this._errorStack(`テスト失敗。真であるべき所で例外発生した。`, this.ok);return false;}
        //catch (err) {this._countup();Assertion._errorStack(`テスト失敗。真であるべき所で例外発生した。`, this.ok);return false;}
        catch (err) {this._countup();Assertion._errorStack(`テスト失敗。真であるべき所で例外発生した。`, this.t);return false;}
    }
    f(valueOrFn) { // 正常系テスト。成功なら真、失敗なら偽を返す。
        try {
            const isSuccess = this._getActual(valueOrFn)
            //const isSuccess = Assertion._getActual(valueOrFn)
            this._countup(isSuccess)
            //if ( isSuccess) this._errorStack(`テスト失敗。偽であるべき所が真である。`, this.ok)
            if ( isSuccess) Assertion._errorStack(`テスト失敗。偽であるべき所が真である。`, this.f)
            return !isSuccess 
        }
        //catch (err) {this._countup();this._errorStack(`テスト失敗。偽であるべき所で例外発生した。`, this.ok);return false;}
        catch (err) {this._countup();Assertion._errorStack(`テスト失敗。偽であるべき所で例外発生した。`, this.f);return false;}
    }
    /*
    */
    /*
    static ok(valueOrFn) { return this._okno(valueOrFn) }      // 正常系テスト。引数が真なら成功でtrueを返す。それ以外はfalse。
    static no(valueOrFn) { return this._okno(valueOrFn, true) }// 正常系テスト。引数が偽なら成功でtrueを返す。それ以外はfalse。
    static _okno(valueOrFn, isNo) {
        const actual = this._getActual(valueOrFn)
        const isSuccess = isNo ? actual : !actual
        try {
//            const isSuccess = this._getActual(valueOrFn)
//            if (!isSuccess) this._errorStack(`テスト失敗。真であるべき所が偽である。`, this.ok)
            if ( isSuccess) this._errorStack(this._oknoMsg(isNo), this.ok)
            return isSuccess 
        }
//        catch (err) {this._errorStack(`テスト失敗。真であるべき所で例外発生した。`, this.ok); return false;}
        catch (err) {this._errorStack(this._oknoMsg(isNo, true), this.ok); return false;}
    }
    static _oknoMsg(isNo, isThrow) {
        const cslMsg = ['真','偽']
        if (isNo) cslMsg.reverse()
        const [expected, actual] = cslMsg
        return `テスト失敗。${expected}であるべき所` + isThrow ? 'で例外発生した。' : `が${actual}である。`
    }
    */
    e(type, msg, fn) { // 例外発生テスト。
        let isSuccess = false
        try { fn() }
//        try { this._getActualError(fn) }
        catch(err) {
            //const cslMsg = this._makeErrorMessage(type, msg, err)
            const cslMsg = Assertion._makeErrorMessage(type, msg, err)
            this._countup(!cslMsg);
            if (cslMsg) { console.error(cslMsg, err); return false; }
            return true
        }
        this._countup()
        //this._errorStack(`テスト失敗。エラーになるべき所でエラーにならなかった。`, this.error)
        Assertion._errorStack(`テスト失敗。エラーになるべき所でエラーにならなかった。`, this.error)
        return isSuccess
    }
    async tA(valueOrFn) {
        try {
            //const isSuccess = this._getActual(valueOrFn)
            const isSuccess = await valueOrFn(this.target)
            this._countup(isSuccess)
            if (!isSuccess) Assertion._errorStack(`テスト失敗。真であるべき所が偽である。`, this.t)
            return isSuccess 
        }
        catch (err) {this._countup();Assertion._errorStack(`テスト失敗。真であるべき所で例外発生した。`, this.t);return false;}

    }
    async fA(valueOrFn) {
        try {
            //const isSuccess = this._getActual(valueOrFn)
            const isSuccess = await valueOrFn(this.target)
            this._countup(isSuccess)
            if ( isSuccess) Assertion._errorStack(`テスト失敗。偽であるべき所が真である。`, this.f)
            return !isSuccess 
        }
        catch (err) {this._countup();Assertion._errorStack(`テスト失敗。偽であるべき所で例外発生した。`, this.f);return false;}
    }
    async eA(fn) {
        let isSuccess = false
//        try { fn() }
//        try { this._getActualError(fn) }
        try { await fn(this.target) }
        catch(err) {
            //const cslMsg = this._makeErrorMessage(type, msg, err)
            const cslMsg = Assertion._makeErrorMessage(type, msg, err)
            this._countup(!cslMsg);
            if (cslMsg) { console.error(cslMsg, err); return false; }
            return true
        }
        this._countup()
        //this._errorStack(`テスト失敗。エラーになるべき所でエラーにならなかった。`, this.error)
        Assertion._errorStack(`テスト失敗。エラーになるべき所でエラーにならなかった。`, this.error)
        return isSuccess

    }
    static _makeErrorMessage(type, msg, err) {
        const isMatchName = type.name===err.name
        const isMatchMessage = this._matchErrorMessage(msg, err.message)
        const msgs = [isMatchName ? null :  this._errMsgType(type, err),
                      isMatchMessage ? null : this._errMsgMsg(msg, err)
                     ].filter(v=>v)
        if (0===msgs.length) { return null }
        return `テスト失敗。${1===msgs.length ? '' : '\n'}${msgs.join('\n')}\n`
    }
    static _errMsgType(type, err) { return `エラーの型が違う。\n期待値:${type.name}\n実際値:${err.name}` }
    static _errMsgMsg(msg, err) { return `エラーメッセージが違う。\n期待値:${msg}\n実際値:${err.message}` }
    //static _getActual(v) { return this._isFn(v) ? v() : v }
    //_getActual(v) { return this.__getActual(v) }
    _getActual(v) { return this.__getActual(v) }
    _getActualError(fn) { return this.__getActual(fn, true) }
    __getActual(v, isError) {
        if (Assertion._isPromise(v)) { v(this.target).then(res=>{console.log('プロミスったー');return res}) }
        else if (Assertion._isFn(v)) { return v(this.target) }
        else {
            if (isError) { throw new Error(`Assertion.e()の第三引数は関数かプロミスのみ有効です。`) }
            return v
        }
    }
    /*
    _getActual(v) {
        if (this._isPromise(v)) { v(this.target).then(res=>res) }
        else if (this._isFn(v)) { return v(this.target) }
        else { return v }
    }
    _getActualError(fn) {
        if (this._isPromise(fn)) { fn(this.target).then(res=>res) }
        else if (this._isFn(fn)) { return fn(this.target) }
        else { throw new Error(`Assertion.e()の第三引数は関数かプロミスのみ有効です。`) }
    }
    */
    static _isFn(v) { return 'function'===typeof v }
    static _isPromise(v) { return v instanceof Promise }
    //static _isPromise(v) { return v instanceof Promise || (v && typeof v.then === 'function') }
    static _matchErrorMessage(expected, actual) {
        if (null===expected || undefined===expected) { return true } // 無条件でクリア（メッセージ確認しない）
        if (this._isRegExp(expected)) { return expected.test(actual) }
        else if (this._isString(expected)){ return actual===expected }
        else { return false } // 上記以外の型なら無条件でエラー
    }
    static _isString(v) { return 'string'===typeof v || v instanceof String }
    static _isRegExp(v) { return v instanceof RegExp }
    static _errorStack(msg, caller) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, caller ?? this._errorStack);
            //Error.captureStackTrace(this, caller ?? Assertion._errorStack);
            console.error(msg + '\n', this.stack)
        } else { console.error(msg) }
    }
}
class Drawer {
    constructor(options) { // {file:/dir-name\/test-target.js$/, label:'{{fileName}}のテストです', count:Assertion.count}
        this._getResource()
        this._options = options
        this._id = 'assert-result'
//        this._el = this._make()
    }
    get options() { return this._options }
    set options(v) { this._options = v }
    draw(isError) {
        van.add(document.body, 
            van.tags.section(
                van.tags.h1(this._getLink()),
                //van.tags.p(this._getResult(isError)),
                van.tags.div(this._getResult(isError)),
            )
        )
    }
    _make() {
        van.add(document.body, 
            van.tags.section(
                van.tags.h1(this._getLink()),
                van.tags.p(this._getResult()),
            )
        )
    }
    _getLink() { return (this._getMatchRes()) ? van.tags.a({href:url}, this._options.label) : van.tags.span(this._options.label) }
    _getMatchRes() {
        this._resources = window.performance.getEntriesByType('resource').map(r=>r.name)
        if (this._resources) return null
        console.log(this._resource, !this._resources)
        for (let url of this._resource) {
            if (url===this._options.file) { return url }
        }
        for (let url of this._resource) {
            if (0<=url.indexOf(this._options.file)) { return url }
        }
    }
    _getResult(isError) { return isError ? this._getResultError() : this._getResultFin() }
    _getResultFin() {
        const isFail = 0 < this._options.count.fail
        const fail = isFail
            ? van.tags.span(`失敗: ${this._options.count.fail}　`)
            : null
        const success = van.tags.span(`成功: ${this._options.count.success}　`)
        const rate = fail 
            ? van.tags.span(`成功率: ${Math.floor((this._options.count.success / (this._options.count.success + this._options.count.fail)) * 100)}％　`)
            : null
        return [fail, success, rate, this._getResultFail(isFail)]
    }
    _getResultFail(isFail) { return (isFail) ? [
        van.tags.p('詳細は開発者ツールのコンソールをご覧ください。以降のテスト工程は次の通りです。'),
        van.tags.ol(
            van.tags.li('エラーログを見る'),
            van.tags.li('スタックトレースを見る'),
            van.tags.li('エラー箇所をクリックする'),
            van.tags.li('コードを修正する'),
            van.tags.li('本ページをリロードして再テストする'),
            van.tags.li('エラーがなくなるまで繰り返す'),
        ),
    ] : null }
    _getResultError() { return [
        van.tags.p('テストコードで例外発生しました。テストコードを確認して書き直してください。'),
        van.tags.p('詳細は開発者ツールのコンソールをご覧ください。')] }
    /*
    _getSection() {
        const section = document.querySelector(`#${this._id}`)
        return (section) ? section : this._makeSection()
    }
    _makeSection() {
        const section = document.createElement(this._id)
        section.id = this._id
        return section
    }
    _getHeader() {
        const h1 = document.querySelector(`#${this._id}-h1`)
        return (h1) ? h1 : this._makeHeader()
    }
    _makeHeader() {
        const h1 = document.createElement(this._id + '-h1')
        h1.id = this._id + '-h1'
        return h1
    }
    _makeLink() {
        const a = document.createElement('a')

        for (let url of this._resource) {
            if (url === this._options.file) { return 
        }
        this._resource.some
        this._options.file.indexOf()
        const url = (this._options.file instanceof RegExp) this._resource.match()
        if (this._options.file instanceof RegExp) 
        this._resource.match()
        a.href = 
    }
    */
    _getResource() {
//        this._resources = window.performance.getEntriesByType('resource').map(r=>r.name)
//        Object.freeze(this._resources)
//        console.log(this._resource)
        window.addEventListener('load', (event)=>{
            this._resources = window.performance.getEntriesByType('resource').map(r=>r.name)
            Object.freeze(this._resources)
        });
    }
}

/*
class Draw {
    static fin() {

    }
    static error() {
        
    }
    static _getSection() {
        const section = document.querySelector('#assert-result')
        return (section) ? section : this._makeSection()
    }
    static _makeSection() {
        const section = document.createElement('section')
    }
    static _get
}
*/

