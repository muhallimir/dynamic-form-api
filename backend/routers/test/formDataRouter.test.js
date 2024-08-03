import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import formDataRouter from '../formDataRouter';
import Form from '../../models/formModel';
import FormData from '../../models/formDataModel';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/forms/data', formDataRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Form Data Routes', () => {
    let formId;
    let dataId;

    beforeEach(async () => {
        const form = new Form({ name: 'Test Form' });
        await form.save();
        formId = form._id;

        const seedData = [
            { formId, name: 'John Doe', email: 'john.doe@example.com' },
            { formId, name: 'Jane Smith', email: 'jane.smith@example.com' }
        ];

        await FormData.deleteMany({ formId }); // Ensure no old data exists
        const result = await FormData.insertMany(seedData);
        dataId = result[0]._id;
    });

    test('GET /api/forms/data/:formId - should return all submissions for a specific form', async () => {
        const response = await request(app).get(`/api/forms/data/${formId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('formId', formId.toString());
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data[0]).toHaveProperty('name');
        expect(response.body.data[0]).toHaveProperty('email');
    });

    test('POST /api/forms/data/:formId/submit - should submit form data', async () => {
        const response = await request(app)
            .post(`/api/forms/data/${formId}/submit`)
            .send({
                name: 'Alice Johnson',
                email: 'alice.johnson@example.com',
                extraField: 'extraValue'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Form submitted successfully');
        expect(response.body.submission).toHaveProperty('name', 'Alice Johnson');
        expect(response.body.submission).toHaveProperty('additionalFields');
    });

    test('PUT /api/forms/data/:formId/:dataId - should update form data', async () => {
        const response = await request(app)
            .put(`/api/forms/data/${formId}/${dataId}`)
            .send({
                name: 'John Updated',
                email: 'john.updated@example.com',
                updatedField: 'updatedValue'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Form data updated successfully');
        expect(response.body.data).toHaveProperty('name', 'John Updated');
        expect(response.body.data).toHaveProperty('additionalFields');
    });

    test('POST /api/forms/data/:formId/seed - should seed form submissions data', async () => {
        const response = await request(app).post(`/api/forms/data/${formId}/seed`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Form submissions seeded successfully');
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
    });
});
