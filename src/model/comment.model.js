import { mongoose } from 'mongoose';
const Schema = mongoose.Schema;

const comment = new Schema({
    content: { type: String, min: 1},
    category: { type: Schema.Types.ObjectId, ref: 'category' },
    user: { type: Schema.Types.ObjectId, ref: 'users'},
    private: {type: Boolean, default: false},
    idea: { type: Schema.Types.ObjectId, ref: 'ideas'}
},{
    timestamps : { currentTime: () => Math.floor(Date.now()) }
})

export default mongoose.model('comments', comment)