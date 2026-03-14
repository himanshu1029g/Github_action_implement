
// const express = require("express");

import express from 'express'
const app  = express()

const PORT = process.env.PORT ?? 8080

app.get("/", (req,res)=>{

    return res.json({msg : "Hello from the server and try 3 "})
})



app.listen(PORT, ()=>{
    console.log(`Server is running on  PORT : ${PORT}`)
})

