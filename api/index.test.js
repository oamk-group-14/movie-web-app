import 'dotenv/config';
import { expect } from 'chai';
import request from 'supertest';

const base_url = "http://localhost:3000";

describe('Automated tests', () => {

    const testUser = {
        email: `testi_${Math.floor(Math.random() * 100000)}@example.com`,
        password: 'Salasana123'
    };

    let createUserId = null;
    let userToken = null;
    let pool = null

    before(async () => {
        console.log('--- Starting all tests ---');
        const dbModule = await import ('./models/db.js');
        pool = dbModule.pool;

        const regRes = await request(base_url)
            .post('/api/auth/register')
            .send(testUser);

        if (regRes.body && regRes.body.user){
            createUserId = regRes.body.user.user_id
        }

        const loginRes = await request(base_url)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password});

        userToken = loginRes.body.token;

    });

    after( () => {

        console.log('--- All tests completed ---');
    });

    describe('Registration', () => {

        //Negative test
        it('POST /api/auth/registration - User already exists', async () => {
            
            const res = await request(base_url)
            .post('/api/auth/register')
            .send(testUser);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message');
        });

        //Negative test
        it('POST /api/auth/register - Should fail if email or password are empty', async () => {
            const res = await request(base_url)
                .post('/api/auth/register')
                .send({email: '', password: '' });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message');
            console.log(res.body);
        });

        //Negative test
        it('POST /api/auth/register - Should fail if password is too weak', async () => {
            const res = await request(base_url)
                .post('/api/auth/register')
                .send({
                    email: `kauttaja_${Math.floor(Math.random() * 10000)}@example.com`,  
                    password: 'salasana' });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message');
            console.log(res.body);
        });
        
    });

    describe('Login', () => {

        //Positive test
        it('POST /api/auth/login - Should login and return token', async() => {
            const res = await request(base_url)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password});

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');

            userToken = res.body.token;
            console.log(res.body);
        });
    });

    describe('Get reviews', () => {

        // Positive test - Movies
        it('GET /api/reviews/media/:id/type/:media_type, Get reviews', async() => {
            const res = await request(base_url)
            .get('/api/reviews/media/108978/type/movie');

            expect(res.status).to.equal(200);

            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('message');
            expect(res.body.data).to.be.an('array');

            if (res.body.data.length > 0){
                expect(res.body.message).to.equal('Review fetched successfully');
            } else {
                expect(res.body.message).to.equal('No reviews found');
            }
            console.log(res.body);

        });

        //Positive test - tv-shows
        it('GET /api/reviews/media/:id/type/:media_type, Get reviews', async() => {
            const res = await request(base_url)
            .get('/api/reviews/media/2732/type/tv');

            expect(res.status).to.equal(200);

            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('message');
            expect(res.body.data).to.be.an('array');

            if (res.body.data.length > 0){
                expect(res.body.message).to.equal('Review fetched successfully');
            } else {
                expect(res.body.message).to.equal('No reviews found');
            }
            console.log(res.body);

        });



        //Negative test

        it('GET /api/reviews/media/:id/type/:media_type, - Should fail with invalid media type', async() => {
            const res = await request(base_url)
            .get('/api/reviews/media/550/type/');

            expect(res.status).to.equal(404);
            console.log(res.body);
        });
    });


    describe('Deleting registration', () => {

        //Positive test
        it('DELETE /api/users/me - Delete user and all of the users data', async () => {
            const res = await request(base_url)
            .delete('/api/users/me')
            .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(204);
            console.log(res.body);
        });

        //Negative test
        it('DELETE /api/users/me - Cannot delete user, invalid token', async () => {
            const res = await request(base_url)
            .delete('/api/users/me')
            .set('Authorization', `Bearer`);

            expect(res.status).to.equal(401);
            console.log(res.body);
        });
    });

})
