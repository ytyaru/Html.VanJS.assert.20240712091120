class ExtensibleCustomError extends Error{constructor(t,...e){let r;t instanceof Error?r=t:e[0]instanceof Error&&(r=e[0],e.shift()),super(t,...e),Object.defineProperty(this,"name",{configurable:!0,enumerable:!1,value:this.constructor.name,writable:!0});let s=(t,e)=>{if(!e)return t;let r=t.split("\n"),s=e.split("\n"),n=[];return r.forEach(t=>{!s.includes(t)&&n.push(t)}),[...n,...s].join("\n")},n=r?r.stack:void 0;if(Object.prototype.hasOwnProperty.call(Error,"captureStackTrace")){Error.captureStackTrace(this,this.constructor),this.stack=s(this.stack,n);return}let c=Error(t).stack.split("\n"),a=[c[0],...c.slice(3)].join("\n");this.stack=s(a,n)}}class ValueError extends ExtensibleCustomError{}class ArgumentError extends ExtensibleCustomError{}
