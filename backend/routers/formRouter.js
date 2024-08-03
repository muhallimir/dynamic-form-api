import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { check, validationResult } from 'express-validator';
import Form from '../models/formModel.js';

const formRouter = express.Router();

// @route   GET /api/forms
// @desc    Get all forms
// @access  Public
formRouter.get(
    '/',
    expressAsyncHandler(async (_, res) => {
        try {
            const forms = await Form.find();
            res.json(forms);
        } catch (err) {
            res.status(500).send('Server Error');
        }
    })
);

// @route   POST /api/forms/:id/fields
// @desc    Add a new field to the form
// @access  Public
formRouter.post(
    '/:id/fields',
    [
        check('label', 'Field label is required').not().isEmpty(),
        check('type', 'Field type is required').not().isEmpty(), // Validate type
    ],
    expressAsyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const form = await Form.findById(req.params.id);

            if (!form) {
                return res.status(404).json({ msg: 'Form not found' });
            }

            const newField = {
                type: req.body.type,
                label: req.body.label,
                value: req.body.value || '',
                required: req.body.required || false,
            };

            form.fields.push(newField);

            await form.save();

            res.json(form);
        } catch (err) {
            console.error('Error adding field:', err);
            res.status(500).send('Server Error');
        }
    })
);



// @route   DELETE /api/forms/:formId/fields/:fieldId
// @desc    Delete a field from an existing form
// @access  Public
formRouter.delete(
    '/:formId/fields/:fieldId',
    expressAsyncHandler(async (req, res) => {
        try {
            const form = await Form.findById(req.params.formId);

            if (!form) {
                return res.status(404).json({ msg: 'Form not found' });
            }

            const fieldId = req.params.fieldId;

            form.fields = form.fields.filter(field => field._id.toString() !== fieldId.toString());

            await form.save();

            res.json(form);
        } catch (err) {
            res.status(500).send('Server Error');
        }
    })
);



// @route   POST /api/forms/seed
// @desc    Seed initial form data
// @access  Public
formRouter.post(
    '/seed',
    expressAsyncHandler(async (_, res) => {
        try {
            const formData = {
                fields: [
                    { type: 'text', label: 'Name', value: '', required: true },
                    { type: 'email', label: 'Email', value: '', required: true },
                ],
            };

            const form = new Form(formData);
            await form.save();
            res.json({ message: 'Form data seeded successfully', form });
        } catch (err) {
            res.status(500).send('Server Error');
        }
    })
);

export default formRouter;
