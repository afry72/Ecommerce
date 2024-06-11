# E COMMERCE APPLICATION

this is the back end of a ecommerce application, with insomnia you can input different products tags and categories and modify them and delete them as needed

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)


## Introduction

this is a very straight forward application that uses sequalize and mysql. its a back end application that serves as a management and inventory system 
this application allows users to browse add update or delete products and categories in an online store 

## Installation

-step 1: fork this repository

-step 2: download and navigate to repository 

-step 4: install all dependencies

-step 5: go to the env file, remove .EXAMPLE, then put in your user and password for mysql

-step 6: boot mysql with "mysql -u root -p"

-step 7: use the command source db/schema.sql

-step 8: exit the mysql client and then run "npm run seed"

-step 9: run npm start

-step 10: input any information you need into insomnia

## Usage

if you want to add a category product or tag just navigate to the propper url and input the information you want with the propper route

for example if you want to add pants into your categories you can input 
```
{
  "category_name": "boots",
  "products": [
    {
      "product_name": "timberlands",
      "price": 599.99,
      "stock": 50
    },
    {
      "product_name": "Chips",
      "price": 1299.99,
      "stock": 30
    }
  ]
}

```


## CONTACT ME 
https://github.com/afry72