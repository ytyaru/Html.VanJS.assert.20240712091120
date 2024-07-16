


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
