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


    const bbc = new BlackBoxCls(a)

    // クラスの単発テスト
    // コンストラクタ
    /*
    */
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bbc.test(Human, (t)=>t._name===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bbc.test(Human, TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bbc.test(Human, new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bbc.test(Human, TypeError, 'msg')
    })();
    // static method
    ;(function(){
        class Human { static m() {return 1} }
        bbc.test(Human, 'm', (r)=>r===1)
    })();
    ;(function(){
        class Human { static m() {throw new TypeError()} }
        bbc.test(Human, 'm', TypeError)
    })();
    ;(function(){
        class Human { static m() {throw new TypeError('msg')} }
        bbc.test(Human, 'm', new TypeError('msg'))
    })();
    ;(function(){
        class Human { static m() {throw new TypeError('msg')} }
        bbc.test(Human, 'm', TypeError, 'msg')
    })();
    // ゲッター
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bbc.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError()} }
        bbc.test(Human, 'name', TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bbc.test(Human, 'name', new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bbc.test(Human, 'name', TypeError, 'msg')
    })();

    // static method と ゲッター が同名である場合、static methodを優先してテスト対象とする（コンストラクタ表記による同名ゲッターのテスト不可。その場合はインスタンス表記に変えることで可能）
    ;(function(){
        class Human { static name() {return 1} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(Human, 'name', (r)=>r===1) // static method をテスト対象とする
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();
    ;(function(){
        class Human { static name() {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(Human, 'name', TypeError) // static method をテスト対象とする
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();
   ;(function(){
        class Human { static name() {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(Human, 'name', TypeError, 'msg') // static method をテスト対象とする
        bbc.test(Human, 'name', new TypeError('msg')) // static method をテスト対象とする
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();

    // セッター
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} }
        //bbc.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} get name(){return this._name}}
        //bbc.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError()} }
        //bbc.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bbc.test(new Human(), 'name', '山田', TypeError)
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError('msg')} get name(){return this._name}}
        //bbc.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bbc.test(new Human(), 'name', '山田', TypeError, 'msg')
        bbc.test(new Human(), 'name', '山田', new TypeError('msg'))
    })();

    // static method, setter がある
    ;(function(){
        class Human { static name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bbc.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bbc.test(Human, 'name', ['山田'], (r)=>r===1)
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();
    // static method, getter, setter がある
    ;(function(){
        class Human { static name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} get name(){return this._name} }
//        bbc.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bbc.test(Human, 'name', ['山田'], (r)=>r===1)
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
        // ↑セッターに配列を代入する意図のテスト。これはメソッドに引数を渡す可変長配列と一見見分けがつかないように見える。だがstatic method と setter ならクラスかインスタンスで区別可能。だがinstance methodだと見分けがつかない。ただし問題にもならない。なぜならinstance methodとsetterはどちらもインスタンス文脈内で宣言するものであり、同名ならばどちらか一方しか実装できないから。両方表記すると、後で宣言されたもので上書きされる仕様っぽい。
    })();
    ;(function(){
        class Human { static name() {throw new TypeError()} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bbc.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bbc.test(Human, 'name', ['山田'], (r)=>r===1)
        bbc.test(Human, 'name', ['山田'], TypeError)
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();
    ;(function(){
        class Human { static name() {throw new TypeError('msg')} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bbc.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bbc.test(Human, 'name', ['山田'], (r)=>r===1)
        bbc.test(Human, 'name', ['山田'], TypeError, 'msg')
        bbc.test(Human, 'name', ['山田'], new TypeError('msg'))
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();


    // instance method
    ;(function(){
        class Human { m() {return 2} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', (r)=>r===2)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {return 2} }
        bbc.test(Human, 'm', (r)=>r===1)
        bbc.test(new Human(), 'm', (r)=>r===2)
    })();
    ;(function(){
        class Human { m() {throw new TypeError()} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', TypeError)
    })();
    ;(function(){
        class Human { m() {throw new TypeError('msg')} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', TypeError, 'msg')
        bbc.test(new Human(), 'm', new TypeError('msg'))
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {throw new TypeError()} }
        bbc.test(Human, 'm', (r)=>r===1)
        //bbc.test(new Human(), 'm', (r)=>r===2)
        bbc.test(new Human(), 'm', TypeError)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m() {return 1} m() {throw new TypeError('msg')} }
        bbc.test(Human, 'm', (r)=>r===1)
        //bbc.test(new Human(), 'm', (r)=>r===2)
        bbc.test(new Human(), 'm', TypeError, 'msg')
        bbc.test(new Human(), 'm', new TypeError('msg'))
    })();


    // 引数あるパターン（コンストラクタ、メソッド、セッター）
    // 引数あるパターン（コンストラクタ）
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bbc.test(Human, ['山田'], (t)=>t._name==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bbc.test(Human, ['山田'], TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bbc.test(Human, ['山田'], new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bbc.test(Human, ['山田'], TypeError, 'msg')
    })();
    // 引数あるパターン（static メソッド）
    ;(function(){
        class Human { static name(v) {return 'static:'+v} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        bbc.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static name(v) {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bbc.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bbc.test(Human, 'name', ['引数'], TypeError) // static method をテスト対象とする
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static name(v) {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bbc.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bbc.test(Human, 'name', ['引数'], TypeError, 'msg') // static method をテスト対象とする
        bbc.test(Human, 'name', ['引数'], new TypeError('msg')) // static method をテスト対象とする
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    // 引数あるパターン（セッター）：先述にて試験済み。むしろ引数ないパターンがありえないので。
    // 引数あるパターン（instance メソッド）
    ;(function(){
        class Human { m(v) {return 'instance:'+v} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', ['引数'], (r)=>r==='instance:引数')
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {return `instance:${v}`} }
        bbc.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bbc.test(new Human(), 'm', ['引数'], (r)=>r===`instance:引数`)
    })();
    ;(function(){
        class Human { m(v) {throw new TypeError()} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', ['引数'], TypeError)
    })();
    ;(function(){
        class Human { m(v) {throw new TypeError('msg')} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', ['引数'], TypeError, 'msg')
        bbc.test(new Human(), 'm', ['引数'], new TypeError('msg'))
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {throw new TypeError()} }
        bbc.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bbc.test(new Human(), 'm', ['引数'], TypeError)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static m(v) {return `static:${v}`} m(v) {throw new TypeError('msg')} }
        bbc.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bbc.test(new Human(), 'm', ['引数'], TypeError, 'msg')
        bbc.test(new Human(), 'm', ['引数'], new TypeError('msg'))
    })();


















    // 非同期
    // コンストラクタは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bbc.test(Human, (t)=>t._name===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bbc.test(Human, TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bbc.test(Human, new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bbc.test(Human, TypeError, 'msg')
    })();
    */
    // static method
    ;(function(){
        class Human { static async m() {return 1} }
        bbc.test(Human, 'm', (r)=>r===1)
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError()} }
        bbc.test(Human, 'm', TypeError)
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError('msg')} }
        bbc.test(Human, 'm', new TypeError('msg'))
    })();
    ;(function(){
        class Human { static async m() {throw new TypeError('msg')} }
        bbc.test(Human, 'm', TypeError, 'msg')
    })();
    // ゲッター
    // ゲッターは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bbc.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){return this._name} }
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(Human, 'name', (r)=>r===undefined)
    })();
    ;(function(){ // セッターもある場合
        class Human { constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError()} }
        bbc.test(Human, 'name', TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bbc.test(Human, 'name', new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } get name(){throw new TypeError('msg')} }
        bbc.test(Human, 'name', TypeError, 'msg')
    })();
    */
    // static method と ゲッター が同名である場合、static methodを優先してテスト対象とする（コンストラクタ表記による同名ゲッターのテスト不可。その場合はインスタンス表記に変えることで可能）
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(Human, 'name', (r)=>r===1) // static method をテスト対象とする
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(Human, 'name', TypeError) // static method をテスト対象とする
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();
   ;(function(){
        class Human { static async name() {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){} }
        bbc.test(Human, 'name', TypeError, 'msg') // static method をテスト対象とする
        bbc.test(Human, 'name', new TypeError('msg')) // static method をテスト対象とする
        bbc.test(new Human('山田'), 'name', (r)=>r==='山田') // getter をテスト対象とする
    })();

    // セッター
    // セッターは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} }
        //bbc.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){this._name=v+v} get name(){return this._name}}
        //bbc.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
    })();
    ;(function(){
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError()} }
        //bbc.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bbc.test(new Human(), 'name', '山田', TypeError)
    })();
    ;(function(){ // ゲッターもある
        class Human { constructor(n) { this._name = n } set name(v){throw new TypeError('msg')} get name(){return this._name}}
        //bbc.test(Human, 'name', '山田', (t)=>t._name==='山田山田') // 第一引数がコンストラクタの場合セッター確認させない仕様
        //bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田山田')
        bbc.test(new Human(), 'name', '山田', TypeError, 'msg')
        bbc.test(new Human(), 'name', '山田', new TypeError('msg'))
    })();
    */
    // static method, setter がある
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bbc.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bbc.test(Human, 'name', ['山田'], (r)=>r===1)
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();
    // static method, getter, setter がある
    ;(function(){
        class Human { static async name() {return 1} constructor(n) { this._name = n } set name(v){this._name=v} get name(){return this._name} }
//        bbc.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        bbc.test(Human, 'name', ['山田'], (r)=>r===1)
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
        // ↑セッターに配列を代入する意図のテスト。これはメソッドに引数を渡す可変長配列と一見見分けがつかないように見える。だがstatic method と setter ならクラスかインスタンスで区別可能。だがinstance methodだと見分けがつかない。ただし問題にもならない。なぜならinstance methodとsetterはどちらもインスタンス文脈内で宣言するものであり、同名ならばどちらか一方しか実装できないから。両方表記すると、後で宣言されたもので上書きされる仕様っぽい。
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError()} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bbc.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bbc.test(Human, 'name', ['山田'], (r)=>r===1)
        bbc.test(Human, 'name', ['山田'], TypeError)
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();
    ;(function(){
        class Human { static async name() {throw new TypeError('msg')} constructor(n) { this._name = n } set name(v){this._name=v} }
//        bbc.test(Human, 'name', '山田', (r)=>r===1) // 引数不正エラー
        //bbc.test(Human, 'name', ['山田'], (r)=>r===1)
        bbc.test(Human, 'name', ['山田'], TypeError, 'msg')
        bbc.test(Human, 'name', ['山田'], new TypeError('msg'))
        bbc.test(new Human(), 'name', '山田', (t)=>t._name==='山田')
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田')
    })();


    // instance method
    ;(function(){
        class Human { async m() {return 2} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', (r)=>r===2)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {return 2} }
        bbc.test(Human, 'm', (r)=>r===1)
        bbc.test(new Human(), 'm', (r)=>r===2)
    })();
    ;(function(){
        class Human { async m() {throw new TypeError()} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', TypeError)
    })();
    ;(function(){
        class Human { async m() {throw new TypeError('msg')} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', TypeError, 'msg')
        bbc.test(new Human(), 'm', new TypeError('msg'))
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {throw new TypeError()} }
        bbc.test(Human, 'm', (r)=>r===1)
        //bbc.test(new Human(), 'm', (r)=>r===2)
        bbc.test(new Human(), 'm', TypeError)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m() {return 1} async m() {throw new TypeError('msg')} }
        bbc.test(Human, 'm', (r)=>r===1)
        //bbc.test(new Human(), 'm', (r)=>r===2)
        bbc.test(new Human(), 'm', TypeError, 'msg')
        bbc.test(new Human(), 'm', new TypeError('msg'))
    })();


    // 引数あるパターン（コンストラクタ、メソッド、セッター）
    // 引数あるパターン（コンストラクタ）
    // コンストラクタは非同期にできないのでテスト不要
    /*
    ;(function(){
        class Human { constructor(n) { this._name = n } }
        bbc.test(Human, ['山田'], (t)=>t._name==='山田')
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError() } }
        bbc.test(Human, ['山田'], TypeError)
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bbc.test(Human, ['山田'], new TypeError('msg'))
    })();
    ;(function(){
        class Human { constructor(n) { throw new TypeError('msg') } }
        bbc.test(Human, ['山田'], TypeError, 'msg')
    })();
    */
    // 引数あるパターン（static メソッド）
    ;(function(){
        class Human { static async name(v) {return 'static:'+v} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        bbc.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static async name(v) {throw new TypeError()} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bbc.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bbc.test(Human, 'name', ['引数'], TypeError) // static method をテスト対象とする
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    ;(function(){
        class Human { static async name(v) {throw new TypeError('msg')} constructor(n) { this._name = n } get name(){return this._name} set name(v){this._name=v;} }
        //bbc.test(Human, 'name', ['引数'], (r)=>r==='static:引数') // static method をテスト対象とする
        bbc.test(Human, 'name', ['引数'], TypeError, 'msg') // static method をテスト対象とする
        bbc.test(Human, 'name', ['引数'], new TypeError('msg')) // static method をテスト対象とする
        bbc.test(new Human(), 'name', ['山田'], (t)=>Type.isAry(t._name) && 1===t._name.length && t._name[0]==='山田') // setter をテスト対象とする
    })();
    // 引数あるパターン（セッター）：先述にて試験済み。むしろ引数ないパターンがありえないので。
    // 引数あるパターン（instance メソッド）
    ;(function(){
        class Human { async m(v) {return 'instance:'+v} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', ['引数'], (r)=>r==='instance:引数')
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {return `instance:${v}`} }
        bbc.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bbc.test(new Human(), 'm', ['引数'], (r)=>r===`instance:引数`)
    })();
    ;(function(){
        class Human { async m(v) {throw new TypeError()} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', ['引数'], TypeError)
    })();
    ;(function(){
        class Human { async m(v) {throw new TypeError('msg')} }
        //bbc.test(Human, 'm', (r)=>r===2) // 引数エラー
        bbc.test(new Human(), 'm', ['引数'], TypeError, 'msg')
        bbc.test(new Human(), 'm', ['引数'], new TypeError('msg'))
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {throw new TypeError()} }
        bbc.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bbc.test(new Human(), 'm', ['引数'], TypeError)
    })();
    ;(function(){ // 同名 static method もある場合
        class Human { static async m(v) {return `static:${v}`} async m(v) {throw new TypeError('msg')} }
        bbc.test(Human, 'm', ['引数'], (r)=>r===`static:引数`)
        bbc.test(new Human(), 'm', ['引数'], TypeError, 'msg')
        bbc.test(new Human(), 'm', ['引数'], new TypeError('msg'))
    })();



    /*
    */



    /*
    const bbf = new BlackBoxFn(a)

    // 関数の単発テスト
    bbf.test(()=>1, (r)=>r===1)
    //bbf.test((v)=>v+1, 4, (r)=>r===5)
    bbf.test((v)=>v+1, [4], (r)=>r===5)
    bbf.test(()=>{throw new Error('msg')}, new Error('msg'))
    bbf.test(()=>{throw new Error('msg')}, Error, 'msg')
    bbf.test((v)=>{if(0===v){throw new Error('msg')}}, [0], new Error('msg'))
    bbf.test((v)=>{if(0===v){throw new Error('msg')}}, [0], Error, 'msg')

    // 関数の複数形テスト
    bbf.test((v)=>v+1, [[[0], (r)=>r===1]])
    bbf.test((v)=>v+1, [
        [[0], (r)=>r===1],
        [[1], (r)=>r===2],
        [[9], (r)=>r===10],
        [[-1], (r)=>r===0],
    ])
    function plusOne(v) { return v+1 }
    bbf.test(plusOne, [[[0], (r)=>r===1]])
    bbf.test(plusOne, [
        [[0], (r)=>r===1],
        [[1], (r)=>r===2],
        [[9], (r)=>r===10],
        [[-1], (r)=>r===0],
    ])
    async function plusOneAsync(v) { return v+1 }
    bbf.test(plusOneAsync, [[[0], (r)=>r===1]])
    bbf.test(plusOneAsync, [
        [[0], (r)=>r===1],
        [[1], (r)=>r===2],
        [[9], (r)=>r===10],
        [[-1], (r)=>r===0],
    ])
    */



    const bb = new BlackBox(a)
    /*
    // 非同期
    bb.test({
        class: TestTarget,
        method: 'getTrueAsync',
        assert: 't',
        inouts:[
            [[], (r)=>r],
            [[], (r)=>!r],
        ],
    })
    bb.test({
        class: TestTarget,
        method: 'getFalseAsync',
        assert: 'f',
        inouts:[
            [[], (r)=>r],
            [[], (r)=>!r],
        ],
    })
    bb.test({
        class: TestTarget,
        method: 'throwErrorAsync',
        assert: 'e',
        inouts:[
            [[], [Error, '']],
            [[], [TestTargetError, '']],
            [[], [Error, '例外を投げます。']],
            [[], [TestTargetError, '例外を投げます。']],
        ],
    })

    // 同期
    bb.test({
        class: TestTarget,
        method: 'getTrue',
        assert: 't',
        inouts:[
            [[], (r)=>r],
            [[], (r)=>!r],
        ],
    })
    bb.test({
        class: TestTarget,
        method: 'getFalse',
        assert: 'f',
        inouts:[
            [[], (r)=>r],
            [[], (r)=>!r],
        ],
    })
    bb.test({
        class: TestTarget,
        method: 'throwError',
        assert: 'e',
        inouts:[
            [[], [Error, '']],
            [[], [TestTargetError, '']],
            [[], [Error, '例外を投げます。']],
            [[], [TestTargetError, '例外を投げます。']],
        ],
    })
    */



    /*
    // getter/setterの宣言有無パターンテスト
    ;(function(){ // TypeError: (intermediate value) is not a function   セミコロンが先頭に必要……ウゼェ
        // こんなコードは書くべきでない。そもそも書けてしまう状態が困る。構文解析の時点で例外を出して欲しい。
        class Human {
            constructor(name) { this._name = name }
            name() { return 'method' }     // 上書きされて参照できない！
            get name() { return 'getter' } // 同名なら後に宣言したほうが有効
        }
        console.assert((new Human()).name==='getter')
        a.e(TypeError, `(intermediate value).name is not a function`, ()=>(new Human()).name())
    })();
    ;(function(){
        // こんなコードは書くべきでない。そもそも書けてしまう状態が困る。構文解析の時点で例外を出して欲しい。
        class Human {
            constructor(name) { this._name = name }
            get name() { return 'getter' } // 上書きされて参照できない！
            name() { return 'method' }     // 同名なら後に宣言したほうが有効
        }
        console.assert((new Human()).name()==='method')
        console.log((new Human()).name)
    })();
    ;(function(){
        class Human { // ゲッターのみ
            constructor(name) { this._name = name }
            get name( ) { return this._name }
        }
//        bb.test(Human, (r)=>r===undefind) // 可変長引数のとき最後の要素はinoutsであるべきです。
//        bb.test(Human, [['山田', (r)=>r==='山田']]) // 真であるべき所で例外発生しました。
//        bb.test(new Human('山田'), (r)=>r==='山田') // 可変長引数のとき最後の要素はinoutsであるべきです。
//        bb.test(new Human('山田'), [['鈴木', (r)=>r==='鈴木']]) // 真であるべき所で例外発生しました。
//        bb.test(Human, 'name', [['山田', (r)=>r==='山田']]) // 可変長引数のとき最後の要素はinoutsであるべきです。
//        bb.test(new Human('山田'), 'name', [['鈴木', (r)=>r==='鈴木']]) // 可変長引数のとき最後の要素はinoutsであるべきです。
//        bb.test(Human, [[[], (r)=>r===undefined]]) // 可変長引数のとき最後の要素はinoutsであるべきです。

        // コンストラクタ
        bb.test(Human, [[[], (t)=>t.name===undefined]])
        bb.test(Human, [[['山田'], (t)=>t.name==='山田']])
        bb.test(Human, [
            [['山田'], (t)=>t.name==='山田'],
            [['鈴木'], (t)=>t.name==='鈴木'],
        ])
        bb.test(new Human('山田'), [[[], (t)=>t.name===undefined]])
        bb.test(new Human('山田'), [[[''], (t)=>t.name==='']])
        bb.test(new Human('山田'), [[['鈴木'], (t)=>t.name==='鈴木']])
        // ゲッター
        bb.test(Human, 'name', [(r)=>r===undefined])
        bb.test(new Human('山田'), 'name', [(r)=>r==='山田'])
        // セッター？コンストラクタ？
        bb.test(Human, 'name', [[[], (r)=>r===undefined]])

        // 単発テスト
        bb.test(Human, (t)=>t.name===undefined)
        bb.test(Human, new Error('msg'))
        bb.test(Human, Error, 'msg')
        bb.test(Human, 'name', (r)=>r===undefined)
        bb.test(Human, 'name', ['山田'], (r)=>r==='山田')
        bb.test(Human, 'name', new Error('msg'))
        bb.test(Human, 'name', Error, 'msg')
        bb.test(new Human('山田'), (t)=>t.name==='山田')
        bb.test(new Human('山田'), new Error('msg'))
        bb.test(new Human('山田'), Error, 'msg')
        bb.test(new Human('山田'), 'name', (r)=>r==='山田')
        bb.test(new Human('山田'), 'name', ['鈴木'], (r)=>r==='鈴木')
        bb.test(new Human('山田'), 'name', new Error('msg'))
        bb.test(new Human('山田'), 'name', Error, 'msg')
    })();
    ;(function(){
        class Human { // セッターのみ
            constructor(name) { this._name = name }
            set name(v) { this._name = v }
        }
    })();
    ;(function(){
        class Human { // ゲッター・セッター両方ある
            constructor(name) { this._name = name }
            get name( ) { return this._name }
            set name(v) { this._name = v }
        }
    })();
    class Human {
        constructor(name) { this._name = name }
        say(msg) { return `${this.name}は「${msg}」と言った。` }
        get name( ) { return this._name }
        set name(v) { this._name = v }
        isAge(age) { return Number.isInteger(age) && 0<=age && age<=100 }
        async isAgeAsync(age) { return new Promise((resolve, reject)=>{
            //if (Number.isInteger(age) && 0<=age && age<=100) {resolve(age)}
            if (Number.isInteger(age) && 0<=age && age<=100) {resolve(true)}
            else{reject(new TypeError(`第一引数ageは年齢を表す0以上100以下の整数値であるべきです。`))}
        }) }
    }

    // 配列
    bb.test(Human, [[[], (t)=>t.name===undefined]])
    bb.test(Human, [[['山田'], (t)=>t.name==='山田']])
    bb.test(new Human(), [[[], (t)=>t.name===undefined]])
    bb.test(new Human('山田'), [[[], (t)=>t.name===undefined]])
    bb.test(new Human('山田'), [[['鈴木'], (t)=>t.name==='鈴木']])

    // オブジェクト


    bb.test({ // method がないときはコンストラクタのテストになる
        class: Human,
        inouts:[
            [['山田'],   (r)=>r.name==='山田'],
            [['鈴木'],   (r)=>r.name==='鈴木'],
        ],
    })
    window.Human = Human
    bb.test({ 
        class: 'Human', // クラスがグローバル変数なら文字列でも指定できる
        inouts:[
            [['山田'],   (r)=>r.name==='山田'],
            [['鈴木'],   (r)=>r.name==='鈴木'],
        ],
    })
    delete window.Human
    */





    /*
    // inouts の引数は constructor か method/setter のいずれかのみ。両方の引数をinoutsで指定することはできない。
    bb.test({ // メソッド
        class: Human,  // constructor  テスト対象がconstructor & method/setter のとき inouts の引数渡す先が特定できず例外発生する
        method: 'say', // method
        inouts:[
            [[], (r)=>{console.log(r); return r==='undefinedは「undefined」と言った。'}],
            [['山田'], (r)=>{console.log(r); return r==='山田は「undefined」と言った。'}],
        ],
    })
    */

    /*
    bb.test({ // メソッド
        class: new Human('山田'),
        method: 'say', // method
        inouts:[
            [[], (r)=>{console.log(r); return r==='山田は「undefined」と言った。'}],
            [['やあ'], (r)=>{console.log(r); return r==='山田は「やあ」と言った。'}],
        ],
    })
    bb.test({ // ゲッター（コンストラクタ引数）セッターが未定義なら例外発生する（引数渡し先不明）
        class: Human,
        method: 'name', // getter
        inouts:[
            [['山田'], (r)=>{console.log(r); return r==='山田'}],
            [['鈴木'], (r)=>{console.log(r); return r==='鈴木'}],
        ],
    })
    */




    /*
    bb.test({ // ゲッター（引数なし。セッターとして解釈されてしまう）
        class: new Human('山田'),
        method: 'name', // getter
        inouts:[
            [[], (r)=>{console.log(r); return r==='山田'}],
            [[], (r)=>{console.log(r); return r==='山田'}],
        ],
    })
    */


    /*
    bb.test({ // ゲッター（引数なし。省略形）
        class: new Human('山田'),
        method: 'name', // getter
        inouts:[
            (r)=>{console.log(r); return r==='山田'},
            (r)=>{console.log(r); return r==='山田'},
        ],
    })

    bb.test({ // セッター（コンストラクタ引数は不可能。ゲッターと判断される）
        class: new Human('山田'),
        method: 'name', // setter
        inouts:[
            ['太郎', (t)=>{console.log(t); return t.name==='太郎'}],
            ['鈴木', (t)=>{console.log(t); return t.name==='鈴木'}],
        ],
    })
    */
    /*
    */

    /*
    bb.assertion.t(()=>{const N='山田'; const h=new Human(N); return h.name===N;})


    bb.test({
        class: Human,
        method: 'isAge',
        inouts:[
            [[0],   (r)=> r],
            [[100], (r)=> r],
            [[-1],  (r)=>!r],
            [[101], (r)=>!r],
        ],
    })
    bb.test({
        class: Human,
        method: 'isAge',
        assert: 't',      // Assertion.t() を使う（デフォルト。省略時はこれになる）
        inouts:[
            [[0],   (r)=> r],
            [[100], (r)=> r],
            [[-1],  (r)=>!r],
            [[101], (r)=>!r],
        ],
    })
    bb.test({
        class: Human,
        method: 'isAge',
        assert: 'f',      // Assertion.f() を使う
        inouts:[
            [[0],   (r)=>!r],
            [[100], (r)=>!r],
            [[-1],  (r)=> r],
            [[101], (r)=> r],
        ],
    })
    bb.test({
        class: Human,
        method: 'isAgeAsync',
        assert: 'e',      // Assertion.f() を使う
        inouts:[
            [[-1],  [TypeError, `第一引数ageは年齢を表す0以上100以下の整数値であるべきです。`]],
            [[101], [TypeError, `第一引数ageは年齢を表す0以上100以下の整数値であるべきです。`]],
        ],
    })
    bb.test({
        class: Human,
        method: 'isAgeAsync',
        inouts:[
            [[0], (r)=>r],
            [[100], (r)=>r],
        ],
    })
    // 以下、エラー表示確認

    // テスト例外。真であるべき所で例外発生しました。TestTargetError: 例外を投げます。
    bb.test({
        class: TestTarget,
        method: 'throwError',
        inouts:[
            [[],   (r)=>r],
        ],
    })
    // テスト失敗。真であるべき所が偽です。
    bb.test({
        class: TestTarget,
        method: 'getTrue',
        inouts:[
            [[],   (r)=>!r],
        ],
    })
    // テスト失敗。偽であるべき所が真です。
    bb.test({
        class: TestTarget,
        method: 'getTrue',
        assert: 'f',
        inouts:[
            [[],   (r)=> r],
        ],
    })
    */













    /*
    bb.test({
        class: [Human, ['山田']], // classとその第二要素を配列にすれば new Human(...['山田']) となる
        inouts:[
            [['山田'],   (r)=>r.name==='山田'],
        ],
    })
    */
    /*
    bb.test({
        class: Human,
        method: 'isAge',
        inouts:[
            [[0],   (r)=> r],
            [[100], (r)=> r],
            [[-1],  (r)=>!r],
            [[101], (r)=>!r],
        ],
    })
    */
    /*
    bb.test({
        class: [Human, ['山田']],
        method: 'isAge',
        inouts:[
            [[0],   (r)=> r],
            [[100], (r)=> r],
            [[-1],  (r)=>!r],
            [[101], (r)=>!r],
        ],
    })
    bb.test({
        class: [Human, ['山田']],
        method: 'isAge',
        assert: 't',
        inouts:[
            [[0],   (r)=> r],
            [[100], (r)=> r],
            [[-1],  (r)=>!r],
            [[101], (r)=>!r],
        ],
    })
    */

    /*
    bb.test({
        class: [Human, ['山田']],
        method: ['isAge', [33]],
        assert: 't',
        inouts:[
            [[], (r)=>r.name==='山田'],
            [[], (r)=>r],
        ],
    })
    */

    /*
    bb.test({
        class: TestTarget,
        method: 'getFalse',
        assert: 'f',
        inouts:[
            [[], (r)=>r],
        ],
    })

    bb.test({
        class: TestTarget,
        method: 'getTrue',
        assert: 't',
        inouts:[
            [[], (r)=>r===true],
            [[], (r)=>r===false],
        ],
    })
    bb.test({
        class: {
            name: TestTarget,
            args: [],
        },
        method: 'getTrue',
        assert: 't',
        inouts:[
            [[], (r)=>r===true],
            [[], (r)=>r===false],
        ],
    })
    bb.test({
        class: {
            name: TestTarget,
            args: [],
        },
        method: 'throwError',
        assert: 'e',
        inouts:[
            [[], [Error, '']],
            [[], [Error, '']],
        ],
    })
    */

    /*
    bb.test({
        setup:()=>new TestTarget(),
        tearDown:(t)=>{console.log(t)},
        assert: 't',
        isAsync: false,
        inouts:[
            [[], (r)=>r===true],
            [[], (r)=>r===false],
        ],
    })

    bb.testT({
        setup:()=>new TestTarget(),
        tearDown:(t)=>{console.log(t)},
        inouts:[
            [[], (r)=>r===true],
            [[], (r)=>r===false],
        ],
    })
    const bb = new BlackBox(a)
    bb.testTA({
        setup:()=>new TestTarget(),
        tearDown:(t)=>{console.log(t)},
        inouts:[
            [[], (r)=>r===true],
            [[], (r)=>r===false],
        ],
    })
    */

    a.fin()
    /*
//    const A = Assert.of()
//    const a = Assertion.of()
    const [A, a] = Assert.of()
    A.test(
        a.t(true),
        a.t(false),
        a.t(()=>true),
        a.t(()=>false),
        a.t(()=>{throw new Error}),
        a.f(true),
        a.f(false),
        a.f(()=>true),
        a.f(()=>false),
        a.f(()=>{throw new Error}),
        a.e(Error,'',()=>{throw new Error}),
        a.e(Error,'',()=>{throw new Error('')}),
        a.e(Error,'A',()=>{throw new Error('A')}),
        a.e(TypeError,'',()=>{throw new Error}),
        a.e(Error,'',()=>{throw new TypeError}),
        a.e(TypeError,'',()=>{throw new TypeError}),
        a.e(TypeError,'A',()=>{throw new TypeError('A')}),
        a.e(TypeError,'A',()=>{throw new TypeError('B')}),
        a.e(TypeError,'B',()=>{throw new TypeError('A')}),
        a.e(Error,'A',()=>{throw new TypeError('B')}),
    )
    A.test({
        label:'asyncテスト',
        setup:()=>{a:'A'},
        tearDown:(target)=>console.log(target),
    },
        a.t(true),
        a.t(false),
        await a.tA(async()=>true),
        await a.tA(async()=>false),
        await a.tA(async()=>{throw new Error}),
        await a.tA(async(t)=>'A'===t.a),
        await a.tA(async(t)=>'B'===t.a),
        await a.tA(async(t)=>{throw new Error}),
        a.f(true),
        a.f(false),
        await a.fA(async()=>true),
        await a.fA(async()=>false),
        await a.fA(async(t)=>'A'===t.a),
        await a.fA(async(t)=>'B'===t.a),
        await a.fA(async()=>{throw new Error}),
        await a.eA(Error,'',async()=>{throw new Error}),
        await a.eA(Error,'',async()=>{throw new Error('')}),
        await a.eA(Error,'A',async()=>{throw new Error('A')}),
        await a.eA(TypeError,'',async()=>{throw new Error}),
        await a.eA(Error,'',async()=>{throw new TypeError}),
        await a.eA(TypeError,'',async()=>{throw new TypeError}),
        await a.eA(TypeError,'A',async()=>{throw new TypeError('A')}),
        await a.eA(TypeError,'A',async()=>{throw new TypeError('B')}),
        await a.eA(TypeError,'B',async()=>{throw new TypeError('A')}),
        await a.eA(Error,'A',async()=>{throw new TypeError('B')}),
        await a.eA(Error,'A',async(t)=>{'A'===t.a; throw new TypeError('B');}),
    )
    class C {}
    class D {}
    class C2 extends C {}
    A.test(
        a.t(new C instanceof C),
        a.f(new C instanceof D),
        a.f(new C instanceof C2),
    )
    A.fin()
    */
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

