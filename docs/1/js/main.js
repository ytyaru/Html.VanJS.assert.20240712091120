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
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

