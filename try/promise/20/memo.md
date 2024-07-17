```javascript
Assertion.test({
    label:`{{class}}.{{method}}({{params}})->{{return}}`
    setup:()=>new TestTarget(),
    tearDown:(t)=>t.close(),
    method:'someMethod', // methodがないときはコンストラクタのテストとする
    assert:Assertion.t/f/e, // ないときは`(戻り値)=>{ここで自由に実行する}`
    inouts:[
        [[引数,...], (戻り値)=>assertに渡す値],
        [[引数,...], (戻り値)=>assertに渡す値],
        [[引数,...], async(戻り値)=>await assertに渡す値],
        ...
    ],
})
```


```javascript
const targetBase = TestTarget.of({class:{name:'TestTarget'}})
a.test(
    targetBase.clone()
    .addClassArgs([
        [[引数,...], (戻り値)=>テスト成功となる条件式],
        [[引数,...], (戻り値)=>テスト成功となる条件式],
        [[引数,...], (戻り値)=>テスト成功となる条件式],
    ])
)

a.test(
    targetBase.clone()
    .addClassArg([[]])
target.addClassArgs([
    [[引数,...], (戻り値)=>テスト成功となる条件式],
    [[引数,...], (戻り値)=>テスト成功となる条件式],
    [[引数,...], (戻り値)=>テスト成功となる条件式],
])
```
```javascript
TestTarget({
    class: {
        name: 'TestTarget',
        args: [
            [[引数,...], (戻り値)=>テスト成功となる条件式],
            [[引数,...], (戻り値)=>テスト成功となる条件式],
            [[引数,...], (戻り値)=>テスト成功となる条件式],
        ],
    },
})
```


```javascript
TestTarget({
    class: {
        name: 'TestTarget',
        args: ['A', 2],
    },
    method: {
        name 'someMethod',
        args: [
            [[引数,...], (戻り値)=>テスト成功となる条件式],
            [[引数,...], (戻り値)=>テスト成功となる条件式],
            [[引数,...], (戻り値)=>テスト成功となる条件式],
        ],
    }
})
```

```javascript
TestCase({
    label: ``,
    setup:()=>new TestTarget(),
    tearDown:(t)=>t.close(),
    code:(t)=>{
        a.t(0===t.someMethod())
    }
})
```
```javascript
TestCase.of({
    label: ``,
    setup:()=>new TestTarget(),
    tearDown:(t)=>t.close(),
    assert:Assertion.t/f/e,
    method:'someMethod',
    inouts:[
        [[引数,...], (戻り値)=>assertに渡す値],
        [[引数,...], (戻り値)=>assertに渡す値],
        [[引数,...], (戻り値)=>assertに渡す値],
        ...
    ]
}).test()
```
```javascript
Assertion.test({
    label:`{{class}}.{{method}}({{params}})->{{return}}`
    setup:()=>new TestTarget(),
    tearDown:(t)=>t.close(),
    method:'someMethod', // methodがないときはコンストラクタのテストとする
    assert:Assertion.t/f/e,
    inouts:[
        [[引数,...], (戻り値)=>assertに渡す値],
        [[引数,...], (戻り値)=>assertに渡す値],
        [[引数,...], async(戻り値)=>await assertに渡す値],
        ...
    ],
})
```

```javascript
ClassAssert.tests({
    label:`{{class}}.{{method}}({{params}})->{{return}}`
    new:()=>new TestTarget(),
    del:(t)=>t.close()
    method:'getTrue',
    inouts: [
        [[引数,...], (戻り値)=>テスト成功となる条件式],
        [[引数,...], (戻り値)=>テスト成功となる条件式],
        [[引数,...], (戻り値)=>テスト成功となる条件式],
        ...
    ]
})

ClassAssertTestCase('ラベル・メモ')
.new(()=>new TestTarget())
.del((t)=>t.close())
.method('getTrue')
.inout([引数,...], (戻り値)=>テスト成功となる条件式)
.inout([引数,...], (戻り値)=>テスト成功となる条件式)
.inout([引数,...], (戻り値)=>テスト成功となる条件式)
.inout([引数,...], (戻り値)=>テスト成功となる条件式)
.inout([引数,...], (戻り値)=>テスト成功となる条件式)
.inout([引数,...], (戻り値)=>テスト成功となる条件式)
ClassAssert.run()
```

ClassAssert.test({
        new:()=>new TestTarget(),
        del:(t)=>t.close(),
        method:'getTrue',
    },
    Case.of('ラベル')
    .new(()=>new TestTarget())
    .del((t)=>t.close())
    .has('method1,method2,method3',split(','))
    ,
    Case.of('ラベル')
    .new(()=>new TestTarget())
    .del((t)=>t.close())
    .method('getTrue')
    .inout([引数,...], (戻り値)=>テスト成功となる条件式)
    .inout([引数,...], (戻り値)=>テスト成功となる条件式)
    .inout([引数,...], (戻り値)=>テスト成功となる条件式)
    ,
    Case.of('ラベル')
    .new(()=>new TestTarget())
    .del((t)=>t.close())
    .method('getTrue')
    .inout([引数,...], (戻り値)=>テスト成功となる条件式)
    .inout([引数,...], (戻り値)=>テスト成功となる条件式)
    .inout([引数,...], (戻り値)=>テスト成功となる条件式)
    ,
    Case.of({
        label:'ラベル',
        new:()=>new TestTarget(),
        del:(t)=>t.close(),
        method:'getTrue',
        .inout([引数,...], (戻り値)=>テスト成功となる条件式)
        .inout([引数,...], (戻り値)=>テスト成功となる条件式)
        .inout([引数,...], (戻り値)=>テスト成功となる条件式)
        .inouts([
            [[引数,...], (戻り値)=>テスト成功となる条件式],
            [[引数,...], (戻り値)=>テスト成功となる条件式],
            [[引数,...], (戻り値)=>テスト成功となる条件式],
        ])
        .inouts((()=>[
            [[引数,...], (戻り値)=>テスト成功となる条件式],
            [[引数,...], (戻り値)=>テスト成功となる条件式],
            [[引数,...], (戻り値)=>テスト成功となる条件式],
        ])())
    }),
    new Case({
        label:'ラベル',
        new:()=>new TestTarget(),
        del:(t)=>t.close(),
        method:'getTrue',
        .inout([引数,...], (戻り値)=>テスト成功となる条件式)
    }),
)
