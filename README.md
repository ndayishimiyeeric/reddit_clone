# Reddit clone

>
>Live [Here](https://feeddit.vercel.app/)

Built With:

- Next.js
- React
- Prisma
- MySQL

Key Features:

- Creating posts, voting(up or down), liking, searching...
- Creating communities.
- Nextjs Authentication
- MySQL + Prisma + PlanetScale

### Cloning the repository

```shell
git clone https://github.com/ndayishimiyeeric/reddit_clone.git
```

### Install packages

```shell
npm install
```

### .env file


```js
DATABASE_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

UPLOADTHING_SECRET=

REDIS_URL= 
REDIS_SECRET=
```

### Connect to PlanetScale and Push Prisma
```shell
npx prisma generate
npx prisma db push
```


### Start the app

```shell
npm run dev
```

## Author

👤 **Odaltoneric**

- GitHub: [@ndayishimiyeeric](https://github.com/ndayishimiyeeric)
- Twitter: [@odaltongain](https://twitter.com/odaltongain)
- LinkedIn: [Ndayishimiye Eric](https://linkedin.com/in/nderic)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## Show your support

Give a ⭐️ if you like this project!

## 📝 License

This project is [LICENSE](./LICENSE) licensed.
