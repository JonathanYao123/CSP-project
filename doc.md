# API Documentation for GQL apollo server #
https://gqlserver-csp.herokuapp.com\

curl examples were formatted for windows OS

## Queries ##

### __maps__: ### 
a query thats returns a list of all the Map Objects currently saved in the database

Request: GET https://gqlserver-csp.herokuapp.com

content-type: JSON

body: { maps { name url } }

Response: 200
```
{ 
    "data": { 
        "maps": [ 
            { 
                "name": "Icebox", 
                "url": "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt727aeefa1875f8ce/5fc9954afd99385ff600b0f6/Icebox_1a.jpg" 
            }, 
            { 
                "name": "Haven",
                "url": "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltedb5d57941e4f3f5/5ecd64c14d187c101f3f2484/ haven-minimap-2.png" 
            }, 
            { 
                "name": "Bind",
                "url": "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltad4274632c983531/5ecd64d04d187c101f3f2486/bind-minimap-2.png" 
            } 
        ] 
    }
}
```

Example: `curl "https://gqlserver-csp.herokuapp.com" -H "Content-Type:application/json" --data-binary "{\"query\":\"{\n maps {\n name\n url\n }\n}\n\"}"`


### __map__: ### 
a query thats returns a Map object currently saved in the database with given the name

Request: GET https://gqlserver-csp.herokuapp.com

content-type: JSON

body: { map( name: "Icebox" ) { name url } }

Response: 200
```
{
    "data": { 
        "map": { 
            "name": "Icebox",
            "url": "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt727aeefa1875f8ce/5fc9954afd99385ff600b0f6/Icebox_1a.jpg" 
        } 
    } 
}
```
Example: `curl "https://gqlserver-csp.herokuapp.com" -H "Content-Type:application/json" --data-binary "{\"query\":\"{\n map (name: \\""Icebox\\"") {\n name\n url\n }\n}\n\"}"`


### __projects__: ###
a query thats returns a list of all the Project Objects currently saved in the database

Request: GET https://gqlserver-csp.herokuapp.com

content-type: JSON

body: { projects { cid canvas } }

Response: 200
```
{
    "data": {

        "projects": [ 
            { 
                "cid": 0, 
                "canvas": "{}" 
            } 
        ] 
    } 
}
```
Example: `curl "https://gqlserver-csp.herokuapp.com" -H "Content-Type:application/json" --data-binary "{\"query\":\"{\n projects {\n cid\n canvas\n }\n}\n\"}"`


### __project__: ### 
a query thats returns a Project object currently saved in the database with given the cid

Request: GET https://gqlserver-csp.herokuapp.com

content-type: JSON

body: { project( cid: 0 ) { cid canvas } }

Response: 200
```
{ 
    "data": { 
        "project": { 
            "cid": 0, 
            "canvas": "{}" 
        } 
    } 
}
```
Example: `curl "https://gqlserver-csp.herokuapp.com" -H "Content-Type:application/json" --data-binary "{\"query\":\"{\n project (cid: 2) {\n cid\n canvas\n }\n}\n\"}"`


## Mutations ##

### __saveProject__: ### 
a mutation thats inserts a Project object into the database

Request: POST https://gqlserver-csp.herokuapp.com

content-type: JSON

body: { saveProject( cid: 2, author: "123", canvas:"{}" ) { cid author canvas } }

Response: 200
```
{ 
    "data": { 
        "saveProject": { 
            "cid": 2, 
            "author": "123",
            "canvas": "{}" 
        } 
    } 
}
```


### __updateProject__: ### 
a mutation thats updates a Project object currently saved in the database with given the cid

Request: POST https://gqlserver-csp.herokuapp.com

content-type: JSON

body: { project( cid: 2, canvas:"test") { cid canvas } }

Response: 200
```
{ 
    "data": {
        "updateProject": null 
    } 
}
```