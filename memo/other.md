# メソッド・オーバーロード

　JavaScriptにはメソッドのオーバーロードがない。これを実装したい。

　メソッドのオーバーロードとは、名前は同一だが引数や戻り値の数や型が違う別の関数として定義できる機能である。その長所は同じ名前でも引数パターンによって別々の実装として書ける。型によって処理を分岐させられ、同じ意図の処理を別の型で実現できる。

```javascript
function someFn(int arg) { ... }
function someFn(string arg) { ... }
...
```

　JavaScriptでメソッドのオーバーロードをするには、可変長引数として受け取り、その内容によって分岐させねばならない。この方法は可読性が著しく下がる。

```javascript
function someFn(...args) {
    if (0===args.length && 'integer'===typeof args[0]) { return someFnInt(...args) }
    if (0===args.length && 'string'===typeof args[0]) { return someFnStr(...args) }
    ...
}
```

　引数パターンで分岐させると以下。

```javascript
function someFn(...args) {
  Arguments.match(args, [
    { conds: {
        0:(v)=>Type.isIns(v),
        1:(v)=>Type.isAry(v),
      }, method: (args)=>{},
    }, { conds: {
        0:(v)=>Type.isCls(v),
        1:(v)=>Type.isAry(v),
        2:(v)=>Type.isStr(v) || Type.isRegExp(v)
      }, method: (args)=>{},
    },
  ])
}
```


```javascript
function someFn(...args) {
    Arguments.set(...args)
    Arguments.run(()=>someFnInt(), {
        0:(v)=>Type.isIns(v),
    })
    Arguments.run(()=>someFnStr(), {
        0:(v)=>Type.isStr(v),
    })
    Arguments.run(()=>someFnDefault())
}
```

```javascript
function someFn(...args) {
  Arguments.match(args, [
    [()=>someFnInt(...args), [(v)=>Type.isInt(v), 第二引数の合否判定式, 第三..., ...]],
    [()=>someFnStr(...args), [(v)=>Type.isStr(v), 第二引数の合否判定式, 第三..., ...]],
    ()=>someFnDefault(),
  ])
}
```

　これはMatch式に似ている。条件式が可変長引数に合わせて配列にしてある所以外、Match式と同じ。なのでまずはMatch式を先に作りたい。そのまえにvalk.some()、その前にGenerics（List<int>）、その前にType、その前に Assertion, BlackBox.test を作りたい。

　ついでに`finally`式もほしい。例外発生しても必ず最後に実行してほしい処理を設定できる奴。

```javascript
finally(対象関数()=>{}, 実行関数()=>{})
```
```javascript
try { 対象関数() } 
catch (e) { throw e }
finally() { 実行関数() }
```

　if, switch, for, while, try/catch/finally文はインデントする。これを式に置き換えて一行で書けるようにしたい。

```javascript
ifs(()=>bool, ()=>return 'some', ...)
ifel((()=>bool, ()=>return 'some', ..., ()=>return 'default')
match(v, {
  v: ()=>{},
})
match(v, [
  ()=>bool, ()=>return 'some',
  ...,
  ()=>return 'default'
])
valk.match(v, valk.some.whilteList, {
  valk.some.whilteList.A: ()=>{},
  ...
  valk.some.whilteList.Z: ()=>{},
})
valk.match(valk.some(), {
  valk.some.whilteList.A: ()=>{},
  ...
  valk.some.whilteList.Z: ()=>{},
})
valk.some().match({
  this.whilteList.A: ()=>{},
  ...
  this.whilteList.Z: ()=>{},
})
```

