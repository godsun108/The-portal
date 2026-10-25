/** In-memory, valueless ECTEST demonstration. NOT EARTH, money or a blockchain. */
export function newMarket(){return {wallets:new Map(),listings:new Map(),orders:new Map(),events:[]};}
function amount(n){if(!Number.isSafeInteger(n)||n<=0)throw Error("Invalid test amount");return n;}
function wallet(m,id){if(typeof id!=="string"||!id.trim())throw Error("Invalid wallet");return m.wallets.get(id)||0;}
export function balance(m,id){return wallet(m,id);}
export function acquireTestCoins(m,{buyer,credits,requestId}){
 amount(credits);
 if(m.events.some(e=>e.requestId===requestId))throw Error("Duplicate acquisition request");
 if(typeof requestId!=="string"||requestId.length<8)throw Error("Invalid request ID");
 const before=wallet(m,buyer);
 if(!Number.isSafeInteger(before+credits))throw Error("Balance overflow");
 m.wallets.set(buyer,before+credits);
 m.events.push({type:"SIMULATED_ACQUISITION",requestId,buyer,credits,simulated:true});
 return balance(m,buyer);
}
export function listCard(m,{id,seller,name,price,setCode='',condition='Near Mint'}){
 amount(price);
 if(typeof id!=="string"||!id.trim()||m.listings.has(id))throw Error("Invalid or duplicate listing");
 if(typeof name!=="string"||!name.trim())throw Error("Card name required");
 wallet(m,seller);
 if(typeof setCode!=="string"||setCode.length>80||!["Near Mint","Lightly Played","Moderately Played","Heavily Played","Damaged"].includes(condition))throw Error("Invalid card details");
 const listing={id,seller,name,price,setCode,condition,currency:"ECTEST",status:"active"};
 m.listings.set(id,listing);return {...listing};
}
export function purchaseCard(m,{listingId,buyer,orderId,approved=false}){
 if(!approved)throw Error("Buyer approval required");
 if(typeof orderId!=="string"||orderId.length<8)throw Error("Invalid order ID");
 const existing=m.orders.get(orderId);
 if(existing){if(existing.buyer!==buyer||existing.listingId!==listingId)throw Error("Order ID conflict");return {...existing};}
 const listing=m.listings.get(listingId);
 if(!listing||listing.status!=="active")throw Error("Listing unavailable");
 if(buyer===listing.seller)throw Error("Self-purchase prohibited");
 const before=wallet(m,buyer);
 if(before<listing.price)throw Error("Insufficient test credits");
 m.wallets.set(buyer,before-listing.price);
 listing.status="sold";
 const order={orderId,listingId,buyer,seller:listing.seller,amount:listing.price,status:"awaiting_shipment",simulated:true};
 m.orders.set(orderId,order);
 m.events.push({type:"TEST_ESCROW_HOLD",orderId,amount:listing.price});
 return {...order};
}
export function shipCard(m,orderId,{tracking}){
 const order=m.orders.get(orderId);
 if(!order||order.status!=="awaiting_shipment")throw Error("Not awaiting shipment");
 if(typeof tracking!=="string"||!tracking.trim())throw Error("Tracking required");
 order.status="shipped";order.tracking=tracking;
 return {...order};
}
export function releaseTestCoins(m,orderId,{approved=false}={}){
 if(!approved)throw Error("Release approval required");
 const order=m.orders.get(orderId);
 if(!order||order.status!=="shipped")throw Error("Order not eligible for release");
 const before=wallet(m,order.seller);
 if(!Number.isSafeInteger(before+order.amount))throw Error("Balance overflow");
 m.wallets.set(order.seller,before+order.amount);
 order.status="settled";
 m.events.push({type:"TEST_ESCROW_RELEASE",orderId,amount:order.amount});
 return {...order};
}

export function refundTestOrder(m,orderId,{approved=false}={}){
 if(!approved)throw Error("Refund approval required");
 const order=m.orders.get(orderId);
 if(!order||!["awaiting_shipment","shipped"].includes(order.status))throw Error("Order not refundable");
 const before=wallet(m,order.buyer);
 if(!Number.isSafeInteger(before+order.amount))throw Error("Balance overflow");
 m.wallets.set(order.buyer,before+order.amount);
 order.status="refunded";
 m.events.push({type:"TEST_REFUND",orderId,amount:order.amount});
 return {...order};
}
