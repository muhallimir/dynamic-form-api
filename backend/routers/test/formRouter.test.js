import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import formRouter from '../formRouter';
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/forms', formRouter);

beforeAll(async () => {
    // Connect to MongoDB before running tests
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    // Disconnect from MongoDB after tests
    await mongoose.connection.close();
});

describe('Form Routes', () => {
    let formId;

    test('GET /api/forms - should return all forms', async () => {
        const response = await request(app).get('/api/forms');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test('POST /api/forms/seed - should seed initial form data', async () => {
        const response = await request(app).post('/api/forms/seed');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Form data seeded successfully');
        expect(response.body.form).toHaveProperty('fields');
        formId = response.body.form._id; // Save formId for future tests
    });

    test('POST /api/forms/:id/fields - should add a new field to the form', async () => {
        const response = await request(app)
            .post(`/api/forms/${formId}/fields`)
            .send({
                label: 'Test Field',
                type: 'text',
                value: 'Test Value',
                required: true,
            });
        expect(response.status).toBe(200);
        expect(response.body.fields).toHaveLength(3); // Assuming the seeded form had 2 fields
        expect(response.body.fields[2]).toHaveProperty('label', 'Test Field');
    });

    test('DELETE /api/forms/:formId/fields/:fieldId - should delete a field from the form', async () => {
        // Add a field to delete
        const addResponse = await request(app)
            .post(`/api/forms/${formId}/fields`)
            .send({
                label: 'Field to Delete',
                type: 'text',
            });
        const fieldId = addResponse.body.fields.find(field => field.label === 'Field to Delete')._id;

        // Delete the field
        const response = await request(app).delete(`/api/forms/${formId}/fields/${fieldId}`);
        expect(response.status).toBe(200);
        expect(response.body.fields).not.toContainEqual(expect.objectContaining({ _id: fieldId }));
    });
});
