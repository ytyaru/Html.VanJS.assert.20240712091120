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






    a.fin()

});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

