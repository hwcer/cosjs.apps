"use strict";

const apps     = require('./index');

apps.start().catch(err=>{
    console.log("pool_connect",err)
})

