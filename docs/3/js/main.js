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

