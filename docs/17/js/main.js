window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    const {h1, p} = van.tags
    const author = 'ytyaru'
    van.add(document.querySelector('main'), 
        h1(van.tags.a({href:`https://github.com/${author}/Html.VanJS.assert.20240712091120/`}, 'assert')),
        p('簡易テストツールAssertを作る。'),
//        p('Create a simple test tool Assert.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())

    // テスト用
    class TestTargetError extends Error {
        constructor(msg, cause) {
            super(msg, {cause,cause});
            this.name = 'TestTargetError';
            this.cause = cause;
        }
    }
    class TestTarget {
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

    const t = new TestTarget()
    const a = new Assertion()

    /*
    a.t(true)
    a.t(false)
    a.f(true)
    a.f(false)
    a.e(Error,'',()=>{throw new Error('')})
    a.e(Error,'A',()=>{throw new Error('B')})
    a.e(TypeError,'A',()=>{throw new Error('A')})
    a.e(TypeError,'A',()=>{throw new Error('B')})

    a.t(()=>true)
    a.t(()=>false)
    a.f(()=>true)
    a.f(()=>false)

    a.t(async()=>true)
    a.t(async()=>false)
    a.f(async()=>true)
    a.f(async()=>false)

    a.e(Error,'',async()=>{throw new Error('')})
    a.e(Error,'A',async()=>{throw new Error('B')})
    a.e(TypeError,'A',async()=>{throw new Error('A')})
    a.e(TypeError,'A',async()=>{throw new Error('B')})

    a.t(()=>{throw new Error('キャッチできない例外発生させる。')})
    a.t(async()=>{throw new Error('キャッチできない例外発生させる。')})

//    a.t(t.throwError()) // キャッチできない例外発生させる。
    a.t(()=>t.throwError())
    a.t(async()=>t.throwError())

    a.t(t.getTrue())
    a.t(t.getFalse())
    a.t(()=>t.getTrue())
    a.t(()=>t.getFalse())
    a.t(async()=>await t.getTrueAsync())
    a.t(async()=>await t.getFalseAsync())
    */
    a.e(Error, /^例外文言です/, ()=>{throw new Error(`例外文言ですが何か問題でも？`)})










    const bb = new BlackBox(a)
    // 関数の単発テスト
    bb.test(()=>1, (r)=>r===1)
    //bb.test((v)=>v+1, 4, (r)=>r===5)
    bb.test((v)=>v+1, [4], (r)=>r===5)
    bb.test(()=>{throw new Error('msg')}, new Error('msg'))
    bb.test(()=>{throw new Error('msg')}, Error, 'msg')
    bb.test((v)=>{if(0===v){throw new Error('msg')}}, [0], new Error('msg'))
    bb.test((v)=>{if(0===v){throw new Error('msg')}}, [0], Error, 'msg')

    // 関数の複数形テスト
    bb.test((v)=>v+1, [[[0], (r)=>r===1]])
    bb.test((v)=>v+1, [
        [[0], (r)=>r===1],
        [[1], (r)=>r===2],
        [[9], (r)=>r===10],
        [[-1], (r)=>r===0],
    ])
    function plusOne(v) { return v+1 }
    bb.test(plusOne, [[[0], (r)=>r===1]])
    bb.test(plusOne, [
        [[0], (r)=>r===1],
        [[1], (r)=>r===2],
        [[9], (r)=>r===10],
        [[-1], (r)=>r===0],
    ])
    async function plusOneAsync(v) { return v+1 }
    bb.test(plusOneAsync, [[[0], (r)=>r===1]])
    bb.test(plusOneAsync, [
        [[0], (r)=>r===1],
        [[1], (r)=>r===2],
        [[9], (r)=>r===10],
        [[-1], (r)=>r===0],
    ])

    // 関数の例外系複数テスト
    ;(function(){
        function fn() { throw new TypeError(`エラーです`) }
        bb.test(new TypeError('エラーです'), fn, [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
    })();
    ;(function(){
        function fn(v) { if (Type.isInt(v) && 0<=v && v<=100) { return v } else { throw new RangeError(`範囲外です`) } }
        // 異常系のみ一括
        bb.test(new RangeError('範囲外です'), fn, [
            [-1],
            [101],
            [null],
            [undefined],
            ['a'],
        ])
        // 正常系のみ一括
        bb.test(fn, [
            [[0], (v)=>v===0],
            [[1], (v)=>v===1],
            [[100], (v)=>v===100],
        ])
        // 正常・異常系混在
        bb.test(fn, [
            [[0], (v)=>v===0],
            [[1], (v)=>v===1],
            [[100], (v)=>v===100],
            [[-1], new RangeError('範囲外です')], // 同じ例外が繰り返されてウザい
            [[101], new RangeError('範囲外です')],
            [[null], new RangeError('範囲外です')],
            [[undefined], new RangeError('範囲外です')],
            [['a'], new RangeError('範囲外です')],
        ])
    })();



    // クラスの単発テスト
    // コンストラクタ
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bb.test(Human, (t)=>t._name===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bb.test(Human, TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, TypeError, 'msg')
    })();
    // static method
    ;(function(){
        class Human { static m() {return 1} }
        bb.test(Human, 'm', (r)=>r===1)
    })();
    ;(function(){
        class Human { static m() {throw new TypeError()} }
        bb.test(Human, 'm', TypeError)
    })();
    ;(function(){
        class Human { static m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', new TypeError('msg'))
    })();
    ;(function(){
        class Human { static m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', TypeError, 'msg')
    })();
    // ゲッター
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bb.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bb.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError()} }
        bb.test(Human, 'name', TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bb.test(Human, 'name', new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bb.test(Human, 'name', TypeError, 'msg')
    })();

    // static method と ゲッター が同名である場合、static methodを優先してテスト対象とする（コンストラクタ表記による同名ゲッターのテスト不可。その場合はインスタンス表記に変えることで可能）
    ;(function(){
        class Human { static name() {return 1} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', (r)=>r===1) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();
    ;(function(){
        class Human { static name() {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', TypeError) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();
   ;(function(){
        class Human { static name() {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', TypeError, 'msg') // static method をテスト対象とする
        bb.test(Human, 'name', new TypeError('msg')) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();

    // セッター
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} }
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} get name(){return this._name}}
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError()} }
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bb.test(new Human(), 'name', '山田', TypeError)
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError('msg')} get name(){return this._name}}
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bb.test(new Human(), 'name', '山田', TypeError, 'msg')
        bb.test(new Human(), 'name', '山田', new TypeError('msg'))
    })();

    // static method, setter がある
    ;(function(){
        class Human { static name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();
    // static method, getter, setter がある
    ;(function(){
        class Human { static name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} get name(){return this._name} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
        // ↑セッターに配列を代入する意図のテスト。これはメソッドに引数を渡す可変長配列と一見見分けがつかないように見える。だがstatic method と setter ならクラスかインスタンスで区別可能。だがinstance methodだと見分けがつかない。ただし問題にもならない。なぜならinstance methodとsetterはどちらもインスタンス文脈内で宣言するものであり、同名ならばどちらか一方しか実装できないから。両方表記すると、後で宣言されたもので上書きされる仕様っぽい。
    })();
    ;(function(){
        class Human { static name() {throw new TypeError()} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', ['山田'], TypeError)
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();
    ;(function(){
        class Human { static name() {throw new TypeError('msg')} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', ['山田'], TypeError, 'msg')
        bb.test(Human, 'name', ['山田'], new TypeError('msg'))
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();


    // instance method
    ;(function(){
        class Human { m() {return 2} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', (r)=>r===2)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {return 2} }
        bb.test(Human, 'm', (r)=>r===1)
        bb.test(new Human(), 'm', (r)=>r===2)
    })();
    ;(function(){
        class Human { m() {throw new TypeError()} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', TypeError)
    })();
    ;(function(){
        class Human { m() {throw new TypeError('msg')} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', TypeError, 'msg')
        bb.test(new Human(), 'm', new TypeError('msg'))
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {throw new TypeError()} }
        bb.test(Human, 'm', (r)=>r===1)
        //bb.test(new Human(), 'm', (r)=>r===2)
        bb.test(new Human(), 'm', TypeError)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', (r)=>r===1)
        //bb.test(new Human(), 'm', (r)=>r===2)
        bb.test(new Human(), 'm', TypeError, 'msg')
        bb.test(new Human(), 'm', new TypeError('msg'))
    })();


    // 引数あるパターン（コンストラクタ、メソッド、セッター）
    // 引数あるパターン（コンストラクタ）
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bb.test(Human, ['山田'], (t)=>t._name==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bb.test(Human, ['山田'], TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, ['山田'], new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, ['山田'], TypeError, 'msg')
    })();
    // 引数あるパターン（static メソッド）
    ;(function(){
        class Human { static name(v) {return 'static:'+v} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static name(v) {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(Human, 'name', ['引数'], TypeError) // static method をテスト対象とする
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static name(v) {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(Human, 'name', ['引数'], TypeError, 'msg') // static method をテスト対象とする
        bb.test(Human, 'name', ['引数'], new TypeError('msg')) // static method をテスト対象とする
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    // 引数あるパターン（セッター）：先述にて試験済み。むしろ引数ないパターンがありえないので。
    // 引数あるパターン（instance メソッド）
    ;(function(){
        class Human { m(v) {return 'instance:'+v} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', ['引数'], (r)=>r==='instance:引数')
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {return `instance:${v}`} }
        bb.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bb.test(new Human(), 'm', ['引数'], (r)=>r===`instance:引数`)
    })();
    ;(function(){
        class Human { m(v) {throw new TypeError()} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', ['引数'], TypeError)
    })();
    ;(function(){
        class Human { m(v) {throw new TypeError('msg')} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', ['引数'], TypeError, 'msg')
        bb.test(new Human(), 'm', ['引数'], new TypeError('msg'))
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {throw new TypeError()} }
        bb.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bb.test(new Human(), 'm', ['引数'], TypeError)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {throw new TypeError('msg')} }
        bb.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bb.test(new Human(), 'm', ['引数'], TypeError, 'msg')
        bb.test(new Human(), 'm', ['引数'], new TypeError('msg'))
    })();


















    // 非同期
    // コンストラクタは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bb.test(Human, (t)=>t._name===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bb.test(Human, TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, TypeError, 'msg')
    })();
    */
    // static method
    ;(function(){
        class Human { static async m() {return 1} }
        bb.test(Human, 'm', (r)=>r===1)
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError()} }
        bb.test(Human, 'm', TypeError)
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', new TypeError('msg'))
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', TypeError, 'msg')
    })();
    // ゲッター
    // ゲッターは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bb.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bb.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError()} }
        bb.test(Human, 'name', TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bb.test(Human, 'name', new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bb.test(Human, 'name', TypeError, 'msg')
    })();
    */
    // static method と ゲッター が同名である場合、static methodを優先してテスト対象とする（コンストラクタ表記による同名ゲッターのテスト不可。その場合はインスタンス表記に変えることで可能）
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', (r)=>r===1) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', TypeError) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();
   ;(function(){
        class Human { static async name() {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', TypeError, 'msg') // static method をテスト対象とする
        bb.test(Human, 'name', new TypeError('msg')) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();

    // セッター
    // セッターは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} }
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} get name(){return this._name}}
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError()} }
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bb.test(new Human(), 'name', '山田', TypeError)
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError('msg')} get name(){return this._name}}
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bb.test(new Human(), 'name', '山田', TypeError, 'msg')
        bb.test(new Human(), 'name', '山田', new TypeError('msg'))
    })();
    */
    // static method, setter がある
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();
    // static method, getter, setter がある
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} get name(){return this._name} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
        // ↑セッターに配列を代入する意図のテスト。これはメソッドに引数を渡す可変長配列と一見見分けがつかないように見える。だがstatic method と setter ならクラスかインスタンスで区別可能。だがinstance methodだと見分けがつかない。ただし問題にもならない。なぜならinstance methodとsetterはどちらもインスタンス文脈内で宣言するものであり、同名ならばどちらか一方しか実装できないから。両方表記すると、後で宣言されたもので上書きされる仕様っぽい。
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError()} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', ['山田'], TypeError)
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError('msg')} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', ['山田'], TypeError, 'msg')
        bb.test(Human, 'name', ['山田'], new TypeError('msg'))
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();


    // instance method
    ;(function(){
        class Human { async m() {return 2} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', (r)=>r===2)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {return 2} }
        bb.test(Human, 'm', (r)=>r===1)
        bb.test(new Human(), 'm', (r)=>r===2)
    })();
    ;(function(){
        class Human { async m() {throw new TypeError()} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', TypeError)
    })();
    ;(function(){
        class Human { async m() {throw new TypeError('msg')} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', TypeError, 'msg')
        bb.test(new Human(), 'm', new TypeError('msg'))
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {throw new TypeError()} }
        bb.test(Human, 'm', (r)=>r===1)
        //bb.test(new Human(), 'm', (r)=>r===2)
        bb.test(new Human(), 'm', TypeError)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', (r)=>r===1)
        //bb.test(new Human(), 'm', (r)=>r===2)
        bb.test(new Human(), 'm', TypeError, 'msg')
        bb.test(new Human(), 'm', new TypeError('msg'))
    })();


    // 引数あるパターン（コンストラクタ、メソッド、セッター）
    // 引数あるパターン（コンストラクタ）
    // コンストラクタは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bb.test(Human, ['山田'], (t)=>t._name==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bb.test(Human, ['山田'], TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, ['山田'], new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, ['山田'], TypeError, 'msg')
    })();
    */
    // 引数あるパターン（static メソッド）
    ;(function(){
        class Human { static async name(v) {return 'static:'+v} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static async name(v) {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(Human, 'name', ['引数'], TypeError) // static method をテスト対象とする
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static async name(v) {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(Human, 'name', ['引数'], TypeError, 'msg') // static method をテスト対象とする
        bb.test(Human, 'name', ['引数'], new TypeError('msg')) // static method をテスト対象とする
        bb.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    // 引数あるパターン（セッター）：先述にて試験済み。むしろ引数ないパターンがありえないので。
    // 引数あるパターン（instance メソッド）
    ;(function(){
        class Human { async m(v) {return 'instance:'+v} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', ['引数'], (r)=>r==='instance:引数')
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {return `instance:${v}`} }
        bb.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bb.test(new Human(), 'm', ['引数'], (r)=>r===`instance:引数`)
    })();
    ;(function(){
        class Human { async m(v) {throw new TypeError()} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', ['引数'], TypeError)
    })();
    ;(function(){
        class Human { async m(v) {throw new TypeError('msg')} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', ['引数'], TypeError, 'msg')
        bb.test(new Human(), 'm', ['引数'], new TypeError('msg'))
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {throw new TypeError()} }
        bb.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bb.test(new Human(), 'm', ['引数'], TypeError)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {throw new TypeError('msg')} }
        bb.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bb.test(new Human(), 'm', ['引数'], TypeError, 'msg')
        bb.test(new Human(), 'm', ['引数'], new TypeError('msg'))
    })();






    // クラスの例外系複数テスト
    // constructor
    ;(function(){
        class C { constructor() { throw new TypeError(`エラーです`) } }
        bb.test(new TypeError('エラーです'), C, [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, 'エラーです', C, [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
    })();
    ;(function(){
        class SomeError extends Error { constructor(msg='Some Error.') { super(msg) } }
        class C { constructor() { throw new SomeError() } }
        bb.test(SomeError, C, [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
    })();
    // static method
    ;(function(){
        class C { static sm() { throw new TypeError(`エラーです`) } }
        bb.test(new TypeError('エラーです'), C, 'sm', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, 'エラーです', C, 'sm', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, C, 'sm', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
    })();
    // getter
    ;(function(){
        class C { get g() { throw new TypeError(`エラーです`) } }
        let c = new C()
        bb.test(new TypeError('エラーです'), c, 'g', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, 'エラーです', c, 'g', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, c, 'g', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
    })();
    // setter
    ;(function(){
        class C { set s(v) { this._v = v; throw new TypeError(`エラーです`) } }
        let c = new C()
        bb.test(new TypeError('エラーです'), c, 's', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, 'エラーです', c, 's', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, c, 's', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
    })();
    // instance method
    ;(function(){
        class C { m(v) { throw new TypeError(`エラーです`) } }
        let c = new C()
        bb.test(new TypeError('エラーです'), c, 'm', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, 'エラーです', c, 'm', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
        bb.test(TypeError, c, 'm', [
            [],
            [undefined],
            [0],
            [1],
            ['a'],
        ])
    })();
    // instance method
    ;(function(){
        class C { m(v) { if (Type.isInt(v) && Type.isRange(v,0,100)) {return v} else { throw new TypeError(`エラーです`) } } }
//        class C { m(v) { if (Type.isInt(v) && 0<=v && v<=100) {return v} else { throw new TypeError(`エラーです`) } } }
        let c = new C()
        bb.test(new TypeError('エラーです'), c, 'm', [
            [],
            [undefined],
            [null],
            [-1],
            [101],
            ['a'],
        ])
        bb.test(TypeError, 'エラーです', c, 'm', [
            [],
            [undefined],
            [null],
            [-1],
            [101],
            ['a'],
        ])
        bb.test(TypeError, c, 'm', [
            [],
            [undefined],
            [null],
            [-1],
            [101],
            ['a'],
        ])
        bb.test(c, 'm', [
            [[0], (r)=>0===r],
        ])
    })();







    /*
    */
























    // クラスの複数テスト
    // コンストラクタ
    // 引数がない場合は複数テストなし
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bb.test(Human, [
            (t)=>t._name===undefined,
            (t)=>t._name===undefined,
        ])
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bb.test(Human, [TypeError, TypeError])
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, [new TypeError('msg'), new TypeError('msg')])
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, [[TypeError, 'msg'], [TypeError, 'msg']])
    })();
    // static method
    ;(function(){
        class Human { static m() {return 1} }
        bb.test(Human, 'm', [(r)=>r===1, (r)=>r===1])
    })();
    ;(function(){
        class Human { static m() {throw new TypeError()} }
        bb.test(Human, 'm', [TypeError, TypeError])
    })();
    ;(function(){
        class Human { static m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', [new TypeError('msg'), new TypeError('msg')])
    })();
    ;(function(){
        class Human { static m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', [[TypeError, 'msg'], [TypeError, 'msg']])
    })();
    // ゲッター
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bb.test(Human, 'name', [(r)=>r===undefined, (r)=>r===undefined])
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田', (r)=>r==='山田'])
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', [(r)=>r===undefined, (r)=>r===undefined])
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田', (r)=>r==='山田'])
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError()} }
        bb.test(Human, 'name', [TypeError, TypeError])
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bb.test(Human, 'name', [new TypeError('msg'), new TypeError('msg')])
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bb.test(Human, 'name', [[TypeError, 'msg'], [TypeError, 'msg']])
    })();

    // static method と ゲッター が同名である場合、static methodを優先してテスト対象とする（コンストラクタ表記による同名ゲッターのテスト不可。その場合はインスタンス表記に変えることで可能）
    ;(function(){
        class Human { static name() {return 1} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', [(r)=>r===1, (r)=>r===1]) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田', (r)=>r==='山田']) // getter をテスト対象とする
    })();
    ;(function(){
        class Human { static name() {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', [TypeError, TypeError]) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田', (r)=>r==='山田']) // getter をテスト対象とする
    })();
   ;(function(){
        class Human { static name() {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', [[TypeError, 'msg'], [TypeError, 'msg']]) // static method をテスト対象とする
        bb.test(Human, 'name', [new TypeError('msg'), new TypeError('msg')]) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田', (r)=>r==='山田']) // getter をテスト対象とする
    })();

    // セッター
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} }
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bb.test(new Human(), 'name', [['山田', (t)=>t._name==='山田山田'], ['鈴木', (t)=>t._name==='鈴木鈴木']])
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} get name(){return this._name}}
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bb.test(new Human(), 'name', [['山田', (t)=>t._name==='山田山田'], ['山田', (t)=>t._name==='山田山田']])
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError()} }
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bb.test(new Human(), 'name', [['山田', TypeError], ['山田', TypeError]])
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError('msg')} get name(){return this._name}}
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bb.test(new Human(), 'name', [['山田', TypeError, 'msg'], ['山田', TypeError, 'msg']])
        bb.test(new Human(), 'name', [['山田', new TypeError('msg')], ['山田', new TypeError('msg')]])
    })();

    // static method, setter がある
    ;(function(){
        class Human { static name(v) {return `static:${v}`} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', [
            [['山田'], (r)=>r===`static:山田`],
            [['鈴木'], (r)=>r===`static:鈴木`],
        ])
        bb.test(new Human(), 'name', [
            ['山田', (t)=>t._name==='山田'],
            ['鈴木', (t)=>t._name==='鈴木'],
        ])
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
    })();
    // static method, getter, setter がある
    ;(function(){
        class Human { static name(v) {return `static:${v}`} constructor(n) { this._name = n } set name(v){this._name=v} get name(){return this._name} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bb.test(Human, 'name', [
            [['山田'], (r)=>r===`static:山田`],
            [['鈴木'], (r)=>r===`static:鈴木`],
        ])
        bb.test(new Human(), 'name', [
            ['山田', (t)=>t._name==='山田'],
            ['鈴木', (t)=>t._name==='鈴木'],
        ])
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
        // ↑セッターに配列を代入する意図のテスト。これはメソッドに引数を渡す可変長配列と一見見分けがつかないように見える。だがstatic method と setter ならクラスかインスタンスで区別可能。だがinstance methodだと見分けがつかない。ただし問題にもならない。なぜならinstance methodとsetterはどちらもインスタンス文脈内で宣言するものであり、同名ならばどちらか一方しか実装できないから。両方表記すると、後で宣言されたもので上書きされる仕様っぽい。
    })();
    ;(function(){
        class Human { static name() {throw new TypeError()} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', [
            [['山田'], TypeError],
            [['鈴木'], TypeError],
        ])
        bb.test(new Human(), 'name', [
            ['山田', (t)=>t._name==='山田'],
            ['鈴木', (t)=>t._name==='鈴木'],
        ])
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
        ])
    })();
    ;(function(){
        class Human { static name() {throw new TypeError('msg')} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', [
            [['山田'], TypeError, 'msg'],
            [['鈴木'], TypeError, 'msg'],
        ])
        bb.test(Human, 'name', [
            [['山田'], new TypeError('msg')],
            [['鈴木'], new TypeError('msg')],
        ])
        bb.test(new Human(), 'name', [
            ['山田', (t)=>t._name==='山田'],
            ['鈴木', (t)=>t._name==='鈴木'],
        ])
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
    })();


    // instance method
    ;(function(){
        class Human { m() {return 2} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [(r)=>r===2, (r)=>r===2])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {return 2} }
        bb.test(Human, 'm', [(r)=>r===1, (r)=>r===1])
        bb.test(new Human(), 'm', [(r)=>r===2, (r)=>r===2])
    })();
    ;(function(){
        class Human { m() {throw new TypeError()} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [TypeError, TypeError])
    })();
    ;(function(){
        class Human { m() {throw new TypeError('msg')} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [[TypeError, 'msg'], [TypeError, 'msg']])
        bb.test(new Human(), 'm', [new TypeError('msg'), new TypeError('msg')])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {throw new TypeError()} }
        bb.test(Human, 'm', [(r)=>r===1, (r)=>r===1])
        //bb.test(new Human(), 'm', (r)=>r===2)
        bb.test(new Human(), 'm', [TypeError, TypeError])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', [(r)=>r===1, (r)=>r===1])
        //bb.test(new Human(), 'm', (r)=>r===2)
        bb.test(new Human(), 'm', [[TypeError, 'msg'], [TypeError, 'msg']])
        bb.test(new Human(), 'm', [new TypeError('msg'), new TypeError('msg')])
    })();


    // 引数あるパターン（コンストラクタ、メソッド、セッター）
    // 引数あるパターン（コンストラクタ）
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bb.test(Human, [
            [['山田'], (t)=>t._name==='山田'],
            [['鈴木'], (t)=>t._name==='鈴木'],
        ])
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bb.test(Human, [
            [['山田'], TypeError], 
            [['鈴木'], TypeError], 
        ])
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, [
            [['山田'], new TypeError('msg')],
            [['鈴木'], new TypeError('msg')],
        ])
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, [
            [['山田'], TypeError, 'msg'],
            [['鈴木'], TypeError, 'msg'],
        ])
    })();
    // 引数あるパターン（static メソッド）
    ;(function(){
        class Human { static name(v) {return 'static:'+v} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        bb.test(Human, 'name', [
            [['山田'], (r)=>r==='static:山田'],
            [['鈴木'], (r)=>r==='static:鈴木'],
        ]) // static method をテスト対象とする
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ]) // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static name(v) {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(Human, 'name', [
            [['山田'], TypeError],
            [['鈴木'], TypeError],
        ]) // static method をテスト対象とする
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ]) // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static name(v) {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(Human, 'name', [
            [['引数'], TypeError, 'msg'],
            [['引数'], TypeError, 'msg'],
        ]) // static method をテスト対象とする
        bb.test(Human, 'name', [
            [['引数'], new TypeError('msg')],
            [['引数'], new TypeError('msg')],
        ]) // static method をテスト対象とする
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ]) // setter をテスト対象とする
    })();
    // 引数あるパターン（セッター）：先述にて試験済み。むしろ引数ないパターンがありえないので。
    // 引数あるパターン（instance メソッド）
    ;(function(){
        class Human { m(v) {return 'instance:'+v} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [
            [['引数1'], (r)=>r==='instance:引数1'],
            [['引数2'], (r)=>r==='instance:引数2'],
        ])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {return `instance:${v}`} }
        bb.test(Human, 'm', [
            [['引数1'], (r)=>r===`static:引数1`],
            [['引数2'], (r)=>r===`static:引数2`],
        ])
        bb.test(new Human(), 'm', [
            [['引数1'], (r)=>r===`instance:引数1`],
            [['引数2'], (r)=>r===`instance:引数2`],
        ])
    })();
    ;(function(){
        class Human { m(v) {throw new TypeError()} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [
            [['引数1'], TypeError],
            [['引数2'], TypeError],
        ])
    })();
    ;(function(){
        class Human { m(v) {throw new TypeError('msg')} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [[['引数'], TypeError, 'msg'], [['引数'], TypeError, 'msg']])
        bb.test(new Human(), 'm', [[['引数'], new TypeError('msg')], [['引数'], new TypeError('msg')]])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {throw new TypeError()} }
        bb.test(Human, 'm', [
            [['引数1'], (r)=>r===`static:引数1`],
            [['引数2'], (r)=>r===`static:引数2`],
        ])
        bb.test(new Human(), 'm', [
            [['引数1'], TypeError],
            [['引数2'], TypeError],
        ])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {throw new TypeError('msg')} }
        bb.test(Human, 'm', [
            [['引数1'], (r)=>r===`static:引数1`],
            [['引数2'], (r)=>r===`static:引数2`],
        ])
        bb.test(new Human(), 'm', [
            [['引数1'], TypeError, 'msg'],
            [['引数2'], TypeError, 'msg'],
        ])
        bb.test(new Human(), 'm', [
            [['引数1'], new TypeError('msg')],
            [['引数2'], new TypeError('msg')],
        ])
    })();


















    // 非同期
    // コンストラクタは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bb.test(Human, (t)=>t._name===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bb.test(Human, TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, TypeError, 'msg')
    })();
    */
    // static method
    ;(function(){
        class Human { static async m() {return 1} }
        bb.test(Human, 'm', [(r)=>r===1, (r)=>r===1])
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError()} }
        bb.test(Human, 'm', [TypeError, TypeError])
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', [new TypeError('msg'), new TypeError('msg')])
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', [[TypeError, 'msg'], [TypeError, 'msg']])
    })();
    // ゲッター
    // ゲッターは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bb.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bb.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError()} }
        bb.test(Human, 'name', TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bb.test(Human, 'name', new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bb.test(Human, 'name', TypeError, 'msg')
    })();
    */
    // static method と ゲッター が同名である場合、static methodを優先してテスト対象とする（コンストラクタ表記による同名ゲッターのテスト不可。その場合はインスタンス表記に変えることで可能）
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', [(r)=>r===1, (r)=>r===1]) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田', (r)=>r==='山田']) // getter をテスト対象とする
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', [TypeError, TypeError]) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田', (r)=>r==='山田']) // getter をテスト対象とする
    })();
   ;(function(){
        class Human { static async name() {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bb.test(Human, 'name', [[TypeError, 'msg'], [TypeError, 'msg']]) // static method をテスト対象とする
        bb.test(Human, 'name', [new TypeError('msg'), new TypeError('msg')]) // static method をテスト対象とする
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田', (r)=>r==='山田']) // getter をテスト対象とする
    })();

    // セッター
    // セッターは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} }
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} get name(){return this._name}}
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError()} }
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bb.test(new Human(), 'name', '山田', TypeError)
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError('msg')} get name(){return this._name}}
        //bb.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bb.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bb.test(new Human(), 'name', '山田', TypeError, 'msg')
        bb.test(new Human(), 'name', '山田', new TypeError('msg'))
    })();
    */
    // static method, setter がある
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bb.test(Human, 'name', [[['山田'], (r)=>r===1], [['鈴木'], (r)=>r===1]])
        bb.test(new Human(), 'name', [['山田', (t)=>t._name==='山田'], ['鈴木', (t)=>t._name==='鈴木']])
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
    })();
    // static method, getter, setter がある
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} get name(){return this._name} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bb.test(Human, 'name', [[['山田'], (r)=>r===1], [['山田'], (r)=>r===1]])
        bb.test(new Human(), 'name', [['山田', (t)=>t._name==='山田'], ['山田', (t)=>t._name==='山田']])
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
        // ↑セッターに配列を代入する意図のテスト。これはメソッドに引数を渡す可変長配列と一見見分けがつかないように見える。だがstatic method と setter ならクラスかインスタンスで区別可能。だがinstance methodだと見分けがつかない。ただし問題にもならない。なぜならinstance methodとsetterはどちらもインスタンス文脈内で宣言するものであり、同名ならばどちらか一方しか実装できないから。両方表記すると、後で宣言されたもので上書きされる仕様っぽい。
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError()} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', [[['山田'], TypeError], [['山田'], TypeError]])
        bb.test(new Human(), 'name', [['山田', (t)=>t._name==='山田'], ['山田', (t)=>t._name==='山田']])
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError('msg')} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bb.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bb.test(Human, 'name', ['山田'], (r)=>r===1)
        bb.test(Human, 'name', [[['山田'], TypeError, 'msg'], [['山田'], TypeError, 'msg']])
        bb.test(Human, 'name', [[['山田'], new TypeError('msg')], [['山田'], new TypeError('msg')]])
        bb.test(new Human(), 'name', [['山田', (t)=>t._name==='山田'], ['山田', (t)=>t._name==='山田']])
        bb.test(new Human(), 'name', [
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
    })();


    // instance method
    ;(function(){
        class Human { async m() {return 2} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [(r)=>r===2, (r)=>r===2])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {return 2} }
        bb.test(Human, 'm', [(r)=>r===1, (r)=>r===1])
        bb.test(new Human(), 'm', [(r)=>r===2, (r)=>r===2])
    })();
    ;(function(){
        class Human { async m() {throw new TypeError()} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [TypeError, TypeError])
    })();
    ;(function(){
        class Human { async m() {throw new TypeError('msg')} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [[TypeError, 'msg'], [TypeError, 'msg']])
        bb.test(new Human(), 'm', [new TypeError('msg'), new TypeError('msg')])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {throw new TypeError()} }
        bb.test(Human, 'm', [(r)=>r===1, (r)=>r===1])
        //bb.test(new Human(), 'm', (r)=>r===2)
        bb.test(new Human(), 'm', [TypeError, TypeError])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {throw new TypeError('msg')} }
        bb.test(Human, 'm', [(r)=>r===1, (r)=>r===1])
        //bb.test(new Human(), 'm', (r)=>r===2)
        bb.test(new Human(), 'm', [[TypeError, 'msg'], [TypeError, 'msg']])
        bb.test(new Human(), 'm', [new TypeError('msg'), new TypeError('msg')])
    })();


    // 引数あるパターン（コンストラクタ、メソッド、セッター）
    // 引数あるパターン（コンストラクタ）
    // コンストラクタは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bb.test(Human, ['山田'], (t)=>t._name==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bb.test(Human, ['山田'], TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, ['山田'], new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bb.test(Human, ['山田'], TypeError, 'msg')
    })();
    */
    // 引数あるパターン（static メソッド）
    ;(function(){
        class Human { static async name(v) {return 'static:'+v} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        bb.test(Human, 'name', [ // static method をテスト対象とする
            [['引数'], (r)=>r==='static:引数'], 
            [['引数'], (r)=>r==='static:引数']
        ])
        bb.test(new Human(), 'name', [ // setter をテスト対象とする
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
    })();
    ;(function(){
        class Human { static async name(v) {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(Human, 'name', [[['引数'], TypeError], [['引数'], TypeError]]) // static method をテスト対象とする
        bb.test(new Human(), 'name', [ // setter をテスト対象とする
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
    })();
    ;(function(){
        class Human { static async name(v) {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bb.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bb.test(Human, 'name', [[['引数'], TypeError, 'msg'], [['引数'], TypeError, 'msg']]) // static method をテスト対象とする
        bb.test(Human, 'name', [[['引数'], new TypeError('msg')], [['引数'], new TypeError('msg')]]) // static method をテスト対象とする
        bb.test(new Human(), 'name', [ // setter をテスト対象とする
            [['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田'],
            [['鈴木'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='鈴木'],
        ])
    })();
    // 引数あるパターン（セッター）：先述にて試験済み。むしろ引数ないパターンがありえないので。
    // 引数あるパターン（instance メソッド）
    ;(function(){
        class Human { async m(v) {return 'instance:'+v} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [[['引数'], (r)=>r==='instance:引数'], [['引数2'], (r)=>r==='instance:引数2']])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {return `instance:${v}`} }
        bb.test(Human, 'm', [[['引数'], (r)=>r===`static:引数`], [['引数2'], (r)=>r===`static:引数2`]])
        bb.test(new Human(), 'm', [[['引数'], (r)=>r===`instance:引数`], [['引数2'], (r)=>r===`instance:引数2`]])
    })();
    ;(function(){
        class Human { async m(v) {throw new TypeError()} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [[['引数'], TypeError], [['引数2'], TypeError]])
    })();
    ;(function(){
        class Human { async m(v) {throw new TypeError('msg')} }
        //bb.test(Human, 'm', (r)=>r===2) // 引数エラー
        bb.test(new Human(), 'm', [[['引数'], TypeError, 'msg'], [['引数2'], TypeError, 'msg']])
        bb.test(new Human(), 'm', [[['引数'], new TypeError('msg')], [['引数2'], new TypeError('msg')]])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {throw new TypeError()} }
        bb.test(Human, 'm', [[['引数'], (r)=>r===`static:引数`], [['引数2'], (r)=>r===`static:引数2`]])
        bb.test(new Human(), 'm', [[['引数'], TypeError], [['引数'], TypeError]])
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {throw new TypeError('msg')} }
        bb.test(Human, 'm', [[['引数'], (r)=>r===`static:引数`], [['引数2'], (r)=>r===`static:引数2`]])
        bb.test(new Human(), 'm', [[['引数'], TypeError, 'msg'], [['引数2'], TypeError, 'msg']])
        bb.test(new Human(), 'm', [[['引数'], new TypeError('msg')], [['引数2'], new TypeError('msg')]])
    })();











    a.fin()

});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

