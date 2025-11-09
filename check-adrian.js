#!/usr/bin/env node

const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function checkAdrian() {
  const users = await client.query("demo:listAllUsers", {});
  const adrian = users.find(u => u.email === "aportelli@derrimut.com.au");
  
  console.log("Adrian Portelli Current State:");
  console.log(JSON.stringify(adrian, null, 2));
}

checkAdrian();
