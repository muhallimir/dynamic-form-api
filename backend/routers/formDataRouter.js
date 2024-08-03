import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Form from '../models/formModel.js';
import FormData from '../models/formDataModel.js';

const formDataRouter = express.Router();

// @route   GET /api/forms/data/:formId
// @desc    Get all submissions for a specific form
// @access  Public
formDataRouter.get(
    '/:formId',
    expressAsyncHandler(async (req, res) => {
        try {
            const { formId } = req.params;
            const data = await FormData.find({ formId });

            if (!data.length) {
                return res.status(404).json({ msg: 'No submissions found for this form' });
            }

            const response = {
                formId,
                data: data.map((item) => {
                    const additionalFields = item.additionalFields ? Object.fromEntries(item.additionalFields) : {};
                    return {
                        _id: item._id,
                        formId: item.formId,
                        name: item.name,
                        email: item.email,
                        ...additionalFields
                    };
                })
            };

            res.status(200).json(response);
        } catch (err) {
            res.status(500).send('Server Error');
        }
    })
);


// @route   POST /api/forms/data/:formId/submit
// @desc    Submit form data
// @access  Public
formDataRouter.post(
    '/:formId/submit',
    expressAsyncHandler(async (req, res) => {
        try {
            const { formId } = req.params;
            const form = await Form.findById(formId);

            if (!form) {
                return res.status(404).json({ msg: 'Form not found' });
            }

            const { name, email, ...additionalFields } = req.body;

            const newSubmission = new FormData({
                formId,
                name,
                email,
                additionalFields: new Map(Object.entries(additionalFields))
            });

            await newSubmission.save();

            res.status(201).json({ message: 'Form submitted successfully', submission: newSubmission });
        } catch (err) {
            res.status(500).send('Server Error', err.message);
        }
    })
);

// @route   PUT /api/forms/data/:formId/:dataId
// @desc    Update form data
// @access  Public
formDataRouter.put(
    '/:formId/:dataId',
    expressAsyncHandler(async (req, res) => {
        try {
            const { formId, dataId } = req.params;
            const { name, email, ...additionalFields } = req.body;

            const data = await FormData.findById(dataId);

            if (!data || data.formId.toString() !== formId) {
                return res.status(404).json({ message: 'Form data not found' });
            }

            data.name = name || data.name;
            data.email = email || data.email;
            data.additionalFields = new Map(Object.entries(additionalFields));

            const updatedData = await data.save();

            res.status(200).json({ message: 'Form data updated successfully', data: updatedData });
        } catch (err) {
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    })
);

// @route   POST /api/forms/data/:formId/seed
// @desc    Seed form submissions data
// @access  Public
formDataRouter.post(
    '/:formId/seed',
    expressAsyncHandler(async (req, res) => {
        try {
            const { formId } = req.params;

            const form = await Form.findById(formId);
            if (!form) {
                return res.status(404).json({ msg: 'Form not found' });
            }

            const seedData = [
                {
                    formId,
                    name: 'John Doe',
                    email: 'john.doe@example.com'
                },
                {
                    formId,
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com'
                },
                {
                    formId,
                    name: 'Alice Johnson',
                    email: 'alice.johnson@example.com'
                }
            ];

            await FormData.deleteMany({ formId });
            await FormData.insertMany(seedData);

            res.status(200).json({ message: 'Form submissions seeded successfully', data: seedData });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    })
);

export default formDataRouter;
