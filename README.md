# spellbook
DnD2024 Spellbook using SRD data to allow customizable lists of spells and interactable mechanics to easier keep track of what spells are available and how many spell slots you have at any point.  Spell data is stored through Postgres and an api is built through the Golang net/http library.  Webapp is built through React.js.

Docker containers were used to hold the database, goose migrations, initialize a database seed, and start the server.

4 environment variables are required:
  POSTGRES_DBURL which will be used by docker-compose for lining up the database, migrations, seed, and server  
  DB_PASSWORD which is the password you choose to use for your database  
  PLATFORM which is one secret string variable of your choice  
  SECRET which is a randomly generated key  

The webapp handles the api endpoints for general use, but for specific api endpoints they are:
  GET /api/healthz: for checking server status  
  GET /api/index.html: basic response, necessary info for use under Creative Commons  
  POST /api/spells/update/{index}: admin only endpoint for update data in the database  
  POST /api/admin/users: used for creating admin accounts, only accessible by an admin account  
  GET /api/spells: returns list of all spells  
  GET /api/spells/{index}: returns details of spell at index, index all lowercase with hyphens instead of spaces, in cases of spells with / in the name it is the second word of the name that is the index  
  GET /api/classes/{class}: returns list of spells learnable by that class  
  GET /api/subclasses/{subclass}: returns list of spells learnable by that subclass  
  GET /api/spells/levels/{level}: returns list of spells of that level (level 0 for cantrips)  
  GET /api/spells/concentration: returns list of all spells that require concentration  
  GET /api/spells/ritual: returns list of all spells that are able to be ritual casted  
  POST /api/users: creates user with email and password as parameters  
  POST /api/login: logs in the user with email and password as parameters  
  POST /api/refresh: creates new JWT token if it expires, is based on refresh token saved to users  
  POST /api/revoke: revokes a refresh token  
  PUT /api/users: updates user info  
  POST /api/users/delete: deletes user, uses password as confirmation  
  POST /api/characters/delete: deletes character saved by the user  
  POST /api/characters: creates character tied to user  
  PUT /api/characters: updates character info  
  POST /api/characters/slots: returns amount of spell slots for given character  
  GET /api/characters: gets a list of all characters tied to userID  
  POST /api/characters/spells: adds a spell to the list of spells known by a character  
  POST /api/characters/spells/list: returns list of all spells know by the given character  
  POST /api/characters/spells/delete: removes spell from list of spells known by character  

While the api was the original focus of the project, most of it's functionality is tied into the webapp and a lot of the endpoints that don't just return spell information require a userID or JWTtoken from the client.
