// start by importing the Application and Router objects from Oak:
import { Application, Router } from 'https://deno.land/x/oak/mod.ts';

// then we get the environment variables PORT and HOST:
const env = Deno.env.toObject();
const PORT = env.PORT || 4000;
const HOST = env.HOST || '127.0.0.1';

// define an interface for a dog, then we declare an initial dogs array of Dog objects:
interface Dog {
    name: string;
    age: number;
}
let dogs: Array<Dog> = [
    {
        name: 'Roger',
        age: 8,
    },
    {
        name: 'Syd',
        age: 7,
    },
];

// Starting from GET /dogs , which returns the list of all the dogs:
export const getDogs = ({ response }: { response: any }) => {
    response.body = dogs;
};

// here's how we can retrieve a single dog by name:
export const getDog = ({
    params,
    response,
}: {
    params: {
        name: string;
    };
    response: any;
}) => {
    const dog = dogs.filter((dog) => dog.name === params.name);
    if (dog.length) {
        response.status = 200;
        response.body = dog[0];
        return;
    }

    response.status = 400;
    response.body = { msg: `Cannot find dog ${params.name}` };
};

// Here is how we add a new dog:
export const addDog = async ({
    request,
    response,
}: {
    request: any;
    response: any;
}) => {
    const body = await request.body();
    const dog: Dog = body.value;
    dogs.push(dog);

    response.body = { msg: 'OK' };
    response.status = 200;
};

// Here's how we update a dog's age:
export const updateDog = async ({
    params,
    request,
    response,
}: {
    params: {
        name: string;
    };
    request: any;
    response: any;
}) => {
    const temp = dogs.filter((existingDog) => existingDog.name === params.name);
    const body = await request.body();
    const { age }: { age: number } = body.value;

    if (temp.length) {
        temp[0].age = age;
        response.status = 200;
        response.body = { msg: 'OK' };
        return;
    }

    response.status = 400;
    response.body = {
        msg: `Cannot find dog
    ${params.name}`,
    };
};

// and here is how we can remove a dog from our list:
export const removeDog = ({
    params,
    response,
}: {
    params: {
        name: string;
    };
    response: any;
}) => {
    const lengthBefore = dogs.length;
    dogs = dogs.filter((dog) => dog.name !== params.name);

    if (dogs.length === lengthBefore) {
        response.status = 400;
        response.body = { msg: `Cannot find dog ${params.name}` };
        return;
    }

    response.body = { msg: 'OK' };
    response.status = 200;
};

// Now we create the Oak app and we start it:
const router = new Router();
// After you create the router, let's add some functions that will be invoked any time one of those endpoints is hit:
router
    .get('/dogs', getDogs)
    .get('/dogs/:name', getDog)
    .post('/dogs', addDog)
    .put('/dogs/:name', updateDog)
    .delete('/dogs/:name', removeDog);

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening on port ${PORT} 🔥`);

await app.listen(`${HOST}:${PORT}`);
