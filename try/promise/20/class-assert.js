class ClassAssert {
    constructor(options) {

    }
    static of(options) { return new ClassAssert(options) }
    static test(options, cases) {

    }
}
class Case {
    constructor(options) {
        this._options = {label:`{{class}}.{{method}}({{params}})->{{return}}`, new:()=>null, del:(t)=>{}, method:null, inouts:[]}
        if (options) { this._options = {...options} }
        this._results = []
    }
    static of(options) { return new ClassAssert(options) }
    new (fn) { this._options.new = fn; return this; }
    del (fn) { this._options.del = fn; return this; }
    method(nm) { this._options.method = nm; return this; }
    inout(params, fn) {
        this._options.inouts.push([params, fn])
        return this;
    }
    inouts(ios) { for (let io of ios) { this.inout(...io) } return this; }
    test() {
        const target = this._options.new()
        for (let io of this._options.inouts) {
            const [params, isSuccess] = io
            const res = target[this._options.method](params)
            isSuccess(res)
        }
        this._options.del(target)
    }
    _runIsSuccess(res) {
        
    }
    _runIsSuccessAsync(res) {

    }
}
