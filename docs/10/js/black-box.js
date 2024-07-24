(function(){
/*
[target, (m/g/s/d), (f), asserts]
{
  target /tar/t: Human/new Human('山田'), // 必須
  method /met/m: 'someMethod',            // 任意（m,g,s,dは一つもないか一つだけのみ許容する。複数はダメ）
  getter /get/g: 'someName',
  setter /set/s: 'someName',
  delete /del/d: 'someName',
  finally/fin/f: (t)=>t.close(),          // 任意
  asserts/ass/a: [                        // 必須
    metArgs, assArgs
  ]
}
testTarget: constructor/method/getter/setter/delete（この5パターンのうちどれか）
*/
if (!Type) {
    class Type {
        isBool(v) { return 'boolean'===typeof v }
        isRange(v, min, max) { return min <= v && v <= max }
        isStr(v) { return 'string'===typeof v || v instanceof String }
        isAry(v) { return Array.isArray(v) }
        isFn(v) { return 'function'===typeof v }
        isAFn(v) { return v instanceof (async()=>{}).constructor }
        isErrCls(v) { return Error.isPropertyOf(v) }
        isErrIns(v) { return v instanceof Error }
        isObj(v) { return 'Object'===v.constructor.name }
        isNullOrUndefined(v) { return [null,undefined].some(c=>c===v) }
        hasMethod(obj,key) { return this.isFn(this._getDesc(obj,key).value) }
        hasGetter(obj,key) { return this.isFn(obj.__lookupGetter__(key)) || this.isFn(this._getDesc(obj,key)['get']) }
        hasSetter(obj,key) { return this.isFn(obj.__lookupSetter__(key)) || this.isFn(this._getDesc(obj,key)['set']) }
        _getDesc(obj,key) { return Object.getOwnPropertyDescriptor(obj, key) }
    }
}
class BlackBoxArgs {
    constructor() { this._args={}; this._ins=null; this._cands=[];}
    check(...args) {
        if (this.__isRange(args.length, 2, 4)) { // [target, (m/g/s/d), (f), asserts]
            const l = args.length - 1;
            if (!this._isTarget(args[0])) { throw new Error(`引数が配列のとき最初の要素はtargetであるべきです。`) }
            if (!this._isAsserts(args[l])) { throw new Error(`引数が配列のとき最後の要素はassertsであるべきです。`) }
            if (2<=l) {
                this._candsFin(arg[1])
                if (2===l) { return }
                this._candsFin(arg[2])
                throw new Error(`引数が配列のとき最初と最後の要素意外はテスト対象メソッド名かファイナライザかその両方であるべきです。`)
            }
        }
        if (this.__isObj(args[0])) {
            if (!'class,cls,c'.split(',').some(n=>args[0].hasOwnProperty(n))) { throw new Error(`引数がオブジェクトのとき'class'キーを持つべきです。その値はコンストラクタ関数またはそれをnewした戻り値のインスタンスであるべきです。`) }
            if (!'asserts,ass,a'.split(',').some(n=>args[0].hasOwnProperty(n))) { throw new Error(`引数がオブジェクトのとき'asserts'キーを持つべきです。その値はテスト対象メソッドの引数と、assertメソッドに渡す引数であるべきです。`) }
            const hasM = 'method,met,m'.split(',').some(n=>args[0].hasOwnProperty(n))
            const hasG = 'getter,get,g'.split(',').some(n=>args[0].hasOwnProperty(n))
            const hasS = 'setter,set,s'.split(',').some(n=>args[0].hasOwnProperty(n))
            const hasD = 'delete,del,d'.split(',').some(n=>args[0].hasOwnProperty(n))
            if (1 < [hasM, hasG, hasS, hasD].filter(has=>has).length) { throw new Error(`引数がオブジェクトのとき'method','getter','setter','delete'キーを任意で持てますが、それらは複数持てません。一つもないか、一つだけ持てます。`) 
            }
        }
    }
    _isTarget(arg) {
        this._args = this.__isClass(arg) ? args : (this.__isStr(arg) && this.__isClass(window[args]) ? window[args] : null)
        if (null===this._args) { return false }
        this._getIns()
        return true
//        if (this.__isClass(arg)) { this._args.class=arg; this._getIns(); return true }
//        if (this.__isStr(arg) && this.__isClass(window[args])) { this._args.class=window[args]; this._getIns(); return true }
//        return false
    }
    _isAsserts(arg) { // [[metArgs], assArgs] 引数の型や数でテスト対象がm/g/sのどれか判断する。dはgと同じで識別不能のため要キー明記
        if (!Array.isArray(arg)) {throw new Error(`assertsは配列であるべきです。`)}
        if (0===args.length) {throw new Error(`assertsの要素数は一つ以上あるべきです。`)}

        if (this.__isFn(args[0])) { this._args.getter = arg }
        else if (this.__isErrIns(args[0])) { this._args.getter = arg }
        else if (Array.isArray(args[0])) {
            this._cands = ['method','setter']
//            if (Array.isArray(args[0][0])) { this._args.method = arg }
//            else { this._args.setter = arg }
        }
        else {throw new Error(`assertsの要素はテストケースであるべきです。すなわち次の二つの要素を持つ配列です。テスト対象メソッドの引数（配列）、assertメソッドの引数（メソッドの戻り値を引数で受け取り、真偽値を返す関数）。ただしゲッターがテスト対象のときその引数は不要のためassertメソッドの引数のみです。セッターがテスト対象のとき引数は代入値です。`)}
        /*

        if (args[0].length < 2) {throw new Error(`assertsの要素はテストケースであるべきです。すなわち次の二つの要素を持つ配列です。テスト対象メソッドの引数、assertメソッドの引数。`)}
        if (Array.isArray(args[0][0])) { // テスト対象はmethodである(可変長引数を指す配列。これを渡すのはmethodでありsetterでない)

        }
        if (Array.isArray(arg) && 0<args.length) {
            if (Array.isArray(arg) && 0<args.length) {
            this._args.asserts = arg
            return true
        }
        return false
        */
    }
    _hasMethod(args) { return this.__isFn(this._getDesc(arg).value) }
    _hasGetter(args) { return this.__isFn(ins.__lookupGetter__(arg)) || this.__isFn(this._getDesc(arg)['get']) }
    _hasSetter(args) { return this.__isFn(ins.__lookupSetter__(arg)) || this.__isFn(this._getDesc(arg)['set']) }
    _getIns() { this._ins = this._args.class(); return this._ins; }
    _getDesc(arg) { return Object.getOwnPropertyDescriptor(this._ins, arg) }
    _candsFin(arg) {
        if (this.__isStr(arg)) {
            //this._cands = [...this._cands, 'Method,Getter,Setter'.split(',').filter(n=>this[`_has${n}`](arg)).map(n=>n.toLowerCase())]
            //this._cands = [...new Set([...this._cands, 'Method,Getter,Setter'.split(',').filter(n=>this[`_has${n}`](arg)).map(n=>n.toLowerCase())])]
            this._cands = 'Method,Getter,Setter'.split(',').filter(n=>this[`_has${n}`](arg)).map(n=>n.toLowerCase())
            // テスト候補が複数ある場合、assertsの引数の型でどの候補か一意に特定する
            // getter, setter          Array.isArray(this._args.asserts[0])ならsetter、それ以外ならgetter（関数か例外）
            // method, getter          
            // method, setter          
            // method, getter, setter  
            this._args.asserts
        } else if (this.__isFn(arg)) {
            this._args.fin = arg
        }
    }
    _inferCands() {
        // テスト候補が複数ある場合、assertsの引数の型でどの候補か一意に特定する
        // getter, setter          Array.isArray(this._args.asserts[0])ならsetter、それ以外ならgetter（関数か例外）
        // method, getter          
        // method, setter          
        // method, getter, setter  
             if (1===this._cands.length) { this._args[this._cands[0]] = arg }
        else if (2===this._cands.length) {
            if (this._hasCands(['getter','setter'])) {
                if (Array.isArray(this._args.asserts[0])) { this._args.setter = arg }
                else { this._args.getter = arg }
            }
            if (this._hasCands(['method','getter'])) {
                if (Array.isArray(this._args.asserts[0])) { this._args.method = arg }
                else { this._args.getter = arg }
            }
            if (this._hasCands(['method','setter'])) { // 起こりえない。setterが優先される：class C { set n(v) {} n() {return 1} }; (new C()).n;
                throw new Error(`methodとsetterが候補になることはありえないはずです。`)
            }
            this._args[this._cands[0]] = arg
        }
        else if (3===this._cands.length) {
            if (this._hasCands(['method','getter','setter'])) {
                throw new Error(`methodとsetterが候補になることはありえないはずです。`)
            }
        }
        this._cands.has('')
    }
    _hasCands(cands) { return cands.every(n=>this._cands.includes(n)) }
    /*
    _hasMethod(args) {
        const ins = this._args.class()
        return this.__isFn(Object.getOwnPropertyDescriptor(ins, arg).value)
    }
    _hasGetter(args) {
        const ins = this._args.class()
        return this.__isFn(ins.__lookupGetter__(arg)) || this.__isFn(Object.getOwnPropertyDescriptor(ins, arg)['get'])
    }
    _hasSetter(args) {
        const ins = this._args.class()
        return this.__isFn(ins.__lookupSetter__(arg)) || this.__isFn(Object.getOwnPropertyDescriptor(ins, arg)['set'])
    }
    */
}
class BlackBox {
    constructor(assertion) {
        this._a = assertion ?? new Assertion()
    }
    get assertion() { return this._a }
    get defaultOptions() { return {class:{name:'',args:[]},method:undefined,assert:'t',inouts:[[], (r)=>r===true], tearDown:(t)=>{}} }
    test(...args) {
        const OP = {assert:'t', tearDown:(t)=>{}, ...this._getOptions(...args)}
        console.log(OP)
        if (null===OP.class && Type.isFn(OP.method)) { this._testFn(OP) }
        else { this._testClass(OP) }
    }
    _testFn(OP) {
        for (let io of OP.inouts) {
            
            const [args, expected] = io
            const [A,M] = this._getFnTestAssertMethod(OP, args, expected)
            if (Type.isErrIns(expected)) { const e=expected; A(e.constructor, e.message, M) }
            else if (Type.isFn(expected)) { A(M) }
            else { throw new Error(`関数テストの引数不正です。引数は正常系[args, testCodeFn]か異常系[new ErrorType('msg'), throwErrorFn]のいずれかであるべきです。`) }
//            if (Type.isErrIns(expected)) { const e=expected; this._a.e(e.constructor, e.message, M) }
//            else if (Type.isFn(expected)) { this._a.t(async()=>expected(await OP.method(...args))) }
//            else { throw new Error(`関数テストの引数不正です。引数は正常系[args, testCodeFn]か異常系[new ErrorType('msg'), throwErrorFn]のいずれかであるべきです。`) }
        }
        OP.tearDown()
    }
    _getIo(io) {
        if (Type.isAry(io)) {
            if (!Type.isRange(io.length, 2, 3)) { throw new Error(`inoutsが配列のときその要素数は2〜であるべきです。その内容は[args, testFn]です。argsはテスト対象の可変長引数を表す配列です。testFnはテスト対象の戻り値を引数にとり真偽値を返す関数です。なお例外発生テストはtestFnの代わりにErrorインスタンスを渡します。またはErrorコンストラクタとメッセージでも可能です。すなわち[args, new Error('msg')]か[args, Error, 'msg']です。`) }
            if (!Type.isAry(io[0])) { throw new Error(`inoutsが配列のとき最初の要素は配列であるべきです。その内容はテスト対象に渡す引数です。可変長引数を表す配列です。`) }
            if (Type.isErrIns(io[1])) {
                return [io[0], io[1]]
            } else if (Type.isErrCls(io[1]) && Type.isStr(io[2])) { return [io[0], new io[1](io[2])] }

        } else if (Type.isFn(io)) { // テスト対象に渡す引数がない
            return [[], io]
        }
    }
    _getFnTestAssertMethod(OP, args, expected) {
        if (Type.isAFn(OP.method)) {
            if (Type.isErrIns(expected)) { return [this._a.e.bind(this._a), (async()=>await OP.method(...args))] }
            else if (Type.isFn(expected)) { return [this._a.t.bind(this._a), (async()=>expected(await OP.method(...args)))] }
        } else {
            if (Type.isErrIns(expected)) { return [this._a.e.bind(this._a), (()=>OP.method(...args))] }
            else if (Type.isFn(expected)) { return [this._a.t.bind(this._a), (()=>expected(OP.method(...args)))] }
        }
        throw new Error(`関数テストの引数不正です。引数は正常系[args, testCodeFn]か異常系[new ErrorType('msg'), throwErrorFn]のいずれかであるべきです。`)
    }
    _testClass(OP) {
        const target = this._getInstance(OP)
        const [pType, isAsync] = this._validMethod(OP, target)
        if (isAsync) { this._testAsync(OP, target, pType) }
        else { this._testSync(OP, target, pType) }
        OP.tearDown(target)
    }
    /*
    test(options) {
//        const OP = {...this.defaultOptions, ...options}
        const OP = {assert:'t', tearDown:(t)=>{}, ...this._getOptions(options)}
        const target = this._getInstance(OP)
        const [pType, isAsync] = this._validMethod(OP, target)
        if (isAsync) { this._testAsync(OP, target, pType) }
        else { this._testSync(OP, target, pType) }
        OP.tearDown(target)
    }
    */
    fin() { this._a.fin() }
    _getOptions(...args) {
        if (0===args.length) { throw new Error(`test()の引数はオプションであるべきです。可変長引数であり[class, method, inouts]です。またはオブジェクトでも可能です。`) }
        console.log(Type.isFn(args[0]), typeof args[0], Type.isCls(args[0]))
        const l = args.length - 1
        if (Type.isCls(args[0]) || Type.isIns(args[0])) { // クラスをテストする
            if (Type.isRange(args.length, 2, 3)) {
//                const l = args.length - 1
                if (!Type.isCls(args[0]) && !Type.isIns(args[0])) { throw new Error(`可変長引数のとき最初の要素はclassであるべきです。その内容は任意クラス（コンストラクタ）か、それをnewした戻り値のインスタンス、いずれかです。`) }
                if (!Type.isAry(args[l])) { throw new Error(`可変長引数のとき最後の要素はinoutsであるべきです。その内容はテスト対象への引数と、assertに渡すテストコード関数です。`) }
                if (Type.isAry(args[l]))

                if (l===2 && !Type.isStr(args[1])) { throw new Error(`可変長引数のとき二番目の要素はテスト対象プロパティ名であるべきです。その内容はメソッド・ゲッター・セッターのいずれかの名前を表す文字列です。`) }
                const op = {class:args[0], inouts:args[l]}
                if (l===2) { op.method = args[1] }
                return op
            } else { throw new Error(`可変長引数のとき要素数は2〜3のみ有効です。その内容は[class, inouts]か[class, method, inouts]です。`) }
        }
        else if (Type.isFn(args[0])) { // 関数をテストする
            if (Type.isAry(args[l])) { // 複数テスト
                if (2===args.length) {
                    if (!Type.isAry(args[1])) { throw new Error(`可変長引数で最初の要素が関数かつ最後の要素が配列のとき最後の要素はinoutsであるべきです。その内容はテスト対象への引数と、assertに渡すテストコード関数です。`) }
                    return ({class:null, method:args[0], inouts:args[1]})
                    
                } else { throw new Error(`可変長引数で最初の要素が関数のとき要素数は2のみ有効です。その内容は[function, inouts]です。`) }
            } else { throw new Error(`可変長引数で最初の要素が関数のとき最後の要素は配列であるべきです。その内容は[fn, [[args, assArgs],...]、[fn, [[args, ErrIns], ...]]、[fn, [[args, ErrCls, ErrMsg], ...]]です。`) }

            /*
            if (Type.isAry(args[l]) && 2===args.length && 2<=args[l][0].length) { // 複数テスト
//            if (Type.isAry(args[l])) { // 複数テスト
                if (2===args.length) {
                    if (!Type.isAry(args[1])) { throw new Error(`可変長引数で最初の要素が関数かつ最後の要素が配列のとき最後の要素はinoutsであるべきです。その内容はテスト対象への引数と、assertに渡すテストコード関数です。`) }
                    return ({class:null, method:args[0], inouts:args[1]})
                    
                } else { throw new Error(`可変長引数で最初の要素が関数のとき要素数は2のみ有効です。その内容は[function, inouts]です。`) }

            } else if (!Type.isAry(args[l])) { // 単発テスト
                if (args.length < 2) { throw new Error(`可変長引数で最初の要素が関数かつ最後の要素が配列でないとき、要素数は2以上必要です。その内容はたとえば[fn, args]や[fn, ErrIns]です。`) }
                if (2===args.length) {
                    if (Type.isFn(args[l])) { return ({class:null, method:args[0], inouts:[[], args[l]]}) }
                    else if (Type.isErrIns(args[l])) { return ({class:null, method:args[0], inouts:[[], args[l]], assert:'e'}) }
                    else if (Type.isErrCls(args[l])) { return ({class:null, method:args[0], inouts:[[], args[l]], assert:'e'}) }
                    else { throw new Error(`可変長引数で最初の要素が関数かつ最後の要素が配列でないときで要素数が2のとき、その内容は[fn, args]か[fn, ErrIns]のみ有効です。`) }
                }
                else if (3===args.length) {
                    if (Type.isAry(args[1])) {
                        if (Type.isFn(args[l])) {return ({class:null, method:args[0], inouts:[args[1], args[l]]}) }
                        if (Type.isStr(args[l])) {
                        }
                    }
                    else if (Type.isErrCls(args[1])) {

                    }
                    else { throw new Error(`可変長引数で最初の要素が関数かつ要素数が3のとき、その内容は[fn, args, assArgs]、[fn, ErrCls, ErrMsg]、[fn, args, ErrIns]のみ有効です。`) }
                }
                else if (4===args.length) {
                    
                }
                else {
                   
                }
            }
            else { throw new Error(`可変長引数で最初の要素が関数のとき後に続く配列は次のいずれかのみです。すなわち単発テスト引数か、複数テスト引数です。単発は[fn, metArgs, assArgs]、複数は[fn, [[metArgs, assArgs], ...]]を基本形とします。fnはテスト対象となる関数です。metArgsはテスト対象に渡す引数で、可変長引数を表す配列です。なければ引数なしと判断します。assArgsはテスト対象の戻り値を引数にとりテスト合否を表す真偽値を返す関数です。例外発生テストがしたいならassArgsはErrorクラスのインスタンスか、Errorコンストラクタとメッセージ文字列のいずれかを指定します。`) }
            */
        }
        else if (Type.isObj(args[0])) {
            if (!args[0].hasOwnProperty('class')) { throw new Error(`引数がオブジェクトのときキー'class'は必須です。その内容は任意クラス（コンストラクタ）か、それをnewした戻り値のインスタンス、いずれかです。キー'method'でテスト対象となるメソッド・ゲッター・セッター名を文字列で指定できます。ない場合はコンストラクタがテスト対象と判断します。`) }
            if (!args[0].hasOwnProperty('inouts')) { throw new Error(`引数がオブジェクトのときキー'inouts'は必須です。その内容はテスト対象への引数と、assertに渡すテストコード関数です。キー'method'でテスト対象となるメソッド・ゲッター・セッター名を文字列で指定できます。ない場合はコンストラクタがテスト対象と判断します。`) }
            return args[0]
        }
        else { throw new Error(`test()の引数はオプションであるべきです。可変長引数であり[class, method, inouts]です。またはオブジェクトでも可能です。`) }
    }
    /*
    _getOptions(options) {
        if (Array.isArray(options)) {
            if (Type.isRange(options.length, 2, 3)) {
                const l = options.length - 1
                if (!Type.isCls(options[0]) && !Type.isIns(options[0])) { throw new Error(`optionsが配列のとき最初の要素はclassであるべきです。その内容は任意クラス（コンストラクタ）か、それをnewした戻り値のインスタンス、いずれかです。`) }
                if (!Type.isAry(options[1])) { throw new Error(`optionsが配列のとき最後の要素はinoutsであるべきです。その内容はテスト対象への引数と、assertに渡すテストコード関数です。`) }
                if (l===2 && !Type.isStr(options[1])) { throw new Error(`optionsが配列のとき二番目の要素はテスト対象プロパティ名であるべきです。その内容はメソッド・ゲッター・セッターのいずれかの名前を表す文字列です。`) }
                const op = {class:options[0], inouts:options[l]}
                if (l===2) { op.method = options[1] }
                return op
            } else { throw new Error(`optionsが配列のとき要素数は2〜3のみ有効です。その内容は[class, inouts]か[class, method, inouts]です。`) }
        }
        else if (Type.isObj(options)) {
            if (!options.hasOwnProperty('class')) { throw new Error(`optionsがオブジェクトのときキー'class'は必須です。その内容は任意クラス（コンストラクタ）か、それをnewした戻り値のインスタンス、いずれかです。キー'method'でテスト対象となるメソッド・ゲッター・セッター名を文字列で指定できます。ない場合はコンストラクタがテスト対象と判断します。`) }
            if (!options.hasOwnProperty('inouts')) { throw new Error(`optionsがオブジェクトのときキー'inouts'は必須です。その内容はテスト対象への引数と、assertに渡すテストコード関数です。キー'method'でテスト対象となるメソッド・ゲッター・セッター名を文字列で指定できます。ない場合はコンストラクタがテスト対象と判断します。`) }
            return options
        }
    }
    */
    _getInstance(options) {
        const C = options.class
        const [N,A] = [C.name, this._getMethodArgs(options)]
        const ins = this._getInsFnStr(C, A)
        if (ins) { return ins }
        else if (Array.isArray(C)) {
            if (0===C.length) { throw new TestError(`options.class.nameはクラス名またはコンストラクタを指定してください。`) }
            else if (1===C.length) { return this._getInsFnStr(C) }
            else { return this._getInsFnStr(C[0], C.splice(1)) }
        }
        else {
            const [N,A] = [C.name, this._getMethodArgs(options)]
            if (this._a._t.__isFn(N)) { return new N(...A) }
            else if (this._a._t.__isStr(N)) { return Reflect.construct(window[N], A) }
            else { throw new TestError(`options.class.nameはクラス名またはコンストラクタを指定してください。`) }
        }
    }
    _getInsFnStr(C, args) {
        console.log(C, args, window[C], window)
        if (this._a._t.__isFn(C)) { return new C(...args) }
        else if (this._a._t.__isStr(C)) { return Reflect.construct(window[C], args ?? []) }
        else if (Type.isIns(C)) { return C }
        return false
    }
    _getMethodArgs(C) {
        if (this._a._t.__isFn(C)) { return [] }
        else if (this._a._t.__isStr(C)) { return [] }
        else if (Array.isArray(C)) {
            if (0 === C.length) { throw new TestError(`options.class.argsはクラス名またはコンストラクタを指定してください。`) }
            else if (1 === C.length) { return [] }
            else {
                if ('function'!==typeof C[1] && !Array.isArray(C[1])) { throw new TestError(`options.class.argsはコンストラクタ引数を示す配列かそれを返す関数にしてください。`) }
                return ('function'===typeof C[1]) ? C[1]() : C[1] } // 配列なら可変長引数。関数なら実行結果（配列）
        }
        else { // C:{name:'', args:[]}  args:[]/()=>
            const A = C.args
            if (!A) { return [] }
            if (!this._a._t.__isFn(A) && !Array.isArray(A)) { throw new TestError(`options.class.argsはコンストラクタ引数を示す配列かそれを返す関数にしてください。`) }
            return this._a._t.__isFn(A) ? A() : A
        }
    }
    _validMethod(options, ins) {
        if (!options.method) { return ['constructor', false] } // メソッドでなくコンストラクタのテストを行う

        // getter,setter         ありえる。引数の型で区別する
        // method,getter         ありえない。後で宣言されたほうが有効。
        // method,setter         同上
        // method,getter,setter  同上
        console.log(Type.hasGetter(ins, options.method), Type.hasSetter(ins, options.method))
        if (Type.isCls(options.class) && Type.hasGetter(ins, options.method) && Type.hasSetter(ins, options.method) && Array.isArray(options.inouts[0])) { console.log(`コンストラクタに引数を渡してゲッターをテスト対象とします。`); return ['getter', false] }
        if (Type.isCls(options.class) && Type.hasSetter(ins, options.method) && Array.isArray(options.inouts[0])) { throw new Error(`inoutsの引数をconstractor/setterのどちらに渡すべきか特定できません。classをconstructorでなくnewしてinstanceにすればsetterの代入値に渡すものと判断できます。`) }
        if (!Type.isCls(options.class) && Type.hasGetter(ins, options.method) && !Type.hasSetter(ins, options.method) && Array.isArray(options.inouts[0])) { throw new Error(`inoutsに不要な引数があります。引数はclassがconstructorかmethodがmethod/setterの場合に必要です。classがinstanceかつmethodがgetterのときは不要です。setterが未実装の可能性もあります。対象クラスの宣言を確認してください。`) }
        if (Type.hasGetter(ins, options.method) && Type.hasSetter(ins, options.method)) {
            if (Array.isArray(options.inouts[0])) { return ['setter', false] }
            else { return ['getter', false] }
        }
        else if (Type.hasSetter(ins, options.method)) {
            if (Array.isArray(options.inouts[0])) { return ['setter', false] }
        }
        else if (Type.hasGetter(ins, options.method)) { return ['getter', false] }
        if ('function'!==typeof ins[options.method]) { throw new TestError(`options.methodはメソッド・ゲッター・セッター名のいずれかを指定してください。フィールド値には非対応です。`) }
        return ['method', 'AsyncFunction,AsyncGeneratorFunction'.split(',').some(n=>n===(ins[options.method]).constructor.name)]
    }
    _testSync(options, target, pType) {
        for (let io of options.inouts) {
            //const [args, expected] = io
            const [args, expected] = Array.isArray(io) ? io : [[], io]
            if (Array.isArray(args) && Type.isCls(options.class)) {
                if ('method,setter'.split(',').some(n=>n===pType)) { throw new Error(`inoutsの引数を渡す先が定まりません。classがコンストラクタでテスト対象がmethodかsetterのため、渡す先が二つあるからです。対処方法はclassの値をインスタンスにすることです。これにて引数はmethod/setterに渡されます。`) }
                target = Reflect.construct(options.class, args)
            }
            this._a[options.assert](...this._testSyncAssArgs(options, target, pType, args, expected))
        }
    }
    _testSyncAssArgs(options, target, pType, args, expected) {
        return 'e'===options.assert 
        ? [...expected, ()=>this._runTestMethod(options, target, pType, args)] 
        : [()=>expected(this._runTestMethod(options, target, pType, args))] }
    _runTestMethod(options, target, pType, args) {
        console.log(pType, options.method, Reflect.get(target, options.method))
        if ('constructor'===pType) { return Reflect.construct(target.constructor, args ?? []) }
        else if ('getter'===pType) { return Reflect.get(target, options.method) }
        else if ('setter'===pType) { Reflect.set(target, options.method, args); return target; }
//        else if ('deleter'===pType) {}
        else { return target[options.method](...args) }
    }
    _testAsync(options, target, pType) {
        for (let io of options.inouts) {
//            const [args, expected] = io
            const [args, expected] = Array.isArray(io) ? io : [[], io]
            console.log(this._a[options.assert])
            this._a[options.assert](
                ...('e'===options.assert
                ? [...expected, (async()=>await target[options.method](...args))]
                : [(async()=>expected(await target[options.method](...args)))])
//                ? [...expected, (async()=>await target[pType](...args))]
//                : [(async()=>expected(await target[pType](...args)))])
//                : [(async()=>{
//                    const r = await target[pType](...args)
//                    console.log(r, expected(r))
//                    return expected(r)
//                })])
            )
        }
    }
}

window.BlackBox = BlackBox
})()
