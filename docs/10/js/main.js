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


    // 関数のテスト
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
        bb.test(Human, (r)=>r===undefind)
        bb.test(Human, [['山田', (r)=>r==='山田']])
        bb.test(new Human('山田'), (r)=>r==='山田')
        bb.test(new Human('山田'), [['鈴木', (r)=>r==='鈴木']])
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

