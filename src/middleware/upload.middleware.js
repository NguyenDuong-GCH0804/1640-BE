import multer from'multer'
import uniqid from 'uniqid'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname == 'avatar') {
            cb(null, `public/avatar/${req.id}`);
        } else{
            cb(null, `public/idea/${req.id}`);
        }
    },
    filename: (req, file, cb) => {
        let uniqueImage = uniqid()+`-${file.originalname}`;
        if (file.fieldname != 'avatar') {
            uniqueImage = `${file.fieldname}-` +uniqid()+`-${file.originalname}`
        }
        cb(null, uniqueImage);
    }
})

export default multer({ storage: storage });

