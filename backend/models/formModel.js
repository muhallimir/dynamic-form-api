import mongoose from 'mongoose';

const FieldSchema = new mongoose.Schema({
    type: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String },
    required: { type: Boolean, default: false },
}, { timestamps: true });

const FormSchema = new mongoose.Schema({
    fields: [FieldSchema],
});

const Form = mongoose.model('Form', FormSchema);

export default Form;
