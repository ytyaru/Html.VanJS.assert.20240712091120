window.addEventListener('DOMContentLoaded', (event) => {
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
        a.t(()=>true),
        a.t(()=>false),
        a.t(()=>{throw new Error}),
        a.t((t)=>'A'===t.a),
        a.t((t)=>'B'===t.a),
        a.t((t)=>{throw new Error}),
        a.f(true),
        a.f(false),
        a.f(()=>true),
        a.f(()=>false),
        a.f((t)=>'A'===t.a),
        a.f((t)=>'B'===t.a),
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
        a.e(Error,'A',(t)=>{'A'===t.a; throw new TypeError('B');}),
    )
    A.fin()
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

