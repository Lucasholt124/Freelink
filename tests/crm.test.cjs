const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
const loaded = new Module(path.join(__dirname, '__crm.cjs'), module);
loaded.filename = path.join(__dirname, '__crm.cjs');
loaded.paths = Module._nodeModulePaths(__dirname);
loaded._compile(esbuild.buildSync({entryPoints:[path.join(root,'lib/crm.ts')],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text, loaded.filename);
const { filterCrmCustomers } = loaded.exports;
const customers = [
  { _id:'a', name:'Ágata Souza', email:'agata@example.test', phone:'(11) 98765-4321', status:'vip', createdAt:1, lastPurchase:30 },
  { _id:'b', name:'Bruno', email:'bruno@example.test', phone:'+55 (21) 98888-2222', status:'ativo', createdAt:20 },
  { _id:'c', name:'Loja 21', status:'lead', createdAt:10 },
];
test('CRM search handles accents, whitespace and email without unrelated phone matches', () => {
  assert.deepEqual(filterCrmCustomers(customers,'  AGATA  ','all','name').map(c=>c._id), ['a']);
  assert.deepEqual(filterCrmCustomers(customers,'BRUNO@','all','name').map(c=>c._id), ['b']);
  assert.deepEqual(filterCrmCustomers(customers,'Loja 21','all','name').map(c=>c._id), ['c']);
  assert.equal(filterCrmCustomers(customers,'inexistente','all','name').length,0);
});
test('CRM search accepts formatted and unformatted phone numbers, and excludes absent phones', () => {
  assert.deepEqual(filterCrmCustomers(customers,'11987654321','all','name').map(c=>c._id), ['a']);
  assert.deepEqual(filterCrmCustomers(customers,'(21) 98888-2222','all','name').map(c=>c._id), ['b']);
  assert.equal(filterCrmCustomers(customers,'() --','all','name').length,0);
});
test('CRM status filters and existing sort orders preserve original customer records', () => {
  const snapshot=JSON.stringify(customers);
  assert.deepEqual(filterCrmCustomers(customers,'','vip','name'), [customers[0]]);
  assert.deepEqual(filterCrmCustomers(customers,'','all','date').map(c=>c._id), ['b','c','a']);
  assert.deepEqual(filterCrmCustomers(customers,'','all','lastContact').map(c=>c._id), ['a','b','c']);
  assert.equal(JSON.stringify(customers),snapshot);
  assert.equal(filterCrmCustomers(customers,'agata','all','name')[0],customers[0]);
  assert.deepEqual(filterCrmCustomers([], '', 'all', 'name'), []);
});

// Execute the actual component handlers with memory-only dependencies. No Convex or browser writes.
const source=ts.createSourceFile('ProfitCalculator.tsx',fs.readFileSync(path.join(root,'components/ProfitCalculator.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function productionFunction(name, context={}) {
  let expression;
  function visit(node) {
    if(ts.isVariableDeclaration(node) && node.name.getText(source)===name) expression=node.initializer.getText(source);
    ts.forEachChild(node,visit);
  }
  visit(source);
  assert.ok(expression, `Production function ${name} exists`);
  const js=ts.transpileModule(`const fn = ${expression};`,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
  return Function(...Object.keys(context), `${js}; return fn;`)(...Object.values(context));
}
const noop=()=>{};
const base={toast:{success:noop,error:noop},confetti:noop,getBrazilDate:()=> '2026-11-13', handleApiError:noop};
test('customer creation preserves optional field payloads and rejects blank names', async()=>{
  const calls=[];
  const form={name:'Cliente fictício',email:'',phone:'11987654321',address:'',notes:'Teste',birthDate:'1990-01-01',status:'vip'};
  const context={...base,customerForm:form,addCustomer:async data=>calls.push(data),setShowAddCustomer:noop,setCustomerForm:noop};
  await productionFunction('handleAddCustomer',context)();
  assert.deepEqual(calls,[{name:form.name,email:undefined,phone:form.phone,address:undefined,notes:'Teste',birthDate:form.birthDate,status:'vip'}]);
  await productionFunction('handleAddCustomer',{...context,customerForm:{...form,name:'  '}})();
  assert.equal(calls.length,1);
});
test('editing a customer submits birthday and status using the existing backend fields',async()=>{
  const calls=[];
  await productionFunction('handleEditCustomer',{...base,editingCustomerId:'fake-customer',customerForm:{name:'Cliente fictício',email:'',phone:'11999999999',address:'',notes:'',birthDate:'1995-04-10',status:'vip'},updateCustomer:async data=>calls.push(data),setShowEditCustomer:noop,setCustomerForm:noop,setEditingCustomerId:noop})();
  assert.deepEqual(calls,[{id:'fake-customer',name:'Cliente fictício',email:undefined,phone:'11999999999',address:undefined,notes:undefined,birthDate:'1995-04-10',status:'vip'}]);
});
test('sale registration retains product, customer, quantity, discount and payment state',async()=>{
  const calls=[], reports=[];
  const product={_id:'fake-product',stock:8};
  const form={productId:product._id,customerId:'fake-customer',quantity:'2',discount:'5.50',date:'2026-11-12',paymentMethod:'pix',paymentStatus:'pending',notes:'Teste'};
  await productionFunction('handleAddSale',{...base,products:[product],saleForm:form,validateSale:productionFunction('validateSale',base),addSale:async data=>calls.push(data),generateReport:async data=>reports.push(data),setIsSubmittingSale:noop,setShowAddSale:noop,setSaleForm:noop})();
  assert.deepEqual(calls,[{productId:product._id,customerId:'fake-customer',quantity:2,discount:5.5,date:form.date,paymentMethod:'pix',paymentStatus:'pending',notes:'Teste'}]);
  assert.deepEqual(reports,[{month:'2026-11'}]);
});
test('stock and missing-product checks prevent invalid sales before mutation', async()=>{
  let writes=0;
  const product={_id:'fake-product',stock:1};
  const form={productId:product._id,quantity:'3',date:'2026-11-12'};
  const context={...base,products:[product],saleForm:form,validateSale:productionFunction('validateSale',base),addSale:async()=>writes++};
  await productionFunction('handleAddSale',context)();
  await productionFunction('handleAddSale',{...context,products:[]})();
  assert.equal(writes,0);
});
test('quick sales preserve online and offline payloads, and reject invalid prices',async()=>{
  const online=[],offline=[];
  const form={costPrice:'50',salePrice:'80',date:'2026-11-12',description:'Teste fictício',paymentMethod:'pix'};
  const context={...base,quickSaleForm:form,navigator:{onLine:true},formatCurrency:n=>`R$ ${n}`,setIsSubmittingQuickSale:noop,addQuickSale:async data=>online.push(data),setShowQuickSale:noop,resetQuickSaleForm:noop,getPaymentMethodLabel:x=>x,checkPendingData:async()=>{},offlineManager:{saveSaleOffline:async data=>offline.push(data)}};
  await productionFunction('handleQuickSale',context)();
  await productionFunction('handleQuickSale',{...context,navigator:{onLine:false}})();
  assert.deepEqual(online,[{amount:80,costPrice:50,description:form.description,paymentMethod:'pix',date:form.date}]);
  assert.deepEqual(offline,[{salePrice:80,costPrice:50,description:form.description,paymentMethod:'pix',date:form.date}]);
  for(const salePrice of ['0','49','abc']) await productionFunction('handleQuickSale',{...context,quickSaleForm:{...form,salePrice}})();
  assert.equal(online.length,1);
});
test('expense registration preserves amount, type, payment and report month',async()=>{
  const calls=[],reports=[];
  const form={description:'Gasto fictício',amount:'123.45',categoryName:'Outros',type:'one_time',date:'2026-11-12',paymentMethod:'cash',paymentStatus:'pending',notes:''};
  await productionFunction('handleAddExpense',{...base,expenseForm:form,validateExpense:productionFunction('validateExpense',base),setIsSubmittingExpense:noop,addExpense:async data=>calls.push(data),generateReport:async data=>reports.push(data),setShowAddExpense:noop,setExpenseForm:noop})();
  assert.deepEqual(calls,[{description:form.description,amount:123.45,categoryName:'Outros',type:'one_time',date:form.date,paymentMethod:'cash',paymentStatus:'pending',notes:undefined}]);
  assert.deepEqual(reports,[{month:'2026-11'}]);
});
