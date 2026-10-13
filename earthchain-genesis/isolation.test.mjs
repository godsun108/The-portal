import test from "node:test";
import assert from "node:assert/strict";
import {authorize} from "./permissions.mjs";
const alice={id:"account-alice",authenticated:true};
const bob={id:"account-bob",authenticated:true};
const privatePost={id:"alice-post",ownerId:alice.id,visibility:"private"};
const membersPost={id:"alice-members",ownerId:alice.id,visibility:"members"};
const chat={id:"alice-chat",ownerId:alice.id,visibility:"private"};
test("two-account isolation: creator can read their private post",()=>{
 assert.equal(authorize({actor:alice,resource:privatePost,action:"content:read"}).allowed,true);
});
test("two-account isolation: second account cannot read creator private post",()=>{
 assert.equal(authorize({actor:bob,resource:privatePost,action:"content:read"}).allowed,false);
});
test("two-account isolation: second account cannot edit or delete creator post",()=>{
 for(const action of ["content:edit","content:delete"])assert.equal(authorize({actor:bob,resource:privatePost,action}).allowed,false);
});
test("two-account isolation: member content is private without verified grant",()=>{
 assert.equal(authorize({actor:bob,resource:membersPost,action:"content:read"}).allowed,false);
});
test("two-account isolation: verified active membership grant enables only reading",()=>{
 const grants=[{actorId:bob.id,resourceId:membersPost.id,action:"content:read",active:true}];
 assert.equal(authorize({actor:bob,resource:membersPost,action:"content:read",grants}).allowed,true);
 assert.equal(authorize({actor:bob,resource:membersPost,action:"content:edit",grants}).allowed,false);
 assert.equal(authorize({actor:bob,resource:privatePost,action:"content:read",grants}).allowed,false);
});
test("two-account isolation: revoked membership denies reading",()=>{
 const grants=[{actorId:bob.id,resourceId:membersPost.id,action:"content:read",active:false}];
 assert.equal(authorize({actor:bob,resource:membersPost,action:"content:read",grants}).allowed,false);
});
test("two-account isolation: private chat requires a chat-specific grant",()=>{
 const grants=[{actorId:bob.id,resourceId:chat.id,action:"chat:send",active:true}];
 assert.equal(authorize({actor:bob,resource:chat,action:"chat:send",grants}).allowed,true);
 assert.equal(authorize({actor:bob,resource:chat,action:"chat:read",grants}).allowed,false);
});
test("two-account isolation: public read does not grant broadcast or billing",()=>{
 const publicPost={...privatePost,visibility:"public"};
 assert.equal(authorize({actor:bob,resource:publicPost,action:"content:read"}).allowed,true);
 for(const action of ["stream:start","billing:manage"])assert.equal(authorize({actor:bob,resource:publicPost,action}).allowed,false);
});
