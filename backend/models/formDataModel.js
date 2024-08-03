import mongoose from 'mongoose';

const FormDataSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Form' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    additionalFields: { type: Map, of: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const FormData = mongoose.model('FormData', FormDataSchema);

export default FormData;
