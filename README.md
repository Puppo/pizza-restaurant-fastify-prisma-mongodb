# Prisma with MongoDB

## Setup

```bash
ni
```

if you have a mac with the Silicon chip, you need to run the following command:

```bash
cp docker-compose.__override.yml docker-compose.override.yml
```

Then for everyone

```bash
docker-compose up -d
```

wait some seconds until the database is ready

```bash
nix prisma db push

nr dev
```

http://localhost:3000/docs
