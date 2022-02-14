# Near-EAC

## Requirements
- node v16.14.0
- postgres 12

create DB with name ```near_eac``` and user/password ```postgres/postgres```

## Run commands
### Install dependencies
```npm install```

### Backend setup
Copy .env.example file to .env and replace the appropriate fields

```sh
cp .env.example .env 
```

### Run in prod mode
```
npm run build
npm run start:prod
```

### Run in dev mode
```npm run start:debug```

#### API will be available on port 3030