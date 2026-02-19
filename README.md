# D&D 2024 Spellbook
D&D 2024 Spellbook is an interactive spellbook made to make both spell and spell slot management easier for players. New players can enjoy a centralized space to organize what spells they know and take out the fuss of managing their spell slots by hand while more experienced players can utilize the freedom to customize their book with any spells of their choice they learn through different means and enable them to take their turns faster.
![spellbook](https://github.com/user-attachments/assets/4a0c85f0-2378-4800-a744-ad1917294ba8)

## Motivation

I have run D&D campaigns for my friends for years, and I've found managing spells to be one of the most difficult parts for both new and experienced players.  Traditional pen and paper methods run into the issue of ending up as long lists where you either have to remember where everything is put and organize as you add spells which can become a problem later on if you want to change the organization, or you have to take the time to manually look through each and every spell.  The ability to see what slots you have available at any time and then get a list of what spells you can cast at that level can dramatically decrease time spent searching.  I have also found that it is difficult for players to remember the small intricacies of their spells and so by having the descriptions readily available it makes answering questions about what they need or want to do with their spells becomes much easier.

## Quick Start

This project is in development for being hosted, but in the meantime if you want to see how it works you can clone the repo here.
```bash
git clone https://github.com/kblasti/spellbook
cd spellbook
```

**Docker is required for the server and database to run locally, after setting up the .env file the docker-compose should handle the images and containers**

# 4 environment variables are required:
  POSTGRES_DBURL which will be used by docker-compose for lining up the database, migrations, seed, and server  
  DB_PASSWORD which is the password you choose to use for your database  
  PLATFORM which is one secret string variable of your choice  
  SECRET which is a randomly generated key  

Start the database and server using docker-compose  
```bash
docker-compose up --build
```

Start the webapp from it's directory with npm start and you're good to go!
```bash
npm start
```

## Usage

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

If you don't plan to use the api independtly all functionality needed for a user is readily available through the webapp.

## Contributing

### Clone the repo

Just like for the quick start you can clone the repo to take a look and develop any adjustments you would see fit  
```bash
git clone https://github.com/kblasti/spellbook
cd spellbook
```

### Build and run the database and server
```bash
docker-compose up --build
```

### Start webapp server
```bash
npm start
```

### Submit a pull request

If you'd like to contribute, please fork the repository and open a pull request to the `main` branch.
